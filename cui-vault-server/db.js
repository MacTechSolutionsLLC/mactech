/**
 * PostgreSQL access for CUI vault (cui_records table).
 * Table: id (uuid), ciphertext (bytea), nonce (bytea), tag (bytea), mime_type (text), created_at (timestamptz).
 */
const { Pool } = require('pg')

let pool = null

function getPool(config) {
  if (!pool) {
    pool = new Pool(config)
  }
  return pool
}

async function insertRecord(client, id, ciphertext, nonce, tag, mimeType) {
  const q = `
    INSERT INTO cui_records (id, ciphertext, nonce, tag, mime_type, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, mime_type, created_at
  `
  const res = await client.query(q, [id, ciphertext, nonce, tag, mimeType || 'application/octet-stream'])
  return res.rows[0]
}

async function getRecord(client, id) {
  const q = `SELECT id, ciphertext, nonce, tag, mime_type, created_at FROM cui_records WHERE id = $1`
  const res = await client.query(q, [id])
  return res.rows[0] || null
}

async function deleteRecord(client, id) {
  const q = `DELETE FROM cui_records WHERE id = $1`
  const res = await client.query(q, [id])
  return res.rowCount > 0
}

module.exports = {
  getPool,
  insertRecord,
  getRecord,
  deleteRecord,
}
