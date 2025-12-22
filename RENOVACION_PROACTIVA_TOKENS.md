# 🔄 Sistema de Renovación Proactiva de Tokens

## 📋 Descripción General

Este sistema implementa **renovación proactiva de tokens** para asegurar que TODAS las peticiones, especialmente descargas de archivos y operaciones largas, siempre tengan un token válido.

## 🎯 Problema Resuelto

### ❌ Antes (Solo Renovación Reactiva)
```
Usuario hace petición → Token expirado → 401 → Refresh → Reintentar
```
- ✅ Funciona para peticiones normales
- ❌ Puede fallar en descargas de Excel/PDF
- ❌ Mala experiencia de usuario (errores visibles)

### ✅ Ahora (Renovación Proactiva + Reactiva)
```
Antes de CADA petición:
  ¿Token expira en < 2 minutos? → SÍ → Renovar → Continuar
                                 → NO  → Continuar con token actual

Si aún así expira (edge case):
  Token expirado → 401 → Refresh → Reintentar (fallback reactivo)
```
- ✅ Funciona para TODAS las peticiones
- ✅ Descargas siempre exitosas
- ✅ Experiencia de usuario fluida (sin errores)

## 🔧 Componentes del Sistema

### 1. **Backend: Respuestas con `expiresAt`**

#### LoginController.js
```javascript
// Login devuelve expiresAt
res.status(200).json({
    success: true,
    user: loginResult.user,
    expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutos
});

// Refresh también devuelve expiresAt
res.status(200).json({ 
    success: true,
    expiresAt: Date.now() + (15 * 60 * 1000)
});
```

### 2. **Frontend: Interceptor de Request (Proactivo)**

#### axios-config.js
```javascript
// ANTES de cada petición, verifica si el token expira pronto
apiClient.interceptors.request.use(async (config) => {
    // Si expira en < 2 minutos, renovar proactivamente
    await renewTokenIfNeeded();
    return config;
});
```

### 3. **Frontend: Interceptor de Response (Reactivo - Fallback)**

```javascript
// Si aún así expira, manejar el 401
apiClient.interceptors.response.use(
    (response) => {
        // Capturar expiresAt del servidor
        if (response.data?.expiresAt) {
            updateTokenExpiration(response.data.expiresAt);
        }
        return response;
    },
    async (error) => {
        // Manejar 401 con refresh reactivo
        if (error.response?.status === 401 && requiresRefresh) {
            await refreshToken();
            return apiClient(originalRequest);
        }
    }
);
```

## 📊 Flujo Completo

### Escenario 1: Descarga de Excel (Proactivo)

```
Usuario → Click "Exportar Excel"
          ↓
    Interceptor Request
          ↓
    ¿Token expira en < 2 min? → SÍ (quedan 1m 30s)
          ↓
    🔄 Renovar token proactivamente
          ↓
    ✅ Token renovado (ahora tiene 15 minutos)
          ↓
    📥 Descargar Excel con token fresco
          ↓
    ✅ Descarga exitosa
```

### Escenario 2: Navegación Normal (Proactivo)

```
Usuario → Navega a "Empresas"
          ↓
    Interceptor Request
          ↓
    ¿Token expira en < 2 min? → NO (quedan 10 minutos)
          ↓
    → Continuar con token actual
          ↓
    ✅ Datos cargados normalmente
```

### Escenario 3: Edge Case (Reactivo - Fallback)

```
Usuario → Petición justo cuando expira (race condition)
          ↓
    Servidor → 401 requiresRefresh
          ↓
    Interceptor Response
          ↓
    🔄 Renovar token reactivamente
          ↓
    ✅ Token renovado
          ↓
    🔄 Reintentar petición original
          ↓
    ✅ Petición exitosa
```

## ⚙️ Configuración

### Variables de Tiempo

```javascript
// Backend (authservice.js)
const ACCESS_TOKEN_DURATION = '15m';  // 15 minutos
const REFRESH_TOKEN_DURATION = '30d'; // 30 días

// Frontend (axios-config.js)
const RENEWAL_THRESHOLD = 2 * 60 * 1000; // Renovar si quedan < 2 minutos
```

### Ajustar según Entorno

| Entorno | Access Token | Threshold | Descripción |
|---------|--------------|-----------|-------------|
| **Testing** | 2 minutos | 30 segundos | Detectar problemas rápido |
| **Desarrollo** | 15 minutos | 2 minutos | Balance seguridad/UX |
| **Producción** | 30 minutos | 5 minutos | Máxima persistencia |

