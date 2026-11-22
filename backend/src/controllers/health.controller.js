import { testConnection } from '../database/pool.js';
import { logger } from '../utils/logger.js';

export async function getHealth(_req, res) {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'secure-iot-backend',
      env: process.env.NODE_ENV,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
}

export async function getDbHealth(_req, res, next) {
  try {
    const ok = await testConnection();
    if (!ok) {
      return res.status(503).json({
        success: false,
        error: { message: 'Database unreachable', status: 503 },
      });
    }
    res.json({ success: true, data: { database: 'connected' } });
  } catch (err) {
    logger.error(`DB health check failed: ${err.message}`);
    next(err);
  }
}