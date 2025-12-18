# 🔄 SISTEMA DE REFRESH TOKENS - RESUMEN TÉCNICO

## 📋 Descripción General

Se ha implementado un sistema de **refresh tokens** que permite sesiones persistentes de **30 días**, similar a Gmail, Facebook, etc. Los usuarios ya no necesitan hacer login cada vez que cierran el navegador.

---

## 🏗️ Arquitectura del Sistema

### **Dual-Token Strategy**

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                    │
└─────────────────────────────────────────────────────────────┘

1. LOGIN
   Usuario ingresa credenciales
   ↓
   Backend genera 2 tokens:
   - Access Token (15 minutos)  → Para peticiones normales
   - Refresh Token (30 días)    → Para renovar access token
   ↓
   Ambos se envían como cookies HTTP-only

2. PETICIONES NORMALES
   Frontend hace petición → Access token se envía automáticamente
   ↓
   ✅ Token válido → Respuesta exitosa
   ❌ Token expirado → Error 401 con requiresRefresh: true

3. AUTO-REFRESH (transparente para el usuario)
   Interceptor detecta requiresRefresh
   ↓
   POST /api/auth/refresh (envía refresh token)
   ↓
   Backend valida refresh token en DB
   ↓
   Genera nuevo access token (15 min)
   ↓
   Reintenta petición original → Éxito

4. LOGOUT
   POST /api/auth/logout
   ↓
   Backend revoca refresh token en DB
   ↓
   Limpia ambas cookies
```

---

## 🔐 Seguridad Implementada

### **Capas de Protección**

| Capa | Implementación | Propósito |
|------|----------------|-----------|
| **HTTP-Only** | Cookies inaccesibles desde JS | Previene XSS |
| **SameSite=Strict** | Cookie solo para mismo dominio | Previene CSRF |
| **Secure Flag** | Solo HTTPS en producción | Previene MITM |
| **Database Revocation** | Tokens en DB con flag `revoked` | Logout inmediato |
| **Expiration Tracking** | Campo `expires_at` en DB | Limpieza automática |
| **IP & User-Agent** | Registro de sesión | Auditoría de accesos |
| **Token Type** | Campo `type: 'access'|'refresh'` | Previene uso incorrecto |

---

## 📁 Archivos Modificados/Creados

### **Backend**

```
Backend/
├── model/
│   └── RefreshTokenModel.js         [NUEVO] CRUD para refresh tokens
├── services/
│   └── authservice.js                [MODIFICADO] Funciones dual-token
├── controllers/
│   └── LoginController.js            [MODIFICADO] Login/logout/refresh
├── middleware/
│   └── AuthMiddleWare.js             [MODIFICADO] Detecta tipo de token
├── routes/
│   └── AuthRoutes.js                 [MODIFICADO] Nueva ruta /refresh
└── database/
    └── refresh_tokens_table.sql      [NUEVO] Script de creación tabla
```

### **Frontend**

```
Frontend/src/
└── config/
    └── axios-config.js               [MODIFICADO] Interceptor auto-refresh
```

---

## 💾 Base de Datos

### **Tabla: refresh_tokens**

```sql
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,              -- FK a usuarios
    token TEXT NOT NULL,               -- Refresh token JWT
    expires_at DATETIME NOT NULL,      -- 30 días desde creación
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,     -- Para logout manual
    ip_address VARCHAR(45),            -- IP de la sesión
    user_agent TEXT,                   -- Navegador/dispositivo
    
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_revoked (revoked),
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

**Ejecutar**: `Backend/database/refresh_tokens_table.sql`

---

## 🔧 Funciones Principales

### **Backend - authservice.js**

```javascript
// Genera access token (15 minutos)
generateAccessToken(user, empresa_id)

// Genera refresh token (30 días)
generateRefreshToken(user)

// Verifica refresh token JWT
verifyRefreshToken(token)

// Establece ambas cookies
setAuthCookies(res, accessToken, refreshToken)

// Limpia ambas cookies
clearAuthCookies(res)
```

### **Backend - RefreshTokenModel.js**

```javascript
// Guarda refresh token en DB
create(userId, token, expiresAt, ipAddress, userAgent)

// Valida token en DB (no revocado, no expirado, usuario activo)
findValidToken(token)

// Revoca token específico (logout)
revoke(token)

// Revoca todos los tokens de un usuario
revokeAllByUser(userId)

// Limpia tokens expirados (job programado)
deleteExpired()

// Lista sesiones activas del usuario
getActiveTokensByUser(userId)
```

### **Backend - LoginController.js**

```javascript
// Login: genera y almacena ambos tokens
async login(req, res)

// Logout: revoca refresh token y limpia cookies
async logout(req, res)

// Refresh: valida refresh token y genera nuevo access token
async refresh(req, res)
```

---

## 🚀 Flujo de Implementación

### **Paso 1: Crear tabla en Base de Datos**

```bash
mysql -u tu_usuario -p tu_database < Backend/database/refresh_tokens_table.sql
```

