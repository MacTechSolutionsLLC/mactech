/**
 * AES-256-GCM encrypt/decrypt for CUI at rest.
 * On Ubuntu 22.04 FIPS mode, Node crypto uses FIPS-validated OpenSSL (CMVP #4794).
 */
const crypto = require('crypto')

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16
const KEY_LENGTH = 32

function getKey(encryptionKeyHex) {
  if (!encryptionKeyHex || encryptionKeyHex.length !== KEY_LENGTH * 2) {
    throw new Error('CUI_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(encryptionKeyHex, 'hex')
}

function encrypt(plaintext, keyBuffer) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv, { authTagLength: TAG_LENGTH })
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return { ciphertext: encrypted, nonce: iv, tag }
}

function decrypt(ciphertext, nonce, tag, keyBuffer) {
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, nonce, { authTagLength: TAG_LENGTH })
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()])
}

module.exports = {
  getKey,
  encrypt,
  decrypt,
  IV_LENGTH,
  TAG_LENGTH,
}
