# 🚀 Guía de Deployment - Sistema con Cookies HTTP-Only

## ✅ Checklist Pre-Deployment

### Backend

- [ ] `cookie-parser` instalado en package.json
- [ ] Variables de entorno configuradas correctamente
- [ ] `NODE_ENV=production` en servidor de producción
- [ ] `SECRET_KEY` única y segura configurada
- [ ] `FRONTEND_URL` apuntando a la URL correcta de producción
- [ ] CORS configurado con `credentials: true`
- [ ] Certificado SSL/HTTPS configurado (OBLIGATORIO)

### Frontend

- [ ] `VITE_API_URL` apuntando a la API de producción
- [ ] Todos los servicios usando `withCredentials: true` o `credentials: 'include'`
- [ ] localStorage solo almacena `user`, NO `token`
- [ ] Build de producción generado (`npm run build`)

---

## 📝 Pasos para Deployment

### 1️⃣ Preparar Backend

```bash
cd Backend

# Instalar dependencias
npm install

# Verificar que cookie-parser esté instalado
npm list cookie-parser

# Crear archivo .env basado en .env.example
cp .env.example .env

# Editar .env con valores de producción
nano .env  # o tu editor preferido
```

**Configurar .env para producción:**
```env
NODE_ENV=production
SERVER_PORT=3000
SECRET_KEY=clave_super_segura_generada_aleatoriamente
FRONTEND_URL=https://tu-dominio.com
DB_HOST=tu_db_host
DB_USER=tu_db_user
DB_PASSWORD=tu_db_password
DB_NAME=tu_db_name
```

### 2️⃣ Preparar Frontend

```bash
cd Frontend

# Instalar dependencias
npm install

# Crear archivo .env para producción
cp .env.example .env.production

# Editar .env.production
nano .env.production
```

**Configurar .env.production:**
```env
VITE_API_URL=https://api.tu-dominio.com/api
```

```bash
# Generar build de producción
npm run build

# Esto genera la carpeta dist/
```

### 3️⃣ Configurar HTTPS

**OBLIGATORIO: Las cookies con `secure: true` requieren HTTPS**

#### Opción A: Nginx como Reverse Proxy

```nginx
# /etc/nginx/sites-available/tu-dominio

# Backend API
server {
    listen 443 ssl http2;
    server_name api.tu-dominio.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # IMPORTANTE: Permitir cookies
        proxy_set_header Cookie $http_cookie;
    }
}

# Frontend
server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;

    root /path/to/Frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Opción B: Let's Encrypt (Certbot)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com -d api.tu-dominio.com

# Certbot configurará automáticamente HTTPS
```

### 4️⃣ Iniciar Backend

#### Opción A: PM2 (Recomendado)

```bash
cd Backend

# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicación
pm2 start index.js --name "control-asistencia-api"

# Configurar para iniciar al arranque
pm2 startup
pm2 save

# Ver logs
pm2 logs control-asistencia-api

# Monitorear
pm2 monit
```

#### Opción B: systemd

```bash
# Crear archivo de servicio
sudo nano /etc/systemd/system/control-asistencia.service
```

```ini
[Unit]
Description=Control de Asistencia API
After=network.target

[Service]
Type=simple
User=tu_usuario
WorkingDirectory=/path/to/Backend
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar e iniciar servicio
sudo systemctl enable control-asistencia
sudo systemctl start control-asistencia

# Ver estado
sudo systemctl status control-asistencia

# Ver logs
sudo journalctl -u control-asistencia -f
```

### 5️⃣ Servir Frontend

#### Opción A: Nginx (Recomendado)

Ya configurado en paso 3️⃣

#### Opción B: Servir con Node

```bash
cd Frontend

# Instalar serve
npm install -g serve

# Servir build
serve -s dist -l 5000
```

---

## 🧪 Verificación Post-Deployment

### 1. Verificar HTTPS
```bash
curl -I https://tu-dominio.com
# Debe retornar: HTTP/2 200
```

