import { Router } from 'express';
import { query } from '../database/pool.js';

const router = Router();

router.get('/stats', async (req, res, next) => {
  try {
    const devices = await query('SELECT status, COUNT(*) as count FROM iot_devices GROUP BY status');
    
    let total = 0;
    let online = 0;
    devices.forEach(d => {
      total += Number(d.count);
      if (d.status === 'online') online += Number(d.count);
    });

    const alerts = await query('SELECT COUNT(*) as count FROM security_events WHERE resolved = 0');
    
    res.json({
      success: true,
      data: {
        totalDevices: total,
        activeDevices: online,
        offlineDevices: total - online,
        activeAlerts: Number(alerts[0].count)
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;