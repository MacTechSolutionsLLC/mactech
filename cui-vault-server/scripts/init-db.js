/**
 * Create cui_records table if not exists.
 * Run with: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (or defaults from config).
 */
const { getConfig } = require('../config')
const { Pool } = require('pg')

const sql = `
CREATE TABLE IF NOT EXISTS cui_records (
  id UUID PRIMARY KEY,
  ciphertext BYTEA NOT NULL,
  nonce BYTEA NOT NULL,
  tag BYTEA NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`

async function main() {
  const config = getConfig()
  const pool = new Pool(config.dbConfig)
  try {
    await pool.query(sql)
    console.log('Table cui_records ready.')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
