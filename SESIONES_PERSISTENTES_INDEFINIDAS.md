# 🔐 Sesiones Persistentes Indefinidas

## 🎯 Objetivo

Implementar **sesiones persistentes tipo Gmail/Facebook** donde el usuario permanece logueado indefinidamente hasta que cierre sesión manualmente.

## ✅ ¿Qué se Implementó?

### 1. **Refresh Token de Larga Duración (180 días)**
```javascript
// Antes: 30 días
// Ahora:  180 días (6 meses)
expiresIn: '180d'
```

### 2. **Rotación Automática de Refresh Tokens**
Cada vez que se renueva el Access Token:
- ✅ Se genera un **NUEVO Refresh Token** (180 días frescos)
- ✅ Se **revoca** el Refresh Token anterior (ya usado)
- ✅ Se guarda el nuevo en la base de datos

### 3. **Renovación Proactiva Automática**
- Access Token expira cada **15 minutos**
- Se renueva **automáticamente** cada 2 minutos (antes de expirar)
- Refresh Token se **ROTA** en cada renovación

## 🔄 Flujo Completo de Sesión Persistente

```
┌─────────────────────────────────────────────────────┐
│                DÍA 1: LOGIN                         │
└─────────────────────────────────────────────────────┘
                          ↓
    Access Token:  15 minutos   ✅
    Refresh Token: 180 días     ✅
                          ↓
              Usuario trabaja normalmente



┌─────────────────────────────────────────────────────┐
│         CADA 13 MINUTOS (automático)                │
└─────────────────────────────────────────────────────┘
                          ↓
    Interceptor: "Token expira en 2 minutos"
                          ↓
    🔄 Renovar Access Token (15m nuevos)
    🔄 ROTAR Refresh Token (180d nuevos)
                          ↓
    ✅ Sesión extendida automáticamente



┌─────────────────────────────────────────────────────┐
│       DÍA 30, 60, 90, 150... (indefinido)          │
└─────────────────────────────────────────────────────┘
                          ↓
    Mientras el usuario USE la app:
    - Access Token se renueva cada 13 minutos
    - Refresh Token se ROTA cada 13 minutos
    - Cada rotación da 180 días MÁS
                          ↓
    ✅ SESIÓN INDEFINIDA



┌─────────────────────────────────────────────────────┐
│  USUARIO INACTIVO POR 180+ DÍAS (6 meses)          │
└─────────────────────────────────────────────────────┘
                          ↓
    Refresh Token expiró (no se usó)
                          ↓
    ❌ Debe hacer login nuevamente
```

## 🔧 Componentes Modificados

### 1. **authservice.js**
```javascript
// Refresh Token ahora dura 180 días
generateRefreshToken(user) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '180d' });
}

// Cookie del Refresh Token también 180 días
setAuthCookies(res, accessToken, refreshToken) {
    res.cookie('refreshToken', refreshToken, {
        maxAge: 180 * 24 * 60 * 60 * 1000 // 180 días
    });
}
```

### 2. **LoginController.js - Login**
```javascript
// Al hacer login, Refresh Token expira en 180 días
const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
await RefreshTokenModel.create(userId, refreshToken, expiresAt, ...);
```

### 3. **LoginController.js - Refresh (ROTACIÓN)**
```javascript
// CLAVE: Cada renovación genera NUEVO Refresh Token
const newRefreshToken = AuthService.generateRefreshToken(user);
const newRefreshExpiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

// Revocar el anterior (ya usado)
await RefreshTokenModel.revoke(oldRefreshToken);

// Guardar el NUEVO
await RefreshTokenModel.create(userId, newRefreshToken, newRefreshExpiresAt, ...);

// Enviar AMBOS tokens al navegador
AuthService.setAuthCookies(res, newAccessToken, newRefreshToken);
```

## 📊 Tabla de Tiempos

