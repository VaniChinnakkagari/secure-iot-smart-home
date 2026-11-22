import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  logger.info('Connecting to MySQL (no database selected)...');

  const conn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  logger.success('Connected to MySQL server');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = await fs.readFile(schemaPath, 'utf8');

  logger.info('Executing schema.sql...');
  await conn.query(sql);
  logger.success('Schema applied');

  await conn.end();
  logger.success('Database initialization complete ✔');
}

run().catch((err) => {
  logger.error(`Init failed: ${err.message}`);
  process.exit(1);
});