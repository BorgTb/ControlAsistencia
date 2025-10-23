import { ref, computed } from 'vue';
import diasTrabajadosService from '../services/diasTrabajadosService';

export function useDiasTrabajados() {
  const diasTrabajados = ref([]);
  const estadisticas = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const mesActual = ref(new Date().getMonth());
  const anioActual = ref(new Date().getFullYear());

  // Obtener datos de días trabajados
  const fetchDiasTrabajados = async (userId, mes, anio) => {
    isLoading.value = true;
    error.value = null;
    try {
      // Convertir mes de JavaScript (0-11) a mes normal (1-12)
      const mesBackend = mes + 1;
      const response = await diasTrabajadosService.getCalendarioMensual(userId, mesBackend, anio);
      
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
        estado: diaData?.estado || null,
        horaEntrada: diaData?.horaEntrada || null,
        horaSalida: diaData?.horaSalida || null,
        incidente: diaData?.incidente || null,
        esHoy: esHoy(dia)
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
      'incidente': 'bg-yellow-100 border-yellow-300 text-yellow-800'
    };
    return colores[estado] || 'bg-gray-50 border-gray-200 text-gray-500';
  };

  // Obtener icono según estado
  const getEstadoIcono = (estado) => {
    const iconos = {
      'trabajado': '✓',
      'libre': '○',
      'ausente': '✗',
      'incidente': '⚠'
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
        total: estadisticas.value.totalDias || 0
      };
    }

    // Fallback: calcular desde los días si no hay estadísticas
    const stats = {
      trabajados: 0,
      libres: 0,
      ausentes: 0,
      incidentes: 0,
      total: diasTrabajados.value.length
    };

    diasTrabajados.value.forEach(dia => {
      if (dia.estado === 'trabajado') stats.trabajados++;
      else if (dia.estado === 'libre') stats.libres++;
      else if (dia.estado === 'ausente') stats.ausentes++;
      else if (dia.estado === 'incidente') stats.incidentes++;
    });

    return stats;
  });

  return {
    diasTrabajados,
    isLoading,
    error,
    mesActual,
    anioActual,
    nombreMes,
    diasCalendario,
    estadisticasMes,
    fetchDiasTrabajados,
    cambiarMes,
    irMesActual,
    getEstadoColor,
    getEstadoIcono
  };
}
