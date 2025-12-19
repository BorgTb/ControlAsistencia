# 🔒 Implementación de Cookies HTTP-Only para Seguridad

## ✅ Cambios Implementados

Se ha migrado el sistema de autenticación de **localStorage** a **cookies HTTP-only** con **sistema de refresh tokens** para mejorar significativamente la seguridad contra ataques XSS (Cross-Site Scripting) y permitir sesiones persistentes de 30 días.

### 📋 Resumen de Cambios

#### Backend

1. **Instalado cookie-parser**
   ```bash
   npm install cookie-parser
   ```

2. **Backend/index.js**
   - Agregado `import cookieParser from 'cookie-parser'`
   - Configurado CORS con `credentials: true`
   - Agregado middleware `app.use(cookieParser())`

3. **Backend/services/authservice.js**
   - Nueva función `generateAccessToken(user, empresa_id)` - genera access token (15 minutos)
   - Nueva función `generateRefreshToken(user)` - genera refresh token (30 días)
   - Nueva función `verifyRefreshToken(token)` - valida refresh token
   - Nueva función `setAuthCookies(res, accessToken, refreshToken)` - establece ambas cookies HTTP-only
   - Nueva función `clearAuthCookies(res)` - limpia ambas cookies
   - Cookies configuradas con:
     - `httpOnly: true` - No accesible desde JavaScript
     - `secure: true` en producción - Solo HTTPS
     - `sameSite: 'strict'` - Protección CSRF
     - Access token: `maxAge: 15 * 60 * 1000` (15 minutos)
     - Refresh token: `maxAge: 30 * 24 * 60 * 60 * 1000` (30 días)

4. **Backend/model/RefreshTokenModel.js** [NUEVO]
   - Modelo completo para gestión de refresh tokens
   - `create()` - guarda refresh token en base de datos
   - `findValidToken()` - valida token (no revocado, no expirado)
   - `revoke()` - revoca token específico (logout)
   - `revokeAllByUser()` - revoca todos los tokens del usuario
   - `deleteExpired()` - limpieza de tokens expirados
   - `getActiveTokensByUser()` - lista sesiones activas

5. **Backend/controllers/LoginController.js**
   - Modificado `login()` - genera access y refresh token, almacena refresh token en DB
   - Modificado `logout()` - revoca refresh token en DB y limpia ambas cookies
   - Nuevo método `refresh()` - endpoint para renovar access token usando refresh token
   - Los tokens ya NO se envían en la respuesta JSON

6. **Backend/middleware/AuthMiddleWare.js**
   - Prioriza lectura de token desde cookie (`req.cookies.accessToken`)
   - Valida que sea access token (no refresh token)
   - Retorna `requiresRefresh: true` en error 401 por expiración
   - Mantiene fallback a header Authorization para compatibilidad

7. **Backend/routes/AuthRoutes.js**
   - Nueva ruta `POST /auth/refresh` - endpoint para renovar access token

8. **Backend/database/refresh_tokens_table.sql** [NUEVO]
   - Script SQL para crear tabla `refresh_tokens`
   - Almacena tokens con metadatos (IP, user-agent, expiración)
   - Índices optimizados para búsquedas rápidas

#### Frontend

1. **Frontend/src/stores/authStore.js**
   - **ELIMINADO** `token` del estado
   - **ELIMINADO** método `setToken()`
   - **ELIMINADO** getter `getToken`
   - Solo se persiste `user` en localStorage
   - `isAuthenticated` ahora basado en `user` en lugar de `token`

2. **Frontend/src/services/Authservices.js**
   - Agregado `withCredentials: true` a axios config
   - ELIMINADO interceptor que agregaba header Authorization

3. **Frontend/src/config/axios-config.js**
   - Interceptor de respuesta mejorado con auto-refresh
   - Detecta error 401 con `requiresRefresh: true`
   - Llama automáticamente a `/auth/refresh`
   - Reintenta petición original con nuevo access token
   - Previene múltiples refresh simultáneos con flag `_retry`
   - Método `login()` ya NO almacena token
   - Método `logout()` llama al endpoint para limpiar cookie

3. **Todos los demás servicios actualizados:**
   - AdminService.js
   - AsistenciaService.js
   - AuditoriaService.js
   - diasTrabajadosService.js
   - documentoService.js
   - EmpresaService.js
   - EstServices.js
   - feriadosService.js
   - justificacionesService.js
   - LugarService.js
   - ReportesService.js
   - SolicitudesGeneralesService.js
   - SolicitudesService.js

**Para axios:** `withCredentials: true`
**Para fetch:** `credentials: 'include'`

---

## 🔧 Configuración Necesaria

### Variables de Entorno

