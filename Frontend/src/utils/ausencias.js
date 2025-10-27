// Util para calcular ausencias a partir de un array de días
// Cada día puede contener propiedades variadas. Se normaliza internamente.
export function calcularAusencias(dias = [], options = {}) {
  const { workingDaysPerWeek = 5, excludeWeekends = true, assignedShifts = [] } = options || {};

  // Helper para determinar si una fecha cae en fin de semana
  function esFinDeSemana(fechaStr) {
    try {
      // parsear fechas tipo 'YYYY-MM-DD' como fecha local para evitar desplazamientos UTC
      const parseLocalDate = (s) => {
        if (!s) return new Date(s);
        if (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
          const [y, m, d] = s.split('-').map(Number);
          return new Date(y, m - 1, d);
        }
        return new Date(s);
      };
      const d = parseLocalDate(fechaStr);
      const day = d.getDay(); // 0=Dom,6=Sab
      return day === 0 || day === 6;
    } catch (e) {
      return false;
    }
  }

  // Helper: determina si para una fecha dada existe un turno asignado que cubra ese día
  function estaAsignadoEnFecha(fechaStr) {
    if (!assignedShifts || !assignedShifts.length) return true; // si no hay info, asumir asignado
    try {
      const parseLocalDate = (s) => {
        if (!s) return new Date(s);
        if (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
          const [y, m, d] = s.split('-').map(Number);
          return new Date(y, m - 1, d);
        }
        return new Date(s);
      };
      const target = parseLocalDate(fechaStr);
      // normalizador: elimina tildes/diacríticos y devuelve minúsculas
      const normalizeWeekday = (s) => {
        if (!s) return '';
        return String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
      };
      for (const t of assignedShifts) {
        // Normalizar posibles nombres de campo de fecha inicio/fin
        const startKeys = ['fecha_inicio','fechaInicio','start','desde','fecha_desde'];
        const endKeys = ['fecha_fin','fechaFin','end','hasta','fecha_hasta','fechaFin'];
        let start = null;
        let end = null;
        for (const k of startKeys) {
          if (t[k]) { start = new Date(t[k]); break; }
        }
        for (const k of endKeys) {
          if (t[k]) { end = new Date(t[k]); break; }
        }
        // If shift has days of week constraints, check them
        if (t.dias && Array.isArray(t.dias) && t.dias.length) {
          // normalizar tanto el nombre del día objetivo como los días del turno
          const weekdayFull = target.toLocaleDateString('es-CL', { weekday: 'long' }).toLowerCase();
          const weekdayNorm = normalizeWeekday(weekdayFull).slice(0,3);
          const diasNorm = t.dias.map(dn => normalizeWeekday(dn).slice(0,3));
          if (!diasNorm.includes(weekdayNorm)) continue; // este turno no aplica para ese día
        }
        // If start exists and target is before start => not assigned
        if (start && target < start) continue;
        // If end exists and target is after end => not assigned
        if (end && target > end) continue;
        // If passed checks, consider assigned
        return true;
      }
      return false;
    } catch (e) {
      return true;
    }
  }

  // Normalizar cada día a un formato esperado
  const normalizados = dias.map(d => ({
    fecha: d?.fecha || d?.fecha_marcacion || d?.date || null,
    hora_entrada: d?.hora_entrada || d?.entrada || d?.entrada_hora || d?.hora || null,
    hora_salida: d?.hora_salida || d?.salida || d?.salida_hora || null,
    presente: !!(d?.presente || d?.hora_entrada || d?.entrada || d?.registros?.length),
    justificada: !!d?.justificada || !!d?.ausenciaJustificada || d?.estado === 'AUSENCIA_JUSTIFICADA',
    injustificada: !!d?.injustificada || !!d?.ausenciaInjustificada || d?.estado === 'AUSENCIA_INJUSTIFICADA'
  }));

  const fechasAusentes = [];
  let ausenciasJustificadas = 0;
  let ausenciasInjustificadas = 0;

  normalizados.forEach(d => {
    if (!d.fecha) return; // ignorar si no hay fecha
    if (excludeWeekends && esFinDeSemana(d.fecha)) return;
    // Si no estaba asignado ese día (por turno), no contar como ausencia
    if (!estaAsignadoEnFecha(d.fecha)) return;

    const estaPresente = d.presente;
    if (!estaPresente) {
      fechasAusentes.push(d.fecha);
      if (d.justificada) ausenciasJustificadas++;
      else if (d.injustificada) ausenciasInjustificadas++;
    }
  });

  const totalAusencias = fechasAusentes.length;

  return {
    totalAusencias,
    fechasAusentes,
    ausenciasJustificadas,
    ausenciasInjustificadas
  };
}

// Helper exportado: determina si una fecha está cubierta por alguno de los turnos asignados
export function fechaTieneTurno(fechaStr, assignedShifts = []) {
  if (!assignedShifts || !assignedShifts.length) return true;
  try {
    const parseLocalDate = (s) => {
      if (!s) return new Date(s);
      if (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      return new Date(s);
    };
    const target = parseLocalDate(fechaStr);
    const normalizeWeekday = (s) => {
      if (!s) return '';
      return String(s).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    };
    for (const t of assignedShifts) {
      const startKeys = ['fecha_inicio','fechaInicio','start','desde','fecha_desde'];
      const endKeys = ['fecha_fin','fechaFin','end','hasta','fecha_hasta','fechaFin'];
      let start = null;
      let end = null;
      for (const k of startKeys) {
        if (t[k]) { start = new Date(t[k]); break; }
      }
      for (const k of endKeys) {
        if (t[k]) { end = new Date(t[k]); break; }
      }
      if (t.dias && Array.isArray(t.dias) && t.dias.length) {
        const weekdayFull = target.toLocaleDateString('es-CL', { weekday: 'long' }).toLowerCase();
        const weekdayNorm = normalizeWeekday(weekdayFull).slice(0,3);
        const diasNorm = t.dias.map(dn => normalizeWeekday(dn).slice(0,3));
        if (!diasNorm.includes(weekdayNorm)) continue;
      }
      if (start && target < start) continue;
      if (end && target > end) continue;
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
}

export default { calcularAusencias };
