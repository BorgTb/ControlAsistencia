# 🏢 Sistema de Control de Asistencia - Frontend

Sistema web de control de asistencia con autenticación JWT y registro de marcaciones en tiempo real, alineado con la estructura de base de datos de producción.

## 🚀 Características Principales

- ✅ **Autenticación JWT** con persistencia automática
- ⏰ **Control de Marcaciones** en tiempo real (entrada, salida, colación, descanso)
- 📊 **Dashboard con resumen diario** de marcaciones
- 💾 **Persistencia de estado** con Pinia y localStorage
- 🔐 **Interceptores automáticos** para manejo de tokens
- 📱 **Diseño responsivo** con Tailwind CSS
- 🔄 **Sincronización automática** con backend

## 🛠️ Tecnologías Utilizadas

- **Vue 3** (Composition API)
- **Pinia** (State Management)
- **Vue Router** (Routing)
- **Axios** (HTTP Client)
- **Tailwind CSS** (Styling)
- **Vite** (Build Tool)

## 📁 Estructura del Proyecto

```
src/
├── components/
│   └── vistas/
│       ├── Login.vue          # Formulario de autenticación
│       └── Dashboard.vue      # Panel principal de marcaciones
├── stores/
│   └── auth-store.js          # Store de autenticación con Pinia
├── services/
│   ├── Authservices.js       # Servicio de autenticación
│   └── AsistenciaService.js  # Servicio de marcaciones
├── composables/
│   ├── useAuth.js           # Composable de autenticación
│   └── useAsistencia.js     # Composable de marcaciones
├── routes/
│   └── index.js             # Configuración de rutas
└── main.js                  # Punto de entrada de la aplicación
```

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd Frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 4. Ejecutar en modo desarrollo
```bash
npm run dev
```

### 5. Construir para producción
```bash
npm run build
```

## 🌐 Configuración del Backend

El frontend está diseñado para trabajar con los siguientes endpoints:

### 🔐 Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `POST /auth/register` - Registrar usuario
- `GET /auth/verify` - Verificar token

### ⏰ Marcaciones
- `POST /marcaciones/entrada` - Registrar entrada
- `POST /marcaciones/salida` - Registrar salida  
- `POST /marcaciones/colacion` - Registrar colación
- `POST /marcaciones/descanso` - Registrar descanso
- `GET /marcaciones/fecha/{fecha}` - Obtener marcaciones por fecha
- `GET /marcaciones/estado-actual` - Estado actual del usuario

Ver `EJEMPLOS_BACKEND.md` para ejemplos completos de respuestas esperadas.

## 📱 Funcionalidades del Dashboard

### Reloj en Tiempo Real
- Muestra la hora actual actualizada cada segundo
- Fecha formateada en español

### Botones de Marcación
- **Entrada**: Registra llegada al trabajo
- **Salida**: Registra fin de jornada
- **Colación**: Registra inicio/fin de período de almuerzo
- **Descanso**: Registra pausas cortas

### Resumen de Marcaciones
- Lista de todas las marcaciones del día actual
- Indicadores de tipo de marcación
- Cálculo automático de tiempo trabajado
- Estado actual del usuario (dentro/fuera)

## 🔒 Sistema de Autenticación

### Características
- **JWT Tokens** con renovación automática
- **Persistencia** en localStorage vía Pinia
- **Interceptores Axios** para headers automáticos
- **Redirección automática** en caso de tokens expirados
- **Estado reactivo** en toda la aplicación

### Flujo de Autenticación
1. Usuario ingresa credenciales en `Login.vue`
2. `AuthService` envía petición al backend
3. Token JWT se almacena en `authStore`
4. Usuario es redirigido al `Dashboard`
5. Todas las peticiones incluyen automáticamente el token

## 📊 Gestión de Estado

### AuthStore (Pinia)
```javascript
{
  token: 'jwt-token-here',
  user: {
    id: 1,
    nombre: 'Juan Pérez',
    email: 'juan@empresa.com',
    rol: 'trabajador'
  },
  isAuthenticated: true
}
```

### Persistencia
- **Automática** con `pinia-plugin-persistedstate`
- **localStorage** como storage backend
- **Hidratación** automática al cargar la aplicación

## 🎨 Interfaz de Usuario

### Dashboard
- **Header** con información del usuario y logout
- **Reloj digital** con fecha actual
- **Grid de botones** para marcaciones
- **Lista de marcaciones** del día
- **Resumen de tiempo** trabajado

### Responsivo
- **Desktop**: Layout completo con sidebar
- **Mobile**: Diseño adaptado para pantallas pequeñas
- **Tablet**: Optimización para resoluciones medias

## 🔄 Composables

### useAuth.js
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

### useAsistencia.js
```javascript
const { 
  marcacionesHoy, 
  estadoActual, 
  registrarEntrada, 
  registrarSalida,
  registrarColacion,
  registrarDescanso 
} = useAsistencia();
```

## ⚙️ Configuración del Proyecto

### Vite Config
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b'
      }
    }
  },
  plugins: []
}
```

## 🧪 Testing

### Comandos disponibles
```bash
# Tests unitarios
npm run test

# Tests de integración  
npm run test:integration

# Coverage
npm run test:coverage
```

## 📈 Scripts Disponibles

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix",
    "format": "prettier --write src/"
  }
}
```

## 🔧 Estructura de Base de Datos

El sistema está alineado con las siguientes tablas de producción:

### usuarios
- id, nombre, email, password, rol, rut, estado

### marcaciones  
- id, usuario_id, fecha, hora, tipo, hash, ip_origen, geo_lat, geo_lon

### comprobantes
- id, marcacion_id, contenido, enviado, fecha_envio

### turnos
- id, usuario_id, tipo, inicio, fin, motivo_modificacion

Ver `EJEMPLOS_BACKEND.md` para detalles completos de la estructura.

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Variables de Entorno de Producción
```env
VITE_API_BASE_URL=https://api.empresa.com
VITE_APP_NAME=Control de Asistencia
VITE_APP_VERSION=1.0.0
```

### Configuración de Servidor
```nginx
# nginx.conf
server {
    listen 80;
    server_name asistencia.empresa.com;
    
    location / {
        root /var/www/asistencia/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🛡️ Seguridad

### Medidas Implementadas
- **Tokens JWT** con expiración
- **Headers CORS** configurados
- **Validación** de datos en frontend
- **Sanitización** de inputs
- **Rate limiting** (backend)

### Recomendaciones
- Usar HTTPS en producción
- Configurar CSP headers
- Implementar refresh tokens
- Auditoría de accesos

## 📋 Roadmap

### v1.1
- [ ] Modo offline
- [ ] Notificaciones push
- [ ] Reportes en PDF
- [ ] Geolocalización

### v1.2
- [ ] Aplicación móvil
- [ ] Reconocimiento facial
- [ ] Dashboard administrativo
- [ ] API de integración

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 📞 Soporte

- **Email**: soporte@empresa.com
- **Documentation**: [docs.empresa.com](https://docs.empresa.com)
- **Issues**: [GitHub Issues](https://github.com/empresa/asistencia/issues)

---

**Desarrollado con ❤️ para mejorar el control de asistencia empresarial**
