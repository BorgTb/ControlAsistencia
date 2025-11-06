import { ref, computed } from 'vue';
import SolicitudesGeneralesService from '../services/SolicitudesGeneralesService';

/**
 * Composable para manejar todas las solicitudes generales del trabajador
 */
export const useSolicitudesGenerales = () => {
  const loading = ref(false);
  const error = ref(null);
  const solicitudes = ref([]);
  const solicitudActual = ref(null);
  const procesando = ref(false);

  // Tipos de solicitudes disponibles
  const tiposSolicitudes = ref([
    {
      id: 'amonestacion',
      nombre: 'Amonestación',
      descripcion: 'Gestión de amonestaciones',
      icono: 'alert-circle',
      requiereDocumento: true,
      campos: ['fecha', 'motivo', 'descripcion']
    },
    
    {
      id: 'permiso_con_goce',
      nombre: 'Permiso con Goce de Remuneración',
      descripcion: 'Permisos especiales con mantención de sueldo',
      icono: 'user-check',
      requiereDocumento: true,
      campos: ['fecha_inicio', 'fecha_fin', 'motivo', 'tipo_permiso']
    },
    {
      id: 'permiso_sin_goce',
      nombre: 'Permiso sin Goce de Remuneración',
      descripcion: 'Permisos especiales sin mantención de sueldo',
      icono: 'user-x',
      requiereDocumento: true,
      campos: ['fecha_inicio', 'fecha_fin', 'motivo', 'tipo_permiso']
    },
      {
      id: 'cambio_turno',
      nombre: 'Cambio de Turno',
      descripcion: 'Solicitar intercambio o modificación de turno',
      icono: 'refresh-cw',
      requiereDocumento: false,
      campos: ['fecha_inicio', 'turno_actual', 'fecha_fin', 'turno_nuevo', 'motivo', 'usuario_intercambio']
    },
    {
      id: 'nuevo_ciclo',
      nombre: 'Nuevo Ciclo',
      descripcion: 'Solicitud de nuevo ciclo de trabajo',
      icono: 'repeat',
      requiereDocumento: false,
      campos: ['fecha_inicio', 'descripcion']
    },
    {
      id: 'uso_feriado',
      nombre: 'Uso de Feriado',
      descripcion: 'Solicitar días de feriado legal',
      icono: 'calendar',
      requiereDocumento: false,
      campos: ['fecha_inicio', 'fecha_fin', 'dias_solicitados', 'motivo']
    },
    {
      id: 'compensacion_horas',
      nombre: 'Compensación de Horas Extras',
      descripcion: 'Cambio de horas extras por días de descanso',
      icono: 'clock',
      requiereDocumento: false,
      campos: ['horas_extras_id', 'fecha_compensacion', 'motivo']
    },
    {
      id: 'otro',
      nombre: 'Otro',
      descripcion: 'Otras solicitudes',
      icono: 'more-horizontal',
      requiereDocumento: false,
      campos: ['descripcion', 'motivo']
    }
  ]);

  // Estados de solicitud
  const estadosSolicitud = ref([
    { id: 'PENDIENTE', nombre: 'Pendiente', color: 'yellow' },
    { id: 'APROBADA', nombre: 'Aprobada', color: 'green' },
    { id: 'RECHAZADA', nombre: 'Rechazada', color: 'red' },
    { id: 'EN_REVISION', nombre: 'En Revisión', color: 'blue' }
  ]);

  // Computed
  const solicitudesPorEstado = computed(() => {
    return estadosSolicitud.value.map(estado => ({
      ...estado,
      cantidad: solicitudes.value.filter(s => s.estado === estado.id).length
    }));
  });

  const solicitudesPendientes = computed(() => {
    return solicitudes.value.filter(s => s.estado === 'PENDIENTE');
  });

  /**
   * Crear nueva solicitud
   */
  const crearSolicitud = async (tipoSolicitud, datos, archivo = null) => {
    loading.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      
      // Agregar datos de la solicitud
      formData.append('tipo', tipoSolicitud);
      formData.append('datos', JSON.stringify(datos));
      // Agregar archivo si existe - nombre DEBE ser 'archivo' para que multer lo reconozca
      if (archivo) {
        formData.append('archivo', archivo);
      }
      const response = await SolicitudesGeneralesService.crearSolicitud(formData);
      
      // Actualizar la lista local
      await cargarSolicitudes();
      
      return response;
    } catch (err) {
      error.value = err.message || 'Error al crear la solicitud';
      console.error('Error en crearSolicitud:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cargar todas las solicitudes del usuario
   */
  const cargarSolicitudes = async (filtros = {}) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await SolicitudesGeneralesService.obtenerSolicitudes(filtros);
      solicitudes.value = data;
      return data;
    } catch (err) {
      error.value = err.message || 'Error al cargar las solicitudes';
      console.error('Error en cargarSolicitudes:', err);
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cargar una solicitud específica
   */
  const cargarSolicitudPorId = async (id) => {
    loading.value = true;
    error.value = null;

    try {
      const data = await SolicitudesGeneralesService.obtenerSolicitudPorId(id);
      solicitudActual.value = data;
      return data;
    } catch (err) {
      error.value = err.message || 'Error al cargar la solicitud';
      console.error('Error en cargarSolicitudPorId:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Cancelar solicitud (solo si está pendiente)
   */
  const cancelarSolicitud = async (id) => {
    procesando.value = true;
    error.value = null;

    try {
      await SolicitudesGeneralesService.cancelarSolicitud(id);
      
      // Actualizar la lista local
      await cargarSolicitudes();
      
      return true;
    } catch (err) {
      error.value = err.message || 'Error al cancelar la solicitud';
      console.error('Error en cancelarSolicitud:', err);
      throw err;
    } finally {
      procesando.value = false;
    }
  };

  /**
   * Obtener horas extras disponibles para compensación
   */
  const obtenerHorasExtrasDisponibles = async () => {
    try {
      return await SolicitudesGeneralesService.obtenerHorasExtrasDisponibles();
    } catch (err) {
      error.value = err.message || 'Error al cargar horas extras';
      console.error('Error en obtenerHorasExtrasDisponibles:', err);
      return [];
    }
  };

  /**
   * Obtener usuarios disponibles para intercambio de turno
   */
  const obtenerUsuariosParaIntercambio = async () => {
    try {
      return await SolicitudesGeneralesService.obtenerUsuariosParaIntercambio();
    } catch (err) {
      error.value = err.message || 'Error al cargar usuarios';
      console.error('Error en obtenerUsuariosParaIntercambio:', err);
      return [];
    }
  };

  /**
   * Obtener turnos disponibles
   */
  const obtenerTurnosDisponibles = async (fecha) => {
    try {
      return await SolicitudesGeneralesService.obtenerTurnosDisponibles(fecha);
    } catch (err) {
      error.value = err.message || 'Error al cargar turnos';
      console.error('Error en obtenerTurnosDisponibles:', err);
      return [];
    }
  };

  /**
   * Validar días de feriado disponibles
   */
  const validarDiasFeriado = async (fechaInicio, fechaFin) => {
    try {
      return await SolicitudesGeneralesService.validarDiasFeriado(fechaInicio, fechaFin);
    } catch (err) {
      error.value = err.message || 'Error al validar días de feriado';
      console.error('Error en validarDiasFeriado:', err);
      return { valido: false, mensaje: err.message };
    }
  };

  /**
   * Descargar documento adjunto
   */
  const descargarDocumento = async (solicitudId, documentoId) => {
    try {
      return await SolicitudesGeneralesService.descargarDocumento(solicitudId, documentoId);
    } catch (err) {
      error.value = err.message || 'Error al descargar documento';
      console.error('Error en descargarDocumento:', err);
      throw err;
    }
  };

  /**
   * Resetear estado
   */
  const resetear = () => {
    loading.value = false;
    error.value = null;
    solicitudes.value = [];
    solicitudActual.value = null;
    procesando.value = false;
  };

  /**
   * Utilidades para formateo
   */
  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerColorEstado = (estado) => {
    const estadoObj = estadosSolicitud.value.find(e => e.id === estado);
    return estadoObj?.color || 'gray';
  };

  const obtenerNombreTipo = (tipo) => {
    const tipoObj = tiposSolicitudes.value.find(t => t.id === tipo);
    return tipoObj?.nombre || tipo;
  };

  return {
    // Estado reactivo
    loading,
    error,
    solicitudes,
    solicitudActual,
    procesando,
    tiposSolicitudes,
    estadosSolicitud,

    // Computed
    solicitudesPorEstado,
    solicitudesPendientes,

    // Métodos principales
    crearSolicitud,
    cargarSolicitudes,
    cargarSolicitudPorId,
    cancelarSolicitud,

    // Métodos auxiliares
    obtenerHorasExtrasDisponibles,
    obtenerUsuariosParaIntercambio,
    obtenerTurnosDisponibles,
    validarDiasFeriado,
    descargarDocumento,

    // Utilidades
    resetear,
    formatearFecha,
    formatearFechaHora,
    obtenerColorEstado,
    obtenerNombreTipo
  };
};