### 2. Verificar API
```bash
curl https://api.tu-dominio.com/api/
# Debe retornar: {"message": "API is running..."}
```

### 3. Verificar Login y Cookies

1. Abre DevTools → Network
2. Haz login
3. Verifica en la respuesta de `/api/auth/login`:
   - **Response Headers** debe incluir: `Set-Cookie: authToken=...`
   - **Cookie debe tener**: `HttpOnly; Secure; SameSite=Strict`

4. Haz un request autenticado
5. Verifica en **Request Headers**:
   - Debe incluir: `Cookie: authToken=...`
   - NO debe tener: `Authorization: Bearer ...`

### 4. Verificar CORS

```bash
# Desde consola del navegador
fetch('https://api.tu-dominio.com/api/user/profile', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

## 🔧 Troubleshooting en Producción

### ❌ Cookie no se establece

**Síntoma:** No aparece `Set-Cookie` en headers de respuesta

**Soluciones:**
1. Verifica `NODE_ENV=production` en .env
2. Verifica que estés usando HTTPS
3. Revisa logs del servidor: `pm2 logs` o `journalctl`
4. Verifica que `cookie-parser` esté instalado

### ❌ Cookie no se envía con requests

**Síntoma:** Request no incluye header `Cookie`

**Soluciones:**
1. Verifica `withCredentials: true` en frontend
2. Verifica CORS con `credentials: true` en backend
3. Verifica que frontend y backend estén en mismo dominio o dominio/subdominio compatible
4. Revisa configuración de SameSite (prueba con `lax` en desarrollo)

### ❌ Error CORS

**Síntoma:** `Access-Control-Allow-Origin` error

**Soluciones:**
1. Verifica `FRONTEND_URL` en .env del backend
2. Verifica `credentials: true` en configuración CORS
3. NO uses wildcard `*` con credentials - debe ser URL exacta
4. Verifica Nginx/proxy no esté bloqueando headers

### ❌ Token expirado constantemente

**Síntoma:** Usuario se desloguea frecuentemente

**Soluciones:**
1. Incrementa tiempo de expiración en `generateToken()`:
   ```javascript
   jwt.sign(payload, SECRET_KEY, { expiresIn: '8h' })
   ```
2. Implementa refresh tokens (siguiente mejora)
3. Verifica sincronización de hora del servidor

---

## 🔄 Actualización de Código

```bash
# Backend
cd Backend
git pull origin main
npm install
pm2 restart control-asistencia-api

# Frontend
cd Frontend
git pull origin main
npm install
npm run build
# Nginx automáticamente servirá la nueva versión
```

---

## 📊 Monitoreo

### PM2 Monitoring

```bash
# Dashboard
pm2 monit

# Logs en tiempo real
pm2 logs control-asistencia-api --lines 100

# Métricas
pm2 describe control-asistencia-api
```

### Logs de Nginx

```bash
# Logs de acceso
tail -f /var/log/nginx/access.log

# Logs de errores
tail -f /var/log/nginx/error.log

# Logs de dominio específico
tail -f /var/log/nginx/api.tu-dominio.com.access.log
```

---

## 🔐 Seguridad Adicional

### 1. Rate Limiting

Instalar en Backend:
```bash
npm install express-rate-limit
```

```javascript
// Backend/index.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por IP
});

app.use('/api/', limiter);
```

### 2. Helmet.js

```bash
npm install helmet
```

```javascript
// Backend/index.js
import helmet from 'helmet';

app.use(helmet());
```

### 3. CSRF Protection

```bash
npm install csurf
```

```javascript
import csrf from 'csurf';
const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);
```

---

## 📈 Próximas Mejoras

- [ ] Implementar Refresh Tokens
- [ ] Implementar blacklist de tokens
- [ ] Agregar 2FA (Two-Factor Authentication)
- [ ] Implementar rate limiting por usuario
- [ ] Agregar logs de auditoría más detallados
- [ ] Implementar sesiones concurrentes limitadas

---

**Última actualización:** 16 de Diciembre, 2024
