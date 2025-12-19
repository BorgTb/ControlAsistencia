# 🚀 Guía de Deploy - Sistema de Refresh Tokens

Ver archivo: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## Pasos Rápidos

1. **Crear tabla en DB** (5 min)
   ```bash
   mysql -u usuario -p database < Backend/database/refresh_tokens_table.sql
   ```

2. **Configurar .env** (2 min)
   ```bash
   SECRET_KEY=<generar_clave_secreta>
   NODE_ENV=production
   FRONTEND_URL=https://tu-dominio.com
   ```

3. **Reiniciar backend** (1 min)
   ```bash
   pm2 restart control-asistencia
   ```

4. **Verificar cookies** (2 min)
   - Login → DevTools → Application → Cookies
   - Debe mostrar `accessToken` y `refreshToken` con HttpOnly ✓

5. **¡Listo!** 🎉

---

## Documentación Completa

- [RESUMEN_REFRESH_TOKENS.md](./RESUMEN_REFRESH_TOKENS.md) - Resumen ejecutivo
- [REFRESH_TOKENS_IMPLEMENTATION.md](./REFRESH_TOKENS_IMPLEMENTATION.md) - Guía técnica
- [DIAGRAMA_REFRESH_TOKENS.md](./DIAGRAMA_REFRESH_TOKENS.md) - Flujo visual
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía de deploy completa
