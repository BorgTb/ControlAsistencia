// Servicio simple para consumir la API de feriados
const BASE = '/api/feriados';

async function list() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error('Error cargando feriados');
  return res.json();
}

async function create(payload) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Error creando feriado');
  return res.json();
}

async function removeById(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error borrando feriado');
  return res.json();
}

async function removeByFecha(fecha) {
  const url = `${BASE}?fecha=${encodeURIComponent(fecha)}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error borrando feriado por fecha');
  return res.json();
}

export default { list, create, removeById, removeByFecha };
