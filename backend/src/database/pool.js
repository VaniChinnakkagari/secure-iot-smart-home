import mysql from 'mysql2/promise';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: config.db.connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      timezone: 'Z',
      dateStrings: false,
    });
    logger.info('MySQL pool created');
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function withTransaction(fn) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await fn(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function testConnection() {
  try {
    const conn = await getPool().getConnection();
    await conn.ping();
    conn.release();
    logger.success(`MySQL connected → ${config.db.host}:${config.db.port}/${config.db.database}`);
    return true;
  } catch (err) {
    logger.error(`MySQL connection failed: ${err.message}`);
    return false;
  }
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('MySQL pool closed');
  }
}