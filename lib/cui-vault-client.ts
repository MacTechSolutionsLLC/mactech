/**
 * CUI Vault API Client
 *
 * Railway uses this client for metadata and token issuance only. Railway never
 * sends or receives CUI file bytes. TLS on Railway terminates for metadata/token
 * endpoints only; CUI bytes flow directly between browser and vault.
 *
 * Vault base URL: CUI_VAULT_URL (e.g. https://vault.mactechsolutionsllc.com)
 * Assumed vault contract: POST /v1/files/upload (multipart, Bearer), GET /v1/files/{vaultId} (Bearer), DELETE /v1/files/{vaultId}
 */

import crypto from 'crypto'

interface VaultErrorResponse {
  detail: string
  error?: string
}

const UPLOAD_TOKEN_TTL_SEC = 15 * 60 // 15 minutes
const VIEW_TOKEN_TTL_SEC = 15 * 60   // 15 minutes

/**
 * Get CUI vault configuration from environment variables
 */
function getVaultConfig(): { url: string; apiKey: string; jwtSecret: string } | null {
  const url = process.env.CUI_VAULT_URL || 'https://vault.mactechsolutionsllc.com'
  const apiKey = process.env.CUI_VAULT_API_KEY
  const jwtSecret = process.env.CUI_VAULT_JWT_SECRET || process.env.CUI_VAULT_API_KEY || ''

  if (!apiKey || !jwtSecret) {
    return null
  }

  return { url, apiKey, jwtSecret }
}

/**
 * Check if CUI vault is configured
 */
export function isVaultConfigured(): boolean {
  return getVaultConfig() !== null
}

/**
 * Create a short-lived JWT for vault upload or view.
 * Vault must validate using same CUI_VAULT_JWT_SECRET (or CUI_VAULT_API_KEY fallback).
 */
function createVaultJWT(
  payload: { action: string; userId?: string; vaultId?: string; fileSize?: number; mimeType?: string },
  ttlSec: number
): string {
  const config = getVaultConfig()
  if (!config) {
    throw new Error('CUI vault not configured: CUI_VAULT_JWT_SECRET or CUI_VAULT_API_KEY required')
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = {
    ...payload,
    iat: now,
    exp: now + ttlSec,
  }
  const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64url')
  const headerB64 = b64(JSON.stringify(header))
  const bodyB64 = b64(JSON.stringify(body))
  const signatureInput = `${headerB64}.${bodyB64}`
  const signature = crypto.createHmac('sha256', config.jwtSecret).update(signatureInput).digest('base64url')
  return `${signatureInput}.${signature}`
}

/**
 * Create upload session: Railway issues JWT only; no file bytes.
 * Returns uploadUrl and token for browser to POST file directly to vault.
 */
export function createUploadSession(params: {
  fileName: string
  mimeType: string
  fileSize: number
  userId: string
}): { uploadUrl: string; uploadToken: string; expiresAt: string } {
  const config = getVaultConfig()
  if (!config) {
    throw new Error('CUI vault not configured: CUI_VAULT_JWT_SECRET or CUI_VAULT_API_KEY required')
  }

  const baseUrl = config.url.replace(/\/$/, '')
  const uploadUrl = `${baseUrl}/v1/files/upload`
  const token = createVaultJWT(
    {
      action: 'upload',
      userId: params.userId,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
    },
    UPLOAD_TOKEN_TTL_SEC
  )
  const expiresAt = new Date(Date.now() + UPLOAD_TOKEN_TTL_SEC * 1000).toISOString()

  return {
    uploadUrl,
    uploadToken: token,
    expiresAt,
  }
}

/**
 * Create view session: Railway issues JWT only; no file bytes.
 * Returns viewUrl (with token in query) for browser to open directly against vault.
 */
export function createViewSession(vaultId: string): { viewUrl: string; viewToken: string; expiresAt: string } {
  const config = getVaultConfig()
  if (!config) {
    throw new Error('CUI vault not configured: CUI_VAULT_JWT_SECRET or CUI_VAULT_API_KEY required')
  }

  const baseUrl = config.url.replace(/\/$/, '')
  const token = createVaultJWT({ action: 'view', vaultId }, VIEW_TOKEN_TTL_SEC)
  const viewUrl = `${baseUrl}/v1/files/${vaultId}?token=${encodeURIComponent(token)}`
  const expiresAt = new Date(Date.now() + VIEW_TOKEN_TTL_SEC * 1000).toISOString()

  return {
    viewUrl,
    viewToken: token,
    expiresAt,
  }
}

/**
 * Make authenticated request to CUI vault API (metadata/delete only; no CUI bytes)
 */
async function vaultRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = getVaultConfig()
  if (!config) {
    throw new Error('CUI vault not configured: CUI_VAULT_API_KEY environment variable required')
  }

  const timeout = parseInt(process.env.CUI_VAULT_TIMEOUT || '30000', 10)
  const retryAttempts = parseInt(process.env.CUI_VAULT_RETRY_ATTEMPTS || '3', 10)

  const url = `${config.url}${endpoint}`
  const headers = {
    'X-VAULT-KEY': config.apiKey,
    'Content-Type': 'application/json',
    ...options.headers,
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText })) as VaultErrorResponse
        throw new Error(errorData.detail || errorData.error || `Vault API error: ${response.status} ${response.statusText}`)
      }

      if (response.status === 204) {
        return undefined as T
      }
      return await response.json() as T
    } catch (error: any) {
      lastError = error

      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('404')) {
        throw error
      }

      if (attempt < retryAttempts) {
        const delay = Math.pow(2, attempt) * 100
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
    }
  }

  throw lastError || new Error('Vault API request failed after retries')
}

/**
 * Delete CUI file from vault. Throws on failure (non-2xx).
 * Caller must not mark DB record deleted unless this succeeds (or vault returns 404).
 */
export async function deleteCUIFromVault(vaultId: string): Promise<void> {
  const config = getVaultConfig()
  if (!config) {
    throw new Error('CUI vault not configured: CUI_VAULT_API_KEY environment variable required')
  }

  const response = await fetch(`${config.url.replace(/\/$/, '')}/v1/files/${vaultId}`, {
    method: 'DELETE',
    headers: {
      'X-VAULT-KEY': config.apiKey,
    },
  })

  if (response.status === 404) {
    return
  }

  if (!response.ok) {
    const text = await response.text()
    let detail: string
    try {
      const json = JSON.parse(text) as VaultErrorResponse
      detail = json.detail || json.error || response.statusText
    } catch {
      detail = response.statusText || text
    }
    throw new Error(detail || `Vault DELETE failed: ${response.status}`)
  }
}

/**
 * Health check for CUI vault
 */
export async function checkVaultHealth(): Promise<boolean> {
  try {
    const config = getVaultConfig()
    if (!config) {
      return false
    }

    const response = await fetch(`${config.url}/health`, {
      method: 'GET',
      headers: {
        'X-VAULT-KEY': config.apiKey,
      },
    })

    return response.status === 200 || response.status === 401
  } catch {
    return false
  }
}
