# ✅ Sesiones Persistentes - Configuración Completa

## 🎯 ¿Qué Hace Este Sistema?

**El usuario permanece logueado INDEFINIDAMENTE hasta que cierre sesión manualmente.**

Similar a Gmail, Facebook, Netflix:
- ✅ Login una sola vez
- ✅ Sesión permanece activa por meses/años
- ✅ Solo expira si el usuario NO usa la app por 6 meses
- ✅ Cierra sesión solo cuando el usuario lo decide

---

## 🔄 Cómo Funciona

### **Mecanismo de Rotación de Tokens**

```
Login → Access Token (15m) + Refresh Token (180 días)
  ↓
Cada 13 minutos (automático):
  1. Access Token se renueva (15m nuevos)
  2. Refresh Token se ROTA (180 días NUEVOS)
  3. Token anterior se revoca
  ↓
Resultado: Sesión NUNCA expira mientras uses la app
```

### **Tabla de Comportamiento**

| Acción del Usuario | Comportamiento del Sistema |
|-------------------|---------------------------|
| Usa la app diariamente | ✅ Sesión activa indefinidamente |
| Usa la app cada semana | ✅ Sesión activa indefinidamente |
| Usa la app cada mes | ✅ Sesión activa indefinidamente |
| NO usa por 180+ días | ❌ Sesión expira (debe hacer login) |
| Hace logout | ❌ Sesión termina inmediatamente |

---

## 📁 Archivos Modificados

### **Backend**

1. **authservice.js**
   - Refresh Token: 30d → **180d**
   - Cookie duración: 30d → **180d**

2. **LoginController.js**
   - Login: Guarda token con 180 días
   - **Refresh: ROTA el token** (genera nuevo cada vez)

3. **RefreshTokenModel.js**
   - Nuevos métodos de estadísticas
   - Métodos de conteo de tokens

4. **index.js**
   - Job de limpieza automática (cada 24h)

### **Nuevos Archivos**

5. **CleanupRefreshTokens.js** (nuevo)
   - Limpia tokens expirados automáticamente
   - Estadísticas de tokens

6. **SESIONES_PERSISTENTES_INDEFINIDAS.md** (documentación)
   - Guía completa del sistema

---

## 🚀 Cómo Usar

### **1. Reiniciar el Servidor**

```bash
cd Backend
npm start
```

Verás:
```
Server is running on port 3000
✅ Job de limpieza de refresh tokens iniciado
🧹 Iniciando limpieza de refresh tokens expirados...
✅ Limpieza completada: 0 tokens expirados eliminados
```

### **2. El Usuario Hace Login**

El frontend NO cambia nada, todo es automático:

```javascript
// Usuario hace login normalmente
await authService.login({ email, password });
```

Backend guarda:
- Access Token: 15 minutos
- Refresh Token: **180 días** (6 meses)

### **3. Usuario Usa la App (Automático)**

Cada 13 minutos (antes de que expire el access token):
```
Frontend (automático):
  🔄 Token expira en 2 minutos, renovando...
  ✅ Token renovado proactivamente

Backend (automático):
  🔄 Rotando refresh token...
  ✅ Nuevo refresh token generado (180 días frescos)
  ✅ Token anterior revocado
```

### **4. Usuario Cierra Sesión**

```javascript
// Usuario hace logout
await authService.logout();
```

Backend:
- ❌ Revoca el refresh token en BD
- ❌ Limpia las cookies
- ✅ Sesión terminada

---

## 🧪 Pruebas

### **Prueba 1: Sesión Persistente**

```bash
1. Hacer login
2. Abrir consola del navegador (F12)
3. Esperar 13 minutos
4. Hacer cualquier acción
5. Ver en consola:
   🔄 Token expira en 120s, renovando proactivamente...
   ✅ Token renovado proactivamente
6. ✅ ÉXITO: Sesión continúa sin problemas
```

### **Prueba 2: Cerrar y Abrir Navegador**

```bash
1. Hacer login
2. Cerrar navegador completamente
3. Esperar 1 hora
4. Abrir navegador de nuevo
5. Ir a la app
6. ✅ ÉXITO: Sigue logueado (cookies persistentes)
```

### **Prueba 3: Logout Efectivo**

```bash
1. Hacer login
2. Hacer logout
3. Intentar acceder a rutas protegidas
4. ✅ ÉXITO: Redirige a login
```

### **Prueba 4: Múltiples Dispositivos**

```bash
1. Login en PC
2. Login en móvil
3. Trabajar en ambos
4. ✅ ÉXITO: Sesiones independientes
5. Logout en PC
6. ✅ ÉXITO: Móvil sigue funcionando
```

---

## 📊 Monitoreo

### **Ver Sesiones Activas de un Usuario**

