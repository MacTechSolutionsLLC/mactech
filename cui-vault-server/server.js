/**
 * CUI Vault API server - implements docs/CUI_VAULT_API_CONTRACT.md
 * POST /v1/files/upload (Bearer JWT), GET /v1/files/:vaultId (?token= JWT), DELETE /v1/files/:vaultId (X-VAULT-KEY)
 * CORS enabled so browser can upload from app origin (e.g. www.mactechsolutionsllc.com).
 */
const express = require('express')
const multer = require('multer')
const { getConfig } = require('./config')
const { getKey, encrypt, decrypt } = require('./crypto-util')
const { verify: verifyJwt } = require('./jwt-util')
const { getPool, insertRecord, getRecord, deleteRecord } = require('./db')
const crypto = require('crypto')

const app = express()
const config = getConfig()

// CORS: allow browser uploads from app origin(s). Comma-separated list or * for any.
const corsOrigins = (process.env.CUI_VAULT_CORS_ORIGIN || '*').split(',').map(s => s.trim()).filter(Boolean)
function corsMiddleware(req, res, next) {
  const origin = req.headers.origin
  const allow = corsOrigins.length === 0 || corsOrigins.includes('*')
    ? '*'
    : (origin && corsOrigins.includes(origin) ? origin : corsOrigins[0])
  res.set('Access-Control-Allow-Origin', allow)
  res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.set('Access-Control-Max-Age', '86400')
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  next()
}
app.use(corsMiddleware)

if (!config.jwtSecret || !config.apiKey || !config.encryptionKeyHex) {
  console.error('Missing required env: CUI_VAULT_JWT_SECRET (or CUI_VAULT_API_KEY), CUI_VAULT_API_KEY, CUI_ENCRYPTION_KEY')
  process.exit(1)
}

let keyBuffer
try {
  keyBuffer = getKey(config.encryptionKeyHex)
} catch (e) {
  console.error('CUI_ENCRYPTION_KEY invalid:', e.message)
  process.exit(1)
}

const pool = getPool(config.dbConfig)
const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSizeBytes },
})

// Health for reverse proxy / monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// POST /v1/files/upload — Bearer JWT (action=upload), multipart file
app.post('/v1/files/upload', multerUpload.single('file'), async (req, res) => {
  const auth = req.headers.authorization
  const token = auth && auth.startsWith('Bearer ') ? auth.slice(7) : null
  const payload = token ? verifyJwt(token, config.jwtSecret) : null
  if (!payload || payload.action !== 'upload') {
    return res.status(401).json({ detail: 'Unauthorized' })
  }
  const file = req.file
  if (!file || !file.buffer) {
    return res.status(400).json({ detail: 'No file in request' })
  }

  try {
    const { ciphertext, nonce, tag } = encrypt(file.buffer, keyBuffer)
    const id = crypto.randomUUID()
    const client = await pool.connect()
    try {
      const row = await insertRecord(client, id, ciphertext, nonce, tag, file.mimetype || 'application/octet-stream')
      const sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex')
      res.status(201).json({
        vaultId: row.id,
        sha256,
        size: file.size,
        mimeType: row.mime_type,
        createdAt: row.created_at,
      })
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ detail: 'Internal server error' })
  }
})

// GET /v1/files/:vaultId — ?token= JWT (action=view, vaultId)
app.get('/v1/files/:vaultId', async (req, res) => {
  const token = req.query.token
  const payload = token ? verifyJwt(token, config.jwtSecret) : null
  if (!payload || payload.action !== 'view') {
    return res.status(401).json({ detail: 'Unauthorized' })
  }
  const vaultId = req.params.vaultId
  if (payload.vaultId !== vaultId) {
    return res.status(403).json({ detail: 'Forbidden' })
  }

  try {
    const client = await pool.connect()
    let row
    try {
      row = await getRecord(client, vaultId)
    } finally {
      client.release()
    }
    if (!row) {
      return res.status(404).json({ detail: 'Not found' })
    }
    const plaintext = decrypt(row.ciphertext, row.nonce, row.tag, keyBuffer)
    res.set('Content-Type', row.mime_type || 'application/octet-stream')
    res.set('Content-Disposition', `inline; filename="${vaultId}"`)
    res.send(plaintext)
  } catch (err) {
    console.error('Get error:', err)
    res.status(500).json({ detail: 'Internal server error' })
  }
})

// DELETE /v1/files/:vaultId — X-VAULT-KEY
app.delete('/v1/files/:vaultId', async (req, res) => {
  const key = req.headers['x-vault-key']
  if (!key || key !== config.apiKey) {
    return res.status(401).json({ detail: 'Unauthorized' })
  }
  const vaultId = req.params.vaultId

  try {
    const client = await pool.connect()
    let deleted
    try {
      deleted = await deleteRecord(client, vaultId)
    } finally {
      client.release()
    }
    if (deleted) {
      return res.status(204).send()
    }
    return res.status(404).send()
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ detail: 'Internal server error' })
  }
})

const bind = process.env.BIND || '127.0.0.1'
const server = app.listen(config.port, bind, () => {
  console.log(`CUI Vault listening on ${bind}:${config.port}`)
})

function shutdown() {
  server.close(() => {
    pool.end().then(() => process.exit(0)).catch(() => process.exit(1))
  })
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