| Componente | Duración | Renovación | Comportamiento |
|------------|----------|------------|----------------|
| **Access Token** | 15 minutos | Cada 13 minutos (proactivo) | Se renueva automáticamente |
| **Refresh Token** | 180 días | Cada 13 minutos (rotación) | Se ROTA en cada uso |
| **Cookie Access** | 15 minutos | Se sobrescribe cada 13 min | HttpOnly, Secure |
| **Cookie Refresh** | 180 días | Se sobrescribe cada 13 min | HttpOnly, Secure |

## 🎯 Escenarios de Uso

### ✅ **Usuario Activo Diario**
```
Día 1:  Login → Refresh Token válido hasta Día 181
Día 2:  Usa app → Refresh Token ROTADO → válido hasta Día 182
Día 3:  Usa app → Refresh Token ROTADO → válido hasta Día 183
...
Día 365: Usa app → Refresh Token ROTADO → válido hasta Día 545

Resultado: NUNCA expira mientras use la app 🎉
```

### ✅ **Usuario que Usa la App Ocasionalmente**
```
Día 1:   Login → Token válido hasta Día 181
Día 30:  Abre app → Token ROTADO → válido hasta Día 210
Día 60:  Abre app → Token ROTADO → válido hasta Día 240
Día 150: Abre app → Token ROTADO → válido hasta Día 330

Resultado: Sesión se mantiene incluso con uso esporádico 🎉
```

### ❌ **Usuario Inactivo > 180 Días**
```
Día 1:   Login → Token válido hasta Día 181
Día 200: Abre app → Token expirado
         → Debe hacer login nuevamente

Resultado: Por seguridad, sesión expira después de 6 meses SIN USO
```

### ✅ **Múltiples Dispositivos**
```
PC:     Login → Refresh Token A (180 días)
Móvil:  Login → Refresh Token B (180 días)

Ambas sesiones son INDEPENDIENTES
Cerrar sesión en PC NO afecta Móvil
```

## 🔒 Seguridad Mejorada

### 1. **Rotación de Refresh Tokens**
```
Token usado = Token revocado inmediatamente
Imposible reusar un Refresh Token

Si alguien roba un token:
- Solo funciona UNA vez
- Se revoca automáticamente
- El siguiente uso falla
```

### 2. **Validación en Base de Datos**
```
Cada refresh verifica:
✅ Token existe en BD
✅ Token NO está revocado
✅ Token NO está expirado
✅ Usuario sigue activo (estado = 1)
```

### 3. **Auditoría Completa**
```sql
SELECT * FROM refresh_tokens WHERE user_id = 123;
-- Muestra:
-- - Cuántas sesiones activas
-- - Desde qué IPs
-- - En qué dispositivos (user agent)
-- - Cuándo se crearon
```

### 4. **Logout Revoca TODO**
```javascript
// Al hacer logout:
await RefreshTokenModel.revoke(currentToken);

// Opcional: Revocar TODOS los dispositivos
await RefreshTokenModel.revokeAllByUser(userId);
```

## 🧹 Limpieza Automática

### Job de Limpieza (CleanupRefreshTokens.js)
```javascript
// Se ejecuta cada 24 horas automáticamente
setInterval(() => {
    RefreshTokenModel.deleteExpired(); // Elimina tokens expirados
}, 24 * 60 * 60 * 1000);
```

### Activar en index.js
```javascript
import { startCleanupJob } from './jobs/CleanupRefreshTokens.js';

// Al iniciar el servidor
startCleanupJob(24); // Limpia cada 24 horas
```

## 📈 Monitoreo

### Ver Sesiones Activas de un Usuario
```javascript
const sessions = await RefreshTokenModel.getActiveTokensByUser(userId);
/*
[
  {
    id: 1,
    created_at: "2025-12-22 14:30:00",
    ip_address: "192.168.1.100",
    user_agent: "Chrome 120.0 Windows",
    expires_at: "2026-06-20 14:30:00"
  },
  {
    id: 2,
    created_at: "2025-12-22 15:00:00",
    ip_address: "10.0.0.50",
    user_agent: "Safari 17.0 iPhone",
    expires_at: "2026-06-20 15:00:00"
  }
]
*/
```

