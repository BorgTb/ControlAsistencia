import pool from '../config/dbconfig.js';

const list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, DATE_FORMAT(fecha, "%Y-%m-%d") AS fecha, nombre, irrenunciable, created_at, updated_at FROM feriados ORDER BY fecha ASC');
    return res.json(rows);
  } catch (err) {
    console.error('Feriados.list error', err);
    return res.status(500).json({ error: 'Error listando feriados' });
  }
};

const getOne = async (req, res) => {
  try {
    const id = req.params.id;
  const [rows] = await pool.query('SELECT id, DATE_FORMAT(fecha, "%Y-%m-%d") AS fecha, nombre, irrenunciable FROM feriados WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('Feriados.get error', err);
    return res.status(500).json({ error: 'Error obteniendo feriado' });
  }
};

const create = async (req, res) => {
  try {
    const { fecha, nombre, irrenunciable } = req.body;
    if (!fecha) return res.status(400).json({ error: 'fecha requerida (YYYY-MM-DD)' });

    await pool.query(
      'INSERT INTO feriados (fecha, nombre, irrenunciable) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), irrenunciable = VALUES(irrenunciable), updated_at = CURRENT_TIMESTAMP',
      [fecha, nombre || null, irrenunciable ? 1 : 0]
    );

    const [rows] = await pool.query('SELECT id, DATE_FORMAT(fecha, "%Y-%m-%d") AS fecha, nombre, irrenunciable FROM feriados WHERE fecha = ?', [fecha]);
    return res.json(rows[0]);
  } catch (err) {
    console.error('Feriados.create error', err);
    return res.status(500).json({ error: 'Error creando feriado' });
  }
};

const update = async (req, res) => {
  try {
    const id = req.params.id;
  const { fecha, nombre, irrenunciable } = req.body;
  const [result] = await pool.query('UPDATE feriados SET fecha = ?, nombre = ?, irrenunciable = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [fecha, nombre || null, irrenunciable ? 1 : 0, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'No encontrado' });
  const [rows] = await pool.query('SELECT id, DATE_FORMAT(fecha, "%Y-%m-%d") AS fecha, nombre, irrenunciable FROM feriados WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error('Feriados.update error', err);
    return res.status(500).json({ error: 'Error actualizando feriado' });
  }
};

const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const { fecha } = req.query;
    if (fecha) {
      const [result] = await pool.query('DELETE FROM feriados WHERE fecha = ?', [fecha]);
      return res.json({ deleted: result.affectedRows });
    } else {
      const [result] = await pool.query('DELETE FROM feriados WHERE id = ?', [id]);
      return res.json({ deleted: result.affectedRows });
    }
  } catch (err) {
    console.error('Feriados.remove error', err);
    return res.status(500).json({ error: 'Error borrando feriado' });
  }
};

export default { list, getOne, create, update, remove };
