/**
 * Lightweight CUI flow test: validates vault URLs and token issuance helpers.
 * This is a static unit-style test (no network calls).
 */

import { createUploadSession, createViewSession } from '../lib/cui-vault-client'

process.env.CUI_VAULT_URL = process.env.CUI_VAULT_URL || 'https://vault.mactechsolutionsllc.com'
process.env.CUI_VAULT_API_KEY = process.env.CUI_VAULT_API_KEY || 'test-key'
process.env.CUI_VAULT_JWT_SECRET = process.env.CUI_VAULT_JWT_SECRET || 'test-secret'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

const upload = createUploadSession({
  fileName: 'test.pdf',
  mimeType: 'application/pdf',
  fileSize: 1024,
  userId: 'user-1',
})

assert(upload.uploadUrl.includes('/v1/files/upload'), 'uploadUrl should target vault /v1/files/upload')
assert(upload.uploadToken.split('.').length === 3, 'uploadToken should be JWT format')

const view = createViewSession('vault-123')
assert(view.viewUrl.includes('/v1/files/vault-123'), 'viewUrl should target vault /v1/files/{vaultId}')
assert(view.viewUrl.includes('token='), 'viewUrl should include token query parameter')
assert(view.viewToken.split('.').length === 3, 'viewToken should be JWT format')

console.log('CUI flow test passed.')