### Estadísticas Globales
```javascript
const stats = await getTokenStats();
/*
{
  active: 1523,    // Tokens activos actualmente
  expired: 342,    // Tokens expirados (pendientes limpieza)
  revoked: 891,    // Tokens revocados (logout)
  total: 2756      // Total en BD
}
*/
```

## 🎨 Ventajas del Sistema

| Característica | Antes (30 días) | Ahora (180 días + rotación) |
|----------------|-----------------|------------------------------|
| Duración máxima | 30 días fijos | Indefinida (mientras use app) |
| Sesión persistente | ❌ Solo 30 días | ✅ Indefinida |
| Seguridad | ✅ Buena | ✅ Excelente (rotación) |
| Experiencia usuario | ⚠️ Re-login mensual | ✅ Sin re-login nunca |
| Múltiples dispositivos | ✅ Sí | ✅ Sí (mejor control) |
| Auditoría | ✅ Básica | ✅ Completa |

## 🧪 Cómo Probar

### Test 1: Sesión Persistente
```
1. Hacer login
2. Esperar 13 minutos
3. Hacer cualquier petición
4. Ver consola:
   🔄 Token expira en 120s, renovando proactivamente...
   ✅ Token renovado proactivamente
   🔄 Refresh token ROTADO exitosamente
5. Repetir durante días/semanas
6. ✅ Sesión NUNCA expira
```

### Test 2: Logout Efectivo
```
1. Hacer login
2. Hacer logout
3. Intentar usar la app
4. ✅ Debe pedir login (token revocado)
```

### Test 3: Múltiples Dispositivos
```
1. Login en PC
2. Login en móvil
3. Trabajar en ambos
4. ✅ Ambas sesiones independientes
5. Logout en PC
6. ✅ Móvil sigue funcionando
```

## 📝 Configuración Recomendada

### Producción
```javascript
ACCESS_TOKEN:  '15m'  // 15 minutos
REFRESH_TOKEN: '180d' // 6 meses
THRESHOLD:     2min   // Renovar 2 min antes
```

### Desarrollo
```javascript
ACCESS_TOKEN:  '15m'  // 15 minutos (igual)
REFRESH_TOKEN: '180d' // 6 meses (igual)
THRESHOLD:     2min   // 2 minutos (igual)
```

### Testing Rápido
```javascript
ACCESS_TOKEN:  '2m'   // 2 minutos
REFRESH_TOKEN: '7d'   // 7 días
THRESHOLD:     30s    // 30 segundos
```

## 🚀 Próximos Pasos Opcionales

### 1. Vista de Sesiones para Usuarios
Permite al usuario ver y cerrar sesiones remotamente:
```javascript
// GET /api/user/sessions
// Respuesta:
{
  sessions: [
    {
      device: "Chrome - Windows 10",
      location: "Santiago, Chile",
      lastActive: "Hace 5 minutos",
      current: true
    },
    {
      device: "Safari - iPhone",
      location: "Valparaíso, Chile", 
      lastActive: "Hace 2 horas",
      current: false
    }
  ]
}
```

### 2. Notificaciones de Nuevas Sesiones
Email/notificación cuando se detecta login desde nuevo dispositivo.

### 3. Límite de Sesiones Concurrentes
```javascript
// Máximo 5 dispositivos simultáneos
const activeSessions = await getActiveTokensByUser(userId);
if (activeSessions.length >= 5) {
    // Revocar la sesión más antigua
    await RefreshTokenModel.revoke(activeSessions[0].token);
}
```

---

**Última actualización**: Diciembre 22, 2025  
**Versión**: 3.0 (Sesiones Persistentes Indefinidas)  
**Estado**: ✅ Producción Ready
