<template>
  <div class="max-w-6xl mx-auto py-6 px-4">
    <div class="flex items-center justify-end gap-2 mb-6">
      <button @click="volverReportes" class="text-sm text-gray-600 px-3 py-1 rounded hover:bg-gray-100">← Reportes</button>
      <button @click.prevent="descargarCSV" class="bg-blue-600 text-white px-3 py-1 rounded text-sm">Exportar CSV</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Tarjeta izquierda: pendientes -->
      <div class="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-200">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-semibold">M</div>
            <div>
              <h3 class="text-sm font-semibold">Usuarios que deben marcar hoy</h3>
              <div class="text-xs text-gray-500">Lista de trabajadores programados para hoy</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs px-2 py-1 rounded-full">{{ faltantes.length }}</span>
          </div>
        </div>

        <div v-if="loading" class="text-sm text-gray-500">Cargando...</div>

        <div v-else>
          <table class="min-w-full text-left">
            <thead>
              <tr class="text-xs text-gray-600 uppercase tracking-wide">
                <th class="px-3 py-2"></th>
                <th class="px-4 py-3">Nombre</th>
                <th class="px-4 py-3">RUT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in faltantes" :key="u.id || u.rut"
                  class="border-b hover:bg-blue-50 cursor-pointer transition-colors duration-150 transform hover:-translate-y-0.5"
                  :class="{ 'ring-2 ring-indigo-100': selectedUser && selectedUser.id === u.id }"
                  @click="seleccionarUsuario(u)">
                <td class="px-3 py-2">
                  <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-medium text-sm">{{ initials(u.nombre) }}</div>
                </td>
                <td class="px-4 py-2">{{ u.nombre }}</td>
                <td class="px-4 py-2">{{ u.rut }}</td>
              </tr>
              <tr v-if="faltantes.length === 0">
                <td colspan="3" class="px-4 py-6 text-sm text-gray-600">
                  <span v-if="scheduledCount > 0">Todos los trabajadores marcaron asistencia.</span>
                  <span v-else>No hay usuarios pendientes de marcar hoy.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tarjeta derecha: ya marcaron -->
      <div class="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-200">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center font-semibold">A</div>
            <div>
              <h3 class="text-sm font-semibold">Usuarios que ya marcaron hoy</h3>
              <div class="text-xs text-gray-500">Registros recibidos durante el día</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs px-2 py-1 rounded-full">{{ usuariosMarcados.length }}</span>
          </div>
        </div>
        <div v-if="usuariosMarcados.length === 0" class="text-sm text-gray-500">Nadie ha marcado asistencia hoy.</div>
        <div v-else>
          <table class="min-w-full text-left">
            <thead>
              <tr class="text-xs text-gray-600 uppercase tracking-wide">
                <th class="px-3 py-2"></th>
                <th class="px-4 py-3">Nombre</th>
                <th class="px-4 py-3">RUT</th>
                <th class="px-4 py-3">Entrada</th>
                <th class="px-4 py-3">Salida</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuariosMarcados" :key="u.id || u.rut" class="border-b hover:bg-green-50 cursor-pointer transition-colors duration-150 transform hover:-translate-y-0.5" @click="seleccionarMarcado(u)">
                <td class="px-3 py-2">
                  <div class="w-8 h-8 rounded-full bg-green-50 text-emerald-700 flex items-center justify-center font-medium text-sm">{{ initials(u.nombre) }}</div>
                </td>
                <td class="px-4 py-2">{{ u.nombre }}</td>
                <td class="px-4 py-2">{{ u.rut }}</td>
                <td class="px-4 py-2">{{ u.entrada || '-' }}</td>
                <td class="px-4 py-2">{{ u.salida || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Panel inferior: mostrar horario del día para el usuario seleccionado -->
    <div v-if="selectedUser" class="mt-6 border-t pt-4">
      <h4 class="text-sm font-medium">Horario de hoy — {{ selectedUser.nombre }}</h4>
      <div v-if="loadingTurnos" class="text-sm text-gray-500 mt-2">Cargando horario...</div>
      <div v-else class="mt-2">
        <div v-if="todayShifts && todayShifts.length">
          <ul class="space-y-2 text-sm">
            <li v-for="(t, idx) in todayShifts" :key="t.id || idx" class="p-2 bg-gray-50 rounded border">
              <div><strong>Turno:</strong> {{ t.nombre || t.tipo_turno || t.horario || (t.hora_inicio || t.horaInicio) || '—' }}</div>
              <div class="text-xs text-gray-600">Desde: {{ formatearHoraTurno(t) }} — Fecha inicio: {{ formatoFechaTurno(t.fecha_inicio) || '—' }}</div>
            </li>
          </ul>
        </div>
        <div v-else class="text-sm text-gray-500">No hay horario asignado para hoy.</div>
      </div>
      <div class="mt-3">
        <h5 class="text-sm font-medium">Detalle de marcación</h5>
        <div v-if="selectedMarcacion" class="text-sm text-gray-700 mt-1">
          <div><strong>Entrada:</strong> {{ selectedMarcacion.entrada || '-' }}</div>
          <div><strong>Salida:</strong> {{ selectedMarcacion.salida || '-' }}</div>
        </div>
        <div v-else class="text-sm text-gray-500">No hay registro de marcación para este usuario hoy.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmpresa } from '../../../composables/useEmpresa.js'
import { useAuth } from '../../../composables/useAuth.js'
import EmpresaService from '../../../services/EmpresaService.js'
import { fechaTieneTurno } from '../../../utils/ausencias.js'

const router = useRouter()
const { user } = useAuth()
const { obtenerTrabajadores, obtenerMarcacionesPorEmpresa, obtenerTurnos, obtenerTiposTurnos } = useEmpresa()

const loading = ref(true)
const trabajadores = ref([])
const marcacionesHoy = ref([])
const tiposTurnos = ref([])
const turnosAsignados = ref([])
const selectedUser = ref(null)
const selectedUserTurnos = ref([])
const todayShifts = ref([])
const loadingTurnos = ref(false)
const selectedMarcacion = ref(null)

async function load() {
  loading.value = true
  try {
    const t = await obtenerTrabajadores()
    if (Array.isArray(t)) trabajadores.value = t

    // obtener marcaciones para HOY (formato YYYY-MM-DD)
    const hoy = new Date().toISOString().slice(0, 10)
    const m = await obtenerMarcacionesPorEmpresa(hoy)
    if (Array.isArray(m)) marcacionesHoy.value = m

    // obtener turnos y tipos de turnos para saber quién debe marcar hoy
    try {
      const tt = await obtenerTiposTurnos()
      if (Array.isArray(tt)) tiposTurnos.value = tt
    } catch (e) {
      // no crítico, continuar
      console.warn('No se pudieron cargar tipos de turnos:', e)
      tiposTurnos.value = []
    }

    try {
      const tr = await obtenerTurnos()
      if (Array.isArray(tr)) turnosAsignados.value = tr
    } catch (e) {
      console.warn('No se pudieron cargar turnos asignados:', e)
      turnosAsignados.value = []
    }
  } catch (err) {
    console.error('Error cargando datos de marcaciones/trabajadores:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => { load() })

// Computed: usuarios que ya marcaron hoy (agrupar por usuario)
const usuariosMarcados = computed(() => {
  // construimos mapa por usuario y luego lo filtramos por TURNOS aplicables hoy
  const map = new Map()
  // Normalizar marcacionesHoy: puede venir como array o como objeto { userId: [..], ... }
  let rawMarc = []
  if (Array.isArray(marcacionesHoy.value)) {
    rawMarc = marcacionesHoy.value
  } else if (marcacionesHoy.value && typeof marcacionesHoy.value === 'object') {
    // aplanar valores que pueden ser arrays o registros individuales
    rawMarc = Object.values(marcacionesHoy.value).flatMap(v => Array.isArray(v) ? v : (v ? [v] : []))
  } else {
    rawMarc = []
  }
  rawMarc.forEach(m => {
    const id = m.usuario_empresa_id || m.usuario_id || m.trabajador_id || m.user_id || (m.usuario && (m.usuario.id || m.usuario.usuario_empresa_id)) || null
    const rut = m.rut || m.cedula || m.user_rut || m.rut_trabajador || m.usuario_rut || ''
    const nombre = m.nombre || m.usuario_nombre || m.trabajador_nombre || (m.usuario && (m.usuario.nombre || `${m.usuario.usuario_nombre || ''} ${m.usuario.usuario_apellido_pat || ''}`)) || ''
    const key = id || rut || nombre
    if (!map.has(key)) {
      // Collect possible id variants to match against turnos later
      const ids = []
      if (m.usuario_empresa_id) ids.push(String(m.usuario_empresa_id))
      if (m.usuario_id) ids.push(String(m.usuario_id))
      if (m.trabajador_id) ids.push(String(m.trabajador_id))
      if (m.user_id) ids.push(String(m.user_id))
      if (m.usuario && (m.usuario.id || m.usuario.usuario_empresa_id)) ids.push(String(m.usuario.id || m.usuario.usuario_empresa_id))
      const uniqIds = Array.from(new Set(ids))
      map.set(key, { id, ids: uniqIds, nombre: nombre || 'Sin nombre', rut: rut || '', registros: [] })
    }
    const rec = map.get(key)
    rec.registros.push(m)
  })

  // helpers para comparar horas
  function parseTimeToMinutes(t) {
    if (!t) return null
    try {
      const s = String(t).trim()
      // Soporta ISO datetime: 2025-11-05T11:05:00.000Z
      const iso = s.match(/\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})(?::(\d{2}))?/)
      if (iso) {
        const hh = parseInt(iso[1], 10)
        const mm = parseInt(iso[2], 10)
        return hh * 60 + mm
      }
      const m = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/) // HH:MM(:SS)?
      if (!m) return null
      const hh = parseInt(m[1], 10)
      const mm = parseInt(m[2], 10)
      return hh * 60 + mm
    } catch (e) { return null }
  }

  function turnoRangeMinutes(t) {
    const start = parseTimeToMinutes(t.hora_inicio || t.horaInicio || t.inicio || t.hora_inicio_turno || t.hora_ini)
    const end = parseTimeToMinutes(t.hora_fin || t.horaFin || t.fin || t.hora_fin_turno || t.hora_fin)
    return { start, end }
  }

  const hoyStr = new Date().toISOString().split('T')[0]

  // DEBUG: en dev, volcar algunas métricas para depuración
  if (import.meta.env && import.meta.env.DEV) {
    try {
      console.debug('DEBUG usuariosMarcados: marcacionesHoy count=', rawMarc.length, 'sourceKeys=', marcacionesHoy.value && typeof marcacionesHoy.value === 'object' ? Object.keys(marcacionesHoy.value).length : 0)
    } catch (e) {}
  }

  const results = []
  for (const v of map.values()) {
    // buscar turnos asignados a este trabajador usando cualquiera de los ids conocidos
    const ids = Array.isArray(v.ids) ? v.ids : (v.id ? [String(v.id)] : [])
    const assigned = (turnosAsignados.value || []).filter(t => {
      const id = String(t.usuario_empresa_id || t.usuario_id || t.trabajador_id || t.user_id || t.id || '')
      return ids.length > 0 && ids.includes(id)
    })

    // filtrar solo turnos que aplican a HOY
    const aplicables = assigned.filter(t => {
      try { return fechaTieneTurno(hoyStr, [t]) } catch (e) { return false }
    })

    if (!aplicables || aplicables.length === 0) continue // si no tiene turno hoy, ignorar

    // calcular rangos de minutos de los turnos aplicables
    const ranges = aplicables.map(t => turnoRangeMinutes(t)).filter(r => r.start !== null && r.end !== null)

    // si no hay rangos con horas definidas, todavía permitimos coincidencia por fecha: considerar registros de hoy
    const registros = Array.isArray(v.registros) ? v.registros : []
    const matchedRecords = []
    registros.forEach(m => {
      const horaVal = m.hora || m.hora_marcacion || m.hora_marc || m.hora_marcacion_entrada || m.entrada || m.hora_entrada || m.salida || m.hora_salida || ''
      const recMinutes = parseTimeToMinutes(horaVal)
      if (ranges.length > 0) {
        if (recMinutes === null) return
        const ok = ranges.some(r => recMinutes >= r.start && recMinutes <= r.end)
        if (ok) matchedRecords.push(m)
      } else {
        // no hay horas en los turnos, considerar cualquier registro cuya fecha sea hoy
        const fechaRegistro = (m.fecha || m.fecha_marcacion || m.created_at || m.createdAt || m.fecha_registro || '').toString().slice(0,10)
        if (!fechaRegistro || fechaRegistro === hoyStr) matchedRecords.push(m)
      }
    })

    if (matchedRecords.length === 0) continue

    if (import.meta.env && import.meta.env.DEV) {
      try {
        console.debug(`DEBUG usuario ${v.id || v.rut} ids=${JSON.stringify(v.ids||[])}: assigned=${assigned.length} aplicables=${aplicables.length} ranges=${ranges.map(r=>`${r.start}-${r.end}`).join(',')} registros=${registros.length} matched=${matchedRecords.length}`)
      } catch(e){}
    }

    // Determinar entrada/salida entre matchedRecords
    const entradas = []
    const salidas = []
    matchedRecords.forEach(m => {
      const tipo = String(m.tipo || m.tipo_marcacion || m.registro_tipo || '').toLowerCase()
      const hora = m.hora || m.hora_marcacion || m.hora_marc || m.hora_marcacion_entrada || m.entrada || m.hora_entrada || m.salida || m.hora_salida || ''
      if (tipo && tipo.includes('entrada')) entradas.push(hora)
      else if (tipo && tipo.includes('salida')) salidas.push(hora)
      else {
        // intentar inferir por campos
        if (m.entrada || m.hora_entrada) entradas.push(m.entrada || m.hora_entrada)
        if (m.salida || m.hora_salida) salidas.push(m.salida || m.hora_salida)
      }
    })

    entradas.sort()
    salidas.sort()
    results.push({ id: v.id, nombre: v.nombre, rut: v.rut, entrada: entradas.length ? entradas[0] : null, salida: salidas.length ? salidas[salidas.length-1] : null, registros: matchedRecords })
  }

  return results
})

const faltantes = computed(() => {
  if (!trabajadores.value || trabajadores.value.length === 0) return []

  // RUTs ya marcados hoy
  const marcRutSet = new Set()
  const marcWorkerIdSet = new Set()
  // Asegurar que iteramos una lista aplanada aunque la API devuelva { '42': [...], '43': [...] }
  const rawMarcForFaltantes = Array.isArray(marcacionesHoy.value)
    ? marcacionesHoy.value
    : (marcacionesHoy.value && typeof marcacionesHoy.value === 'object')
      ? Object.values(marcacionesHoy.value).flatMap(v => Array.isArray(v) ? v : (v ? [v] : []))
      : []
  rawMarcForFaltantes.forEach(m => {
    // posibles campos de RUT / cédula
    if (m.rut) marcRutSet.add(String(m.rut))
    if (m.cedula) marcRutSet.add(String(m.cedula))
    if (m.trabajador_rut) marcRutSet.add(String(m.trabajador_rut))
    if (m.user_rut) marcRutSet.add(String(m.user_rut))
    if (m.rut_trabajador) marcRutSet.add(String(m.rut_trabajador))
    if (m.usuario_rut) marcRutSet.add(String(m.usuario_rut))

    // posibles campos de id que vinculan la marcación con el trabajador/usuario_empresa
    if (m.usuario_empresa_id) marcWorkerIdSet.add(String(m.usuario_empresa_id))
    if (m.usuario_id) marcWorkerIdSet.add(String(m.usuario_id))
    if (m.trabajador_id) marcWorkerIdSet.add(String(m.trabajador_id))
    if (m.user_id) marcWorkerIdSet.add(String(m.user_id))
    if (m.usuario_id) marcWorkerIdSet.add(String(m.usuario_id))

    // campos anidados comunes
    if (m.usuario && (m.usuario.id || m.usuario.usuario_empresa_id)) {
      marcWorkerIdSet.add(String(m.usuario.id || m.usuario.usuario_empresa_id))
    }
    if (m.trabajador && m.trabajador.id) marcWorkerIdSet.add(String(m.trabajador.id))
  })

  // Determinar trabajadores que tienen turno HOY
  const scheduledIdSet = new Set()
  try {
    const diaIndex = new Date().getDay()
    const diasEsp = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado']
    const diaHoy = diasEsp[diaIndex]
    const hoyDate = new Date(new Date().toDateString()) // midnight today's date for comparisons

    turnosAsignados.value.forEach(turno => {
      try {
        // chequear rango de fechas si existen
        if (turno.fecha_inicio) {
          const inicio = new Date(turno.fecha_inicio)
          if (inicio > hoyDate) return
        }
        if (turno.fecha_fin) {
          const fin = new Date(turno.fecha_fin)
          if (fin < hoyDate) return
        }

        const tipo = tiposTurnos.value.find(t => t.id === turno.tipo_turno_id)
        if (tipo && Array.isArray(tipo.dias) && tipo.dias.length > 0) {
          const trabajaHoy = tipo.dias.some(d => d.trabaja && String(d.dia_semana).toLowerCase() === diaHoy)
          if (!trabajaHoy) return
        }

        const id = turno.usuario_empresa_id || turno.usuario_id || turno.trabajador_id || turno.user_id || turno.id
        if (id) scheduledIdSet.add(String(id))
      } catch (e) {
        // ignore malformed turno
      }
    })
  } catch (e) {
    console.warn('Error calculando turnos programados:', e)
  }

  // Filtrar trabajadores: deben estar programados HOY y no haber marcado
  return trabajadores.value.filter(w => {
    const workerId = String(w.id || w.usuario_empresa_id || w.trabajadorId || w.user_id || w.usuario_id || '')
    if (!workerId) return false
    if (scheduledIdSet.size > 0 && !scheduledIdSet.has(workerId)) return false

    const rut = String(w.rut || w.cedula || w.user_rut || w.rut_trabajador || w.usuario_rut || w.usuario_cedula || '')
    // Si el trabajador aparece por id en las marcaciones, consideramos que ya marcó
    if (marcWorkerIdSet.has(workerId)) return false
    return rut && !marcRutSet.has(rut)
  }).map(w => ({
    // Normalizar salida para la vista
    id: w.id || w.usuario_empresa_id || w.trabajadorId || w.user_id || null,
    nombre: w.nombre || `${w.usuario_nombre || ''} ${w.usuario_apellido_pat || ''} ${w.usuario_apellido_mat || ''}`.trim(),
    rut: w.rut || w.cedula || w.usuario_rut || w.usuario_cedula || ''
  }))
})

const scheduledCount = computed(() => {
  if (!turnosAsignados.value || turnosAsignados.value.length === 0) return 0
  const scheduledIdSet = new Set()
  try {
    const diaIndex = new Date().getDay()
    const diasEsp = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado']
    const diaHoy = diasEsp[diaIndex]
    const hoyDate = new Date(new Date().toDateString())

    turnosAsignados.value.forEach(turno => {
      try {
        if (turno.fecha_inicio) {
          const inicio = new Date(turno.fecha_inicio)
          if (inicio > hoyDate) return
        }
        if (turno.fecha_fin) {
          const fin = new Date(turno.fecha_fin)
          if (fin < hoyDate) return
        }
        const tipo = tiposTurnos.value.find(t => t.id === turno.tipo_turno_id)
        if (tipo && Array.isArray(tipo.dias) && tipo.dias.length > 0) {
          const trabajaHoy = tipo.dias.some(d => d.trabaja && String(d.dia_semana).toLowerCase() === diaHoy)
          if (!trabajaHoy) return
        }
        const id = turno.usuario_empresa_id || turno.usuario_id || turno.trabajador_id || turno.user_id || turno.id
        if (id) scheduledIdSet.add(String(id))
      } catch (e) {
        // ignore
      }
    })
  } catch (e) {
    return 0
  }
  return scheduledIdSet.size
})

function volverReportes() {
  router.push({ name: 'EmpresaReportes' }).catch(() => router.back())
}


function descargarCSV() {
  const headers = ['Nombre', 'RUT']
  const rows = faltantes.value.map(u => [u.nombre || '', u.rut || ''])
  const lines = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'faltantes_marcaciones_hoy.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function formatearHoraTurno(t) {
  // intentar obtener hora de inicio/salida en varios campos
  const h = t.hora_inicio || t.horaInicio || (t.horario && (String(t.horario).split('-')[0] || null)) || null
  return h || '—'
}

function initials(name) {
  if (!name) return ''
  try {
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase()
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase()
  } catch (e) {
    return String(name).slice(0,2).toUpperCase()
  }
}

function formatoFechaTurno(f) {
  if (!f) return null
  try {
    const d = new Date(f)
    return d.toLocaleDateString('es-CL')
  } catch (e) {
    return f
  }
}

async function seleccionarUsuario(u) {
  try {
    selectedUser.value = u
    selectedUserTurnos.value = []
    todayShifts.value = []
    loadingTurnos.value = true
    if (!u || !u.id) return
    // Obtener turnos asignados de la API para el trabajador
    try {
      const resp = await EmpresaService.obtenerTurnosTrabajador(u.id)
      const turnos = Array.isArray(resp) ? resp : (resp?.data || resp?.turnos || [])
      selectedUserTurnos.value = turnos
      // calcular qué turnos aplican a HOY
      const hoyStr = new Date().toISOString().split('T')[0]
      const aplicables = (turnos || []).filter(t => {
        try { return fechaTieneTurno(hoyStr, [t]) } catch (e) { return false }
      })
      todayShifts.value = aplicables
    } catch (e) {
      console.warn('No se pudieron obtener turnos del trabajador:', e)
      selectedUserTurnos.value = []
      todayShifts.value = []
    }
    } finally {
      loadingTurnos.value = false
    }
    // limpiar marcación seleccionada previa
    selectedMarcacion.value = null
}

// Seleccionar un usuario que ya marcó hoy (desde la tabla de marcados)
async function seleccionarMarcado(entry) {
  try {
    if (!entry) return
    // entry tiene id, nombre, rut, entrada, salida, registros
    const u = { id: entry.id, nombre: entry.nombre, rut: entry.rut }
    selectedMarcacion.value = { entrada: entry.entrada || null, salida: entry.salida || null }
    await seleccionarUsuario(u)
  } catch (e) {
    console.warn('Error seleccionando marcado:', e)
  }
}
</script>

<style scoped>
.hidden { display: none; }
</style>