## 🔍 Logs del Sistema

### Consola del Frontend

```
📅 Token expirará en 900s                    // Login exitoso
🔄 Token expira en 110s, renovando proactivamente...  // Antes de petición
✅ Token renovado proactivamente             // Renovación exitosa
📅 Token expirará en 900s                    // Nuevo tiempo de expiración
```

### Consola del Backend

```
✅ Token verified for user: 123 Path: /api/empresas/exportar  // Token válido
⏰ Token expired - Path: /api/... Expired at: ...            // Token expirado (edge case)
```

## 🎯 Ventajas del Sistema

### 1. **Descargas Siempre Funcionan**
- Excel, PDF, archivos grandes
- El token SIEMPRE está fresco antes de descargar

### 2. **Experiencia de Usuario Perfecta**
- Sin errores 401 visibles
- Sin retrasos perceptibles
- Sesión fluida y continua

### 3. **Doble Capa de Protección**
- **Proactiva**: Previene expiración (99% de casos)
- **Reactiva**: Maneja edge cases (1% de casos)

### 4. **Manejo de Concurrencia**
```javascript
// Si múltiples peticiones necesitan refresh, solo se hace UNA vez
if (isRefreshing && refreshPromise) {
    return refreshPromise; // Reutilizar la renovación en curso
}
```

## 🧪 Cómo Probar

### Test 1: Descarga después de 13+ minutos
```
1. Iniciar sesión
2. Esperar 13 minutos (quedan 2 minutos de token)
3. Exportar Excel
4. ✅ Debería ver: "Token expira en 120s, renovando proactivamente..."
5. ✅ Excel descarga sin errores
```

### Test 2: Navegación prolongada
```
1. Iniciar sesión
2. Trabajar normalmente por 20+ minutos
3. Navegar entre rutas, hacer operaciones
4. ✅ Nunca ver errores 401
5. ✅ Todo funciona transparentemente
```

### Test 3: Múltiples peticiones simultáneas
```
1. Iniciar sesión
2. Esperar 13 minutos
3. Abrir 3 pestañas diferentes al mismo tiempo
4. ✅ Solo debería ver UN refresh
5. ✅ Todas las pestañas funcionan
```

## 🔒 Seguridad

### Cookies HTTP-Only
- ✅ Access Token: HttpOnly, Secure, SameSite=Strict
- ✅ Refresh Token: HttpOnly, Secure, SameSite=Strict
- ✅ No accesibles desde JavaScript (XSS protection)

### Revocación en Base de Datos
- ✅ Refresh tokens se guardan en BD
- ✅ Se revocan al hacer logout
- ✅ Se validan antes de renovar access token

### Rotación de Tokens
- ✅ Access token se renueva cada 2 minutos (proactivo)
- ✅ Refresh token permanece válido 30 días
- ✅ Al logout, todo se revoca

## 📝 Notas Importantes

1. **El sistema es transparente**: El usuario nunca ve refreshes
2. **Compatible con móvil**: Funciona con cookies y headers
3. **Escalable**: Maneja múltiples peticiones concurrentes
4. **Robusto**: Doble capa (proactivo + reactivo)

## 🚀 Próximos Pasos (Opcional)

### Mejoras Futuras

1. **Persistencia en localStorage** (opcional)
```javascript
// Guardar tiempo de expiración en localStorage
localStorage.setItem('tokenExpiresAt', expiresAt);
// Útil si el usuario cierra y abre el navegador
```

2. **Job de limpieza automática**
```javascript
// Backend/jobs/CleanupTokens.js
setInterval(async () => {
    const deleted = await RefreshTokenModel.deleteExpired();
    console.log(`🧹 ${deleted} tokens expirados eliminados`);
}, 24 * 60 * 60 * 1000); // Cada 24 horas
```

3. **Vista de sesiones activas**
```javascript
// Mostrar al usuario sus sesiones activas
const sessions = await RefreshTokenModel.getActiveTokensByUser(userId);
// Permitir revocar sesiones específicas
```

## 📚 Referencias

- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OAuth 2.0 Refresh Tokens](https://oauth.net/2/refresh-tokens/)
- [OWASP Session Management](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/06-Session_Management_Testing/README)

---

**Última actualización**: Diciembre 22, 2025
**Versión**: 2.0 (Renovación Proactiva + Reactiva)
