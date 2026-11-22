import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${req.method} ${req.originalUrl} → ${status}: ${message}`);

  res.status(status).json({
    success: false,
    error: {
      message,
      status,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}