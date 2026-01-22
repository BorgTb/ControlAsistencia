import crypto from 'crypto';

/**
 * Servicio para generación de tokens y contraseñas temporales
 */
class TokenService {
  /**
   * Generar token de aceptación aleatorio de 64 caracteres
   * @returns {string} Token hexadecimal
   */
  generarTokenAceptacion() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generar contraseña temporal alfanumérica de 12 caracteres
   * @returns {string} Contraseña temporal
   */
  generarPasswordTemporal() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Validar si un token ha expirado
   * @param {Date|string} fechaExpiracion - Fecha de expiración del token
   * @returns {boolean} true si aún es válido, false si expiró
   */
  validarExpiracion(fechaExpiracion) {
    const ahora = new Date();
    const expira = new Date(fechaExpiracion);
    return ahora <= expira;
  }
}

export default new TokenService();
