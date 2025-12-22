import RefreshTokenModel from '../model/RefreshTokenModel.js';

/**
 * Job para limpiar refresh tokens expirados y revocados
 * 
 * Este job se ejecuta periódicamente para mantener la tabla
 * refresh_tokens limpia y optimizada.
 * 
 * Se recomienda ejecutarlo:
 * - Cada 24 horas en producción
 * - Manualmente en desarrollo
 */

/**
 * Limpia tokens expirados de la base de datos
 * @returns {Promise<Object>} Resultado de la limpieza
 */
export const cleanupExpiredTokens = async () => {
    try {
        console.log('🧹 Iniciando limpieza de refresh tokens expirados...');
        
        const deleted = await RefreshTokenModel.deleteExpired();
        
        console.log(`✅ Limpieza completada: ${deleted} tokens expirados eliminados`);
        
        return {
            success: true,
            deletedCount: deleted,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Error en limpieza de tokens:', error);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Inicia el job de limpieza automática
 * @param {number} intervalHours - Intervalo en horas entre limpiezas (default: 24)
 */
export const startCleanupJob = (intervalHours = 24) => {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    console.log(`🕐 Job de limpieza de tokens iniciado (cada ${intervalHours} horas)`);
    
    // Ejecutar inmediatamente al iniciar
    cleanupExpiredTokens();
    
    // Luego ejecutar periódicamente
    setInterval(() => {
        cleanupExpiredTokens();
    }, intervalMs);
};

/**
 * Obtiene estadísticas de tokens en la base de datos
 * @returns {Promise<Object>} Estadísticas
 */
export const getTokenStats = async () => {
    try {
        const activeTokens = await RefreshTokenModel.getActiveTokensCount();
        const expiredTokens = await RefreshTokenModel.getExpiredTokensCount();
        const revokedTokens = await RefreshTokenModel.getRevokedTokensCount();
        
        return {
            active: activeTokens,
            expired: expiredTokens,
            revoked: revokedTokens,
            total: activeTokens + expiredTokens + revokedTokens
        };
    } catch (error) {
        console.error('❌ Error al obtener estadísticas de tokens:', error);
        return null;
    }
};

export default {
    cleanupExpiredTokens,
    startCleanupJob,
    getTokenStats
};