```javascript
import RefreshTokenModel from './model/RefreshTokenModel.js';

const sessions = await RefreshTokenModel.getActiveTokensByUser(123);
console.log(sessions);
/*
[
  {
    ip_address: "192.168.1.100",
    user_agent: "Chrome 120.0 Windows",
    created_at: "2025-12-22 14:30:00",
    expires_at: "2026-06-20 14:30:00"  // 180 días después
  },
  {
    ip_address: "10.0.0.50",
    user_agent: "Safari 17.0 iPhone",
    created_at: "2025-12-22 15:00:00",
    expires_at: "2026-06-20 15:00:00"
  }
]
*/
```

### **Estadísticas Globales**

```javascript
import { getTokenStats } from './jobs/CleanupRefreshTokens.js';

const stats = await getTokenStats();
console.log(stats);
/*
{
  active: 1523,    // Usuarios con sesión activa
  expired: 34,     // Tokens expirados (se limpiarán)
  revoked: 891,    // Logout/cerradas
  total: 2448
}
*/
```

---

## 🔒 Seguridad

### **✅ Mejoras de Seguridad Implementadas**

1. **Rotación de Tokens**
   - Cada token solo se usa UNA vez
   - Token usado = Token revocado
   - Imposible reusar tokens robados

2. **Validación en Base de Datos**
   - Cada refresh verifica en BD
   - Token revocado = Sesión inválida
   - Usuario desactivado = Sesión inválida

3. **Cookies HttpOnly**
   - No accesibles desde JavaScript
   - Protección contra XSS
   - SameSite=Strict (protección CSRF)

4. **Auditoría Completa**
   - Se registra IP de cada sesión
   - Se registra dispositivo (user agent)
   - Se registra fecha de creación
   - Se puede rastrear actividad sospechosa

---

## ⚙️ Configuración

### **Tiempos Configurables**

```javascript
// Backend/services/authservice.js
ACCESS_TOKEN:  '15m'   // Access token dura 15 minutos
REFRESH_TOKEN: '180d'  // Refresh token dura 180 días

// Frontend/config/axios-config.js
RENEWAL_THRESHOLD: 2 * 60 * 1000  // Renovar si quedan < 2 minutos
```

### **Ajustar para Diferentes Entornos**

| Entorno | Access | Refresh | Threshold |
|---------|--------|---------|-----------|
| **Producción** | 15m | 180d | 2 min |
| **Desarrollo** | 15m | 180d | 2 min |
| **Testing** | 2m | 7d | 30s |

---

## 🎨 Ventajas vs Desventajas

### **✅ Ventajas**

- Usuario nunca tiene que volver a hacer login
- Experiencia fluida y sin interrupciones
- Funciona en múltiples dispositivos
- Seguridad mejorada con rotación
- Auditoría completa de sesiones

### **⚠️ Consideraciones**

- Tokens en BD crecen (limpieza automática cada 24h)
- Si roban el dispositivo, sesión activa hasta logout
  - Solución: Permitir cerrar sesiones remotas
- Más complejo que sesiones de 30 días
  - Pero más seguro y mejor UX

---

## 🆘 Troubleshooting

### **Problema: Sesión expira cada 30 días**

**Causa**: No se implementó la rotación correctamente.

**Solución**: Verificar que el endpoint de refresh genere NUEVO refresh token:
```javascript
// LoginController.js línea ~230
const newRefreshToken = AuthService.generateRefreshToken(user);
await RefreshTokenModel.create(user.id, newRefreshToken, ...);
```

### **Problema: "Refresh token not found or revoked"**

**Causa**: Token no se encuentra en BD o fue revocado.

**Solución**: 
1. Verificar tabla `refresh_tokens` existe
2. Hacer logout y login de nuevo
3. Verificar logs del servidor

### **Problema: Usuario debe hacer login cada día**

**Causa**: Cookie no es persistente.

**Solución**: Verificar `maxAge` en setAuthCookies:
```javascript
maxAge: 180 * 24 * 60 * 60 * 1000  // Debe ser 180 días
```

---

## 📝 Checklist de Implementación

- [x] authservice.js - Refresh token 180 días
- [x] LoginController.js - Rotación en refresh
- [x] RefreshTokenModel.js - Métodos de estadísticas
- [x] CleanupRefreshTokens.js - Job de limpieza
- [x] index.js - Iniciar job al arrancar
- [x] axios-config.js - Renovación proactiva
- [x] Tabla refresh_tokens en BD

---

## 🎯 Resultado Final

**Usuario hace login UNA VEZ y permanece logueado PARA SIEMPRE.**

- ✅ Sin re-login mensual
- ✅ Sin interrupciones
- ✅ Seguridad mejorada
- ✅ Auditoría completa
- ✅ Múltiples dispositivos

**Mientras el usuario USE la app, la sesión NUNCA expira.**

---

**Última actualización**: Diciembre 22, 2025  
**Estado**: ✅ Listo para Producción  
**Versión**: 3.0
