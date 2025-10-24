import { ref, computed } from 'vue';
import diasTrabajadosService from '../services/diasTrabajadosService';

export function useDiasTrabajados() {
  const diasTrabajados = ref([]);
  const estadisticas = ref(null);
  const horasExtras = ref(null);
  const isLoading = ref(false);
  const isLoadingHorasExtras = ref(false);
  const error = ref(null);
  const mesActual = ref(new Date().getMonth());
  const anioActual = ref(new Date().getFullYear());

  // Obtener datos de días trabajados
  const fetchDiasTrabajados = async (mes, anio) => {
    isLoading.value = true;
    error.value = null;
    try {
      // Convertir mes de JavaScript (0-11) a mes normal (1-12)
      const mesBackend = mes + 1;
      const response = await diasTrabajadosService.getCalendarioMensual(mesBackend, anio);
      
      if (response.success) {
        diasTrabajados.value = response.data?.dias || [];
        estadisticas.value = response.data?.estadisticas || null;
      } else {
        throw new Error(response.message || 'Error al cargar días trabajados');
      }
    } catch (err) {
      error.value = err.message || 'Error al cargar días trabajados';
      console.error('Error fetching dias trabajados:', err);
      diasTrabajados.value = [];
      estadisticas.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Obtener horas extras del mes
  const fetchHorasExtras = async (mes, anio) => {
    isLoadingHorasExtras.value = true;
    try {
      // Convertir mes de JavaScript (0-11) a mes normal (1-12)
      const mesBackend = mes + 1;
      const response = await diasTrabajadosService.getHorasExtrasMes(mesBackend, anio);
      
      if (response.success) {
        horasExtras.value = response.data || null;
      } else {
        horasExtras.value = null;
      }
    } catch (err) {
      console.error('Error fetching horas extras:', err);
      horasExtras.value = null;
    } finally {
      isLoadingHorasExtras.value = false;
    }
  };

  // Cambiar mes
  const cambiarMes = (direccion) => {
    if (direccion === 'siguiente') {
      if (mesActual.value === 11) {
        mesActual.value = 0;
        anioActual.value++;
      } else {
        mesActual.value++;
      }
    } else if (direccion === 'anterior') {
      if (mesActual.value === 0) {
        mesActual.value = 11;
        anioActual.value--;
      } else {
        mesActual.value--;
      }
    }
  };

  // Ir al mes actual
  const irMesActual = () => {
    mesActual.value = new Date().getMonth();
    anioActual.value = new Date().getFullYear();
  };

  // Obtener nombre del mes
  const nombreMes = computed(() => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mesActual.value];
  });

  // Obtener días del calendario
  const diasCalendario = computed(() => {
    const primerDia = new Date(anioActual.value, mesActual.value, 1);
    const ultimoDia = new Date(anioActual.value, mesActual.value + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias = [];

    // Días vacíos al inicio (para alinear el calendario)
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push({ 
        dia: null, 
        esMesActual: false 
      });
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = `${anioActual.value}-${String(mesActual.value + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const diaData = diasTrabajados.value.find(d => d.fecha === fecha);
      
      dias.push({
        dia,
        fecha,
        esMesActual: true,
        esHoy: esHoy(dia),
        estado: diaData?.estado || null,
        horaEntrada: diaData?.horaEntrada || null,
        horaSalida: diaData?.horaSalida || null,
        incidente: diaData?.incidente || null,
        tipoIncidente: diaData?.tipoIncidente || null,
        horasTrabajadas: diaData?.horasTrabajadas || null,
        horasExtras: diaData?.horasExtras || null,
        minutosExtra: diaData?.minutosExtra || null,
        minutosRetraso: diaData?.minutosRetraso || null
      });
    }

    return dias;
  });

  // Verificar si es el día de hoy
  const esHoy = (dia) => {
    const hoy = new Date();
    return dia === hoy.getDate() && 
           mesActual.value === hoy.getMonth() && 
           anioActual.value === hoy.getFullYear();
  };

  // Obtener color según estado
  const getEstadoColor = (estado) => {
    const colores = {
      'trabajado': 'bg-green-100 border-green-300 text-green-800',
      'libre': 'bg-blue-100 border-blue-300 text-blue-800',
      'ausente': 'bg-red-100 border-red-300 text-red-800',
      'incidente': 'bg-yellow-100 border-yellow-300 text-yellow-800',
      'justificado': 'bg-purple-100 border-purple-300 text-purple-800',
      'sin_turno': 'bg-gray-100 border-gray-300 text-gray-600'
    };
    return colores[estado] || 'bg-gray-50 border-gray-200 text-gray-500';
  };

  // Obtener icono según estado
  const getEstadoIcono = (estado) => {
    const iconos = {
      'trabajado': '✓',
      'libre': '○',
      'ausente': '✗',
      'incidente': '⚠',
      'justificado': '📄',
      'sin_turno': '—'
    };
    return iconos[estado] || '';
  };

  // Estadísticas del mes
  const estadisticasMes = computed(() => {
    // Si tenemos estadísticas del backend, usarlas
    if (estadisticas.value) {
      return {
        trabajados: estadisticas.value.diasTrabajados || 0,
        libres: estadisticas.value.diasLibres || 0,
        ausentes: estadisticas.value.diasAusentes || 0,
        incidentes: estadisticas.value.diasConIncidente || 0,
        justificados: estadisticas.value.diasJustificados || 0,
        sinTurno: estadisticas.value.diasSinTurno || 0,
        total: estadisticas.value.totalDias || 0
      };
    }

    // Fallback: calcular desde los días si no hay estadísticas
    const stats = {
      trabajados: 0,
      libres: 0,
      ausentes: 0,
      incidentes: 0,
      justificados: 0,
      sinTurno: 0,
      total: diasTrabajados.value.length
    };

    diasTrabajados.value.forEach(dia => {
      if (dia.estado === 'trabajado') stats.trabajados++;
      else if (dia.estado === 'libre') stats.libres++;
      else if (dia.estado === 'ausente') stats.ausentes++;
      else if (dia.estado === 'incidente') stats.incidentes++;
      else if (dia.estado === 'justificado') stats.justificados++;
      else if (dia.estado === 'sin_turno') stats.sinTurno++;
    });

    return stats;
  });

  // Computed para horas extras
  const horasExtrasInfo = computed(() => {
    if (!horasExtras.value) {
      return {
        aprobadas: '0:00',
        acumuladas: '0:00',
        pendientes: '0:00',
        tieneAprobadas: false,
        tieneAcumuladas: false
      };
    }

    return {
      aprobadas: horasExtras.value.horasAprobadas || '0:00',
      acumuladas: horasExtras.value.horasAcumuladas || '0:00',
      pendientes: horasExtras.value.horasPendientes || '0:00',
      tieneAprobadas: horasExtras.value.horasAprobadas && horasExtras.value.horasAprobadas !== '0:00',
      tieneAcumuladas: horasExtras.value.horasAcumuladas && horasExtras.value.horasAcumuladas !== '0:00'
    };
  });

  // Función para formatear minutos a horas
  const formatearMinutosAHoras = (minutos) => {
    if (!minutos || minutos === 0) return null;
    const horas = Math.floor(Math.abs(minutos) / 60);
    const mins = Math.abs(minutos) % 60;
    const signo = minutos < 0 ? '-' : '+';
    return `${signo}${horas}:${String(mins).padStart(2, '0')}`;
  };

  // Función para determinar si tiene horas extras
  const tieneHorasExtras = (dia) => {
    return dia.minutosExtra && dia.minutosExtra > 0;
  };

  // Función para determinar si tiene retraso
  const tieneRetraso = (dia) => {
    return dia.minutosRetraso && dia.minutosRetraso > 0;
  };

  return {
    diasTrabajados,
    isLoading,
    isLoadingHorasExtras,
    error,
    mesActual,
    anioActual,
    nombreMes,
    diasCalendario,
    estadisticasMes,
    horasExtrasInfo,
    fetchDiasTrabajados,
    fetchHorasExtras,
    cambiarMes,
    irMesActual,
    getEstadoColor,
    getEstadoIcono,
    formatearMinutosAHoras,
    tieneHorasExtras,
    tieneRetraso
  };
}
