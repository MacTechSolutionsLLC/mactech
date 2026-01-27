/**
 * CUI Vault API Client
 * 
 * Client library for communicating with the CUI vault infrastructure
 * at vault.mactechsolutionsllc.com
 * 
 * Handles storage, retrieval, and management of CUI files in the dedicated vault
 */

interface VaultStoreResponse {
  stored: boolean
  id: string
}

interface VaultGetResponse {
  id: string
  data: string // base64 encoded
  filename: string
  mimeType: string
  size: number
  created_at: string
}

interface VaultErrorResponse {
  detail: string
  error?: string
}

/**
 * Get CUI vault configuration from environment variables
 */
function getVaultConfig(): { url: string; apiKey: string } | null {
  const url = process.env.CUI_VAULT_URL || 'https://vault.mactechsolutionsllc.com'
  const apiKey = process.env.CUI_VAULT_API_KEY

  if (!apiKey) {
    return null
  }

  return { url, apiKey }
}

/**
 * Check if CUI vault is configured
 */
export function isVaultConfigured(): boolean {
  return getVaultConfig() !== null
}

/**
 * Make authenticated request to CUI vault API
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

      return await response.json() as T
    } catch (error: any) {
      lastError = error

      // Don't retry on authentication errors or client errors (4xx)
      if (error.message?.includes('401') || error.message?.includes('403') || error.message?.includes('404')) {
        throw error
      }

      // Don't retry on last attempt
      if (attempt < retryAttempts) {
        // Exponential backoff: wait 2^attempt * 100ms
        const delay = Math.pow(2, attempt) * 100
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
    }
  }

  throw lastError || new Error('Vault API request failed after retries')
}

/**
 * Store CUI file in vault
 */
export async function storeCUIInVault(
  fileData: Buffer,
  filename: string,
  mimeType: string,
  metadata?: Record<string, any>
): Promise<{ id: string }> {
  // Convert file data to base64
  const base64Data = fileData.toString('base64')

  const payload = {
    data: base64Data,
    filename,
    mimeType,
    size: fileData.length,
    ...(metadata && { metadata }),
  }

  const response = await vaultRequest<VaultStoreResponse>('/cui/store', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (!response.stored || !response.id) {
    throw new Error('Failed to store CUI in vault: Invalid response')
  }

  return { id: response.id }
}

/**
 * Retrieve CUI file from vault
 */
export async function getCUIFromVault(
  id: string
): Promise<{ data: Buffer; filename: string; mimeType: string; size: number; created_at: string }> {
  const response = await vaultRequest<VaultGetResponse>(`/cui/${id}`, {
    method: 'GET',
  })

  if (!response.data || !response.filename) {
    throw new Error('Invalid response from vault: Missing file data')
  }

  // Decode base64 data
  const data = Buffer.from(response.data, 'base64')

  return {
    data,
    filename: response.filename,
    mimeType: response.mimeType || 'application/octet-stream',
    size: response.size || data.length,
    created_at: response.created_at,
  }
}

/**
 * List CUI files from vault (if endpoint exists)
 * Returns empty array if endpoint doesn't exist
 */
export async function listCUIFromVault(): Promise<Array<{ id: string; created_at: string }>> {
  try {
    const response = await vaultRequest<Array<{ id: string; created_at: string }>>('/cui/list', {
      method: 'GET',
    })
    return response || []
  } catch (error: any) {
    // If endpoint doesn't exist (404), return empty array
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return []
    }
    throw error
  }
}

/**
 * Delete CUI file from vault (if endpoint exists)
 */
export async function deleteCUIFromVault(id: string): Promise<void> {
  try {
    await vaultRequest<void>(`/cui/${id}`, {
      method: 'DELETE',
    })
  } catch (error: any) {
    // If endpoint doesn't exist (404), that's okay - file may already be deleted
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return
    }
    throw error
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

    // Health endpoint may return 401 for unauthenticated, but that means it's responding
    return response.status === 200 || response.status === 401
  } catch (error) {
    return false
  }
}
