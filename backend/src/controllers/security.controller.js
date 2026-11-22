import { query } from '../database/pool.js';

export async function getAlerts(req, res, next) {
  try {
    const alerts = await query('SELECT * FROM security_events ORDER BY created_at DESC');
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

export async function resolveAlert(req, res, next) {
  try {
    const { id } = req.params;
    await query('UPDATE security_events SET resolved = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: 'Alert resolved' });
  } catch (err) {
    next(err);
  }
}