### **Paso 2: Configurar variables de entorno**

```bash
# Backend/.env
SECRET_KEY=tu_clave_secreta_super_segura
NODE_ENV=production  # Para habilitar cookie secure
FRONTEND_URL=https://tu-dominio.com
```

### **Paso 3: Reiniciar servidor**

```bash
cd Backend
npm restart
```

### **Paso 4: Probar el flujo**

1. **Login**: Verificar que se establezcan 2 cookies
   - `accessToken` (15 min)
   - `refreshToken` (30 días)

2. **Esperar 15 minutos** (o forzar expiración cambiando tiempo)

3. **Hacer petición**: Debería auto-renovarse sin redirigir a login

4. **Verificar en DB**: 
   ```sql
   SELECT * FROM refresh_tokens WHERE user_id = X;
   ```

---

## 📊 Monitoreo y Mantenimiento

### **Job de Limpieza (Recomendado)**

Programar tarea diaria para eliminar tokens expirados:

```javascript
// Backend/jobs/CleanupRefreshTokens.js
import RefreshTokenModel from '../model/RefreshTokenModel.js';
import cron from 'node-cron';

// Ejecutar todos los días a las 3 AM
cron.schedule('0 3 * * *', async () => {
    const deleted = await RefreshTokenModel.deleteExpired();
    console.log(`🧹 Limpieza: ${deleted} refresh tokens expirados eliminados`);
});
```

### **Auditoría de Sesiones**

```sql
-- Sesiones activas por usuario
SELECT u.email, COUNT(*) as sesiones_activas
FROM refresh_tokens rt
JOIN usuarios u ON rt.user_id = u.id
WHERE rt.revoked = FALSE AND rt.expires_at > NOW()
GROUP BY u.email;

-- Sesiones por dispositivo
SELECT user_agent, ip_address, created_at
FROM refresh_tokens
WHERE user_id = X AND revoked = FALSE
ORDER BY created_at DESC;
```

---

## ⚠️ Consideraciones de Seguridad

### **Qué HACER**

✅ Usar HTTPS en producción (obligatorio para cookies secure)  
✅ Validar refresh token en DB antes de generar access token  
✅ Revocar refresh token en logout  
✅ Implementar rate limiting en `/auth/refresh`  
✅ Registrar IP y user-agent para auditoría  
✅ Limpiar tokens expirados regularmente  

### **Qué NO HACER**

❌ No almacenar refresh tokens en localStorage/sessionStorage  
❌ No exponer refresh tokens en URLs o logs  
❌ No usar el mismo secret para access y refresh tokens (opcional mejora)  
❌ No permitir múltiples refreshes simultáneos sin control  
❌ No confiar solo en JWT, validar siempre en DB  

---

## 🐛 Troubleshooting

### **"Token refreshed but still getting 401"**
- Verificar que el nuevo access token tenga `type: 'access'`
- Revisar que AuthMiddleware acepte cookies

### **"Refresh loop - infinite redirects"**
- Verificar que `originalRequest._retry = true` esté presente
- Revisar que no haya múltiples interceptores compitiendo

### **"Refresh token not found in DB"**
- Verificar que la tabla `refresh_tokens` exista
- Revisar que el login esté guardando el token con `RefreshTokenModel.create()`

### **"Cookies not being sent"**
- Verificar `withCredentials: true` en axios
- Verificar CORS `credentials: true` en backend
- Verificar que frontend y backend estén en el mismo dominio (o subdominios)

---

## 📈 Ventajas del Sistema Implementado

1. **UX Mejorada**: Usuarios no tienen que loguearse constantemente
2. **Seguridad**: Tokens de corta duración + revocación en DB
3. **Transparente**: Auto-refresh sin intervención del usuario
4. **Auditable**: Registro de IPs y dispositivos
5. **Escalable**: Fácil agregar logout de todas las sesiones
6. **Estándar**: Sigue best practices de OAuth 2.0

---

## 📚 Próximos Pasos Recomendados

1. **Implementar rate limiting** en `/auth/refresh` (max 10 intentos/hora)
2. **Notificaciones**: Avisar al usuario de nuevas sesiones
3. **Panel de sesiones**: Mostrar dispositivos activos al usuario
4. **Logout remoto**: Permitir cerrar sesión desde otros dispositivos
5. **Rotación de tokens**: Generar nuevo refresh token en cada refresh (opcional)

---

## 📞 Soporte

Si tienes dudas sobre la implementación, revisa:
- [SEGURIDAD_COOKIES.md](./SEGURIDAD_COOKIES.md) - Documentación de cookies
- [Backend/database/refresh_tokens_table.sql](./Backend/database/refresh_tokens_table.sql) - Script SQL
- [Backend/model/RefreshTokenModel.js](./Backend/model/RefreshTokenModel.js) - Modelo comentado

---

**Última actualización**: Diciembre 2024  
**Estado**: ✅ Implementado - Listo para producción tras crear tabla DB
