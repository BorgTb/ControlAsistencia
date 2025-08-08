import MarcacionesModel from "../model/MarcacionesModel.js";
import UserModel from "../model/UserModel.js";

const obtenerReporteAsistencia = async (req, res) => {
    try {
        // Obtener todas las marcaciones y usuarios
        const marcaciones = await MarcacionesModel.obtenerTodasLasMarcaciones();
        const usuarios = await UserModel.findAll();
        
        // Crear un mapa de usuarios para acceso rápido
        const usuariosMap = {};
        usuarios.forEach(usuario => {
            usuariosMap[usuario.id] = usuario;
        });
        
        // Agrupar marcaciones por usuario y fecha
        const marcacionesAgrupadas = {};
        marcaciones.forEach(marcacion => {
            const key = `${marcacion.usuario_id}_${marcacion.fecha.toISOString().split('T')[0]}`;
            if (!marcacionesAgrupadas[key]) {
                marcacionesAgrupadas[key] = {
                    usuario_id: marcacion.usuario_id,
                    fecha: marcacion.fecha.toISOString().split('T')[0],
                    entrada: null,
                    salida: null,
                    hashChecksum: null
                };
            }
            
            if (marcacion.tipo === 'entrada') {
                marcacionesAgrupadas[key].entrada = marcacion.hora;
                marcacionesAgrupadas[key].hashChecksum = marcacion.hash;
            } else if (marcacion.tipo === 'salida') {
                marcacionesAgrupadas[key].salida = marcacion.hora;
            }
        });
        
        // Transformar datos al formato requerido
        const reporteAsistencia = Object.values(marcacionesAgrupadas).map(marcacion => {
            const usuario = usuariosMap[marcacion.usuario_id];
            
            // Generar iniciales del nombre
            const iniciales = usuario?.nombre 
                ? usuario.nombre.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
                : 'NN';
            
            // Determinar estado de asistencia
            let estado = 'ausente';
            if (marcacion.entrada && marcacion.salida) {
                estado = 'presente';
            } else if (marcacion.entrada && !marcacion.salida) {
                estado = 'parcial';
            }
            
            return {
                // ✅ CAMPOS OBLIGATORIOS
                id: marcacion.usuario_id,
                nombre: usuario?.nombre || 'Usuario Desconocido',
                cedula: usuario?.rut || '00000000-0',
                iniciales: iniciales,
                departamento: 'Operaciones', // Default
                entrada: marcacion.entrada || '--:--',
                salida: marcacion.salida || '--:--',
                estado: estado,
                cargo: usuario?.rol || 'trabajador',
                fecha: marcacion.fecha,
                
                // ✅ CAMPOS OPCIONALES
                empresaTransitoria: null,
                hashChecksum: marcacion.hashChecksum,
                
                // ✅ NUEVOS CAMPOS PARA FILTROS AVANZADOS
                tipoJornada: 'Completa',
                turnoEspecifico: 'Mañana',
                lugarTrabajo: 'Oficina Central',
                region: 'Metropolitana',
                establecimiento: 'EST001'
            };
        });
        
        res.json({ 
            message: 'Reporte de asistencia obtenido exitosamente', 
            data: reporteAsistencia 
        });
        
    } catch (error) {
        console.error('Error al obtener reporte de asistencia:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor',
            error: error.message 
        });
    }
};






const ReportesController = {
obtenerReporteAsistencia
}



export default ReportesController;