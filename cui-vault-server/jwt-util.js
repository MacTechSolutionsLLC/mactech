/**
 * JWT verification for upload and view tokens (HS256).
 * Must use same secret as Railway (CUI_VAULT_JWT_SECRET or CUI_VAULT_API_KEY).
 */
const crypto = require('crypto')

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64
  return Buffer.from(padded, 'base64').toString('utf8')
}

function verify(jwtString, secret) {
  if (!jwtString || !secret) return null
  const parts = jwtString.split('.')
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, signatureB64] = parts
  const signatureInput = `${headerB64}.${payloadB64}`
  const expectedSig = crypto.createHmac('sha256', secret).update(signatureInput).digest('base64url')
  if (expectedSig !== signatureB64) return null
  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64))
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

module.exports = { verify }
