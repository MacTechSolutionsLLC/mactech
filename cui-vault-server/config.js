/**
 * CUI Vault server configuration from environment.
 * JWT secret and API key are used to validate tokens and X-VAULT-KEY.
 */
function getConfig() {
  const jwtSecret = process.env.CUI_VAULT_JWT_SECRET || process.env.CUI_VAULT_API_KEY || ''
  const apiKey = process.env.CUI_VAULT_API_KEY || ''
  const encryptionKeyHex = process.env.CUI_ENCRYPTION_KEY || ''
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'cuivault',
    user: process.env.DB_USER || 'cuivault_user',
    password: process.env.DB_PASSWORD || '',
  }
  const port = parseInt(process.env.PORT || '3001', 10)
  const maxFileSizeBytes = parseInt(process.env.CUI_VAULT_MAX_FILE_SIZE || '52428800', 10) // 50MB default
  const evidenceScriptPath = process.env.CUI_VAULT_EVIDENCE_SCRIPT_PATH || '/home/patrick_mactechsolutionsllc_com/cmmc_hardening_validation_evidence.py'
  const evidenceOutputDir = process.env.CUI_VAULT_EVIDENCE_OUTPUT_DIR || './reports'

  return {
    jwtSecret,
    apiKey,
    encryptionKeyHex,
    dbConfig,
    port,
    maxFileSizeBytes,
    evidenceScriptPath,
    evidenceOutputDir,
  }
}

module.exports = { getConfig }