#### Backend (.env)
```env
NODE_ENV=production  # En producción
NODE_ENV=development # En desarrollo local

FRONTEND_URL=http://localhost:5173  # En desarrollo
FRONTEND_URL=https://tu-dominio.com # En producción

SECRET_KEY=tu_clave_secreta_jwt
SERVER_PORT=3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api  # En desarrollo
VITE_API_URL=https://api.tu-dominio.com/api # En producción
```

---

## 🚀 Ventajas de esta Implementación

### ✅ Seguridad Mejorada
- **Protección XSS**: Las cookies HTTP-only no son accesibles desde JavaScript del navegador
- **Protección CSRF**: Configuración `sameSite: 'strict'`
- **HTTPS Only**: En producción, cookies solo se envían por HTTPS

### ✅ Simplicidad
- No necesitas manejar tokens manualmente en el frontend
- Las cookies se envían automáticamente con cada request
- Menos código para mantener

### ✅ Compatibilidad
- Mantiene fallback a Authorization header para APIs externas
- Compatible con aplicaciones móviles que usen el header

---

## 🔍 Cómo Funciona

### Flujo de Login

1. **Usuario envía credenciales** → POST `/api/auth/login`
2. **Backend verifica credenciales** → Genera JWT
3. **Backend establece cookie HTTP-only** → `Set-Cookie: authToken=...`
4. **Frontend recibe datos del usuario** (sin token en JSON)
5. **Frontend almacena usuario en localStorage** (NO el token)

### Flujo de Request Autenticado

1. **Frontend hace request** con `withCredentials: true`
2. **Navegador envía cookie automáticamente** → `Cookie: authToken=...`
3. **Middleware lee cookie** → Verifica JWT
4. **Request procesado** con usuario autenticado

### Flujo de Logout

1. **Usuario cierra sesión** → POST `/api/auth/logout`
2. **Backend limpia cookie** → `Set-Cookie: authToken=; Max-Age=0`
3. **Frontend limpia localStorage** → Elimina datos del usuario
4. **Redirección a login**

---

## 🧪 Pruebas

### Verificar que las cookies funcionan

1. **Login exitoso:**
   ```javascript
   // En DevTools → Application → Cookies
   // Deberías ver: authToken con HttpOnly ✓
   ```

2. **Request autenticado:**
   ```javascript
   // En DevTools → Network → Headers
   // Request Headers debe incluir: Cookie: authToken=...
   // NO debe tener: Authorization: Bearer ...
   ```

3. **Logout exitoso:**
   ```javascript
   // Después de logout, la cookie debe desaparecer
   // DevTools → Application → Cookies → authToken debe estar vacía
   ```

---

## ⚠️ Consideraciones Importantes

### Desarrollo Local

- En desarrollo (`NODE_ENV=development`), `secure: false` permite cookies por HTTP
- El frontend y backend deben estar en el mismo dominio o configurar CORS correctamente
- Usa `http://localhost:3000` y `http://localhost:5173` (mismo host)

### Producción

- **HTTPS es OBLIGATORIO** - Las cookies con `secure: true` solo funcionan en HTTPS
- Configura correctamente el dominio en CORS
- Considera usar un mismo dominio o subdominio (ej: `app.tudominio.com` y `api.tudominio.com`)
- Configura certificados SSL válidos

### CORS

El backend DEBE tener:
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true // ¡CRUCIAL!
}));
```

El frontend DEBE tener:
```javascript
// Axios
withCredentials: true

// Fetch
credentials: 'include'
```

---

## 🔄 Migración de Usuarios Existentes

Si ya tienes usuarios con tokens en localStorage:

1. **Los tokens existentes dejarán de funcionar** tras el deploy
2. **Los usuarios deberán hacer login nuevamente**
3. **Opcional:** Crear un script de migración que detecte tokens viejos y fuerce re-login

---

## 📚 Recursos Adicionales

- [OWASP - HttpOnly Cookie](https://owasp.org/www-community/HttpOnly)
- [MDN - HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

## 🐛 Troubleshooting

### ❌ "Access denied. No token provided"

**Causa:** Cookie no se está enviando
**Solución:** 
- Verifica `withCredentials: true` en frontend
- Verifica `credentials: true` en CORS backend
- Verifica que estés en el mismo dominio (o configurado correctamente)

### ❌ Cookie no aparece en DevTools

**Causa:** Backend no está estableciendo la cookie
**Solución:**
- Verifica que `AuthService.setAuthCookie()` se llama en login
- Verifica que `cookie-parser` esté instalado e importado
- Revisa logs del servidor

### ❌ Cookie se envía pero es rechazada

**Causa:** Token expirado o inválido
**Solución:**
- Verifica que `SECRET_KEY` sea la misma en todas partes
- Verifica que el token no haya expirado (1 hora por defecto)
- Prueba hacer login nuevamente

---

**Última actualización:** 16 de Diciembre, 2024
**Autor:** Implementación de seguridad mejorada
