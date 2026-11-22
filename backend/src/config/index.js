import dotenv from 'dotenv';
dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`❌ Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name, fallback) {
  return process.env[name] ?? fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: Number(optional('PORT', 5000)),
  clientOrigin: optional('CLIENT_ORIGIN', 'http://localhost:5173'),

  db: {
    host: required('DB_HOST'),
    port: Number(optional('DB_PORT', 3306)),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    connectionLimit: Number(optional('DB_CONNECTION_LIMIT', 10)),
  },

  rateLimit: {
    windowMs: Number(optional('RATE_LIMIT_WINDOW_MS', 900000)),
    max: Number(optional('RATE_LIMIT_MAX', 200)),
  },
};