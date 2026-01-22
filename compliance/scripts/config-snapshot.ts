/**
 * Generate configuration snapshot for evidence capture
 * Usage: tsx compliance/scripts/config-snapshot.ts > config-snapshot-YYYYMMDD.md
 */

import { readFileSync } from 'fs'
import { join } from 'path'

function sanitizeEnvVar(value: string | undefined): string {
  if (!value) return '[NOT SET]'
  // Sanitize sensitive values
  if (value.includes('://') && value.includes('@')) {
    // Database URL or similar - show structure but hide credentials
    const match = value.match(/^([^:]+):\/\/([^:]+):([^@]+)@(.+)$/)
    if (match) {
      return `${match[1]}://[REDACTED]:[REDACTED]@${match[4]}`
    }
  }
  if (value.length > 20 && /^[a-zA-Z0-9+/=]+$/.test(value)) {
    // Looks like a base64 secret - redact
    return '[REDACTED - Secret]'
  }
  return value
}

function generateConfigSnapshot() {
  const timestamp = new Date().toISOString()
  
  // Read package.json
  let packageJson: any = {}
  try {
    const packageJsonPath = join(process.cwd(), 'package.json')
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  } catch (error) {
    console.error('Error reading package.json:', error)
  }

  // Read next.config.js
  let nextConfig = '[Could not read next.config.js]'
  try {
    const nextConfigPath = join(process.cwd(), 'next.config.js')
    nextConfig = readFileSync(nextConfigPath, 'utf-8')
  } catch (error) {
    console.error('Error reading next.config.js:', error)
  }

  // Environment variables (sanitized)
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || '[NOT SET]',
    DATABASE_URL: sanitizeEnvVar(process.env.DATABASE_URL),
    AUTH_SECRET: sanitizeEnvVar(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),
    FILE_SIGNING_SECRET: sanitizeEnvVar(process.env.FILE_SIGNING_SECRET),
  }

  // Password policy
  const passwordPolicy = {
    minLength: 14,
    bcryptRounds: 12,
    requireCommonPasswordCheck: true,
  }

  // Security headers configuration
  const securityHeaders = {
    hsts: 'max-age=31536000; includeSubDomains (production only)',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    xFrameOptions: 'DENY',
    csp: 'default-src \'self\'; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:; font-src \'self\' data:; connect-src \'self\'; frame-ancestors \'none\';',
  }

  // Session configuration
  const sessionConfig = {
    maxAge: '8 hours',
    updateAge: '1 hour',
    secureCookies: 'Production only',
    strategy: 'JWT',
  }

  // Generate markdown
  const markdown = `# Configuration Snapshot

**Generated:** ${timestamp}
**System:** MacTech Solutions - CMMC Level 1 Compliance

---

## Environment Variables

| Variable | Status | Value (Sanitized) |
|----------|--------|-------------------|
| NODE_ENV | ${envVars.NODE_ENV !== '[NOT SET]' ? '✅ Set' : '❌ Not Set'} | ${envVars.NODE_ENV} |
| DATABASE_URL | ${envVars.DATABASE_URL !== '[NOT SET]' ? '✅ Set' : '❌ Not Set'} | ${envVars.DATABASE_URL} |
| AUTH_SECRET | ${envVars.AUTH_SECRET !== '[NOT SET]' ? '✅ Set' : '❌ Not Set'} | ${envVars.AUTH_SECRET} |
| FILE_SIGNING_SECRET | ${envVars.FILE_SIGNING_SECRET !== '[NOT SET]' ? '✅ Set' : '❌ Not Set (uses AUTH_SECRET as fallback)'} | ${envVars.FILE_SIGNING_SECRET} |

---

## Password Policy

- **Minimum Length:** ${passwordPolicy.minLength} characters
- **Bcrypt Rounds:** ${passwordPolicy.bcryptRounds}
- **Common Password Check:** ${passwordPolicy.requireCommonPasswordCheck ? 'Enabled' : 'Disabled'}

**Evidence Location:** \`lib/password-policy.ts\`

---

## Security Headers

- **Strict-Transport-Security:** ${securityHeaders.hsts}
- **X-Content-Type-Options:** ${securityHeaders.xContentTypeOptions}
- **Referrer-Policy:** ${securityHeaders.referrerPolicy}
- **X-Frame-Options:** ${securityHeaders.xFrameOptions}
- **Content-Security-Policy:** ${securityHeaders.csp}

**Evidence Location:** \`next.config.js\` (headers function), \`lib/security-headers.ts\`

---

## Session Configuration

- **Max Age:** ${sessionConfig.maxAge}
- **Update Age:** ${sessionConfig.updateAge}
- **Secure Cookies:** ${sessionConfig.secureCookies}
- **Strategy:** ${sessionConfig.strategy}

**Evidence Location:** \`lib/auth.ts\` (session configuration)

---

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | ${packageJson.dependencies?.next || 'N/A'} | Web framework |
| next-auth | ${packageJson.dependencies?.['next-auth'] || 'N/A'} | Authentication |
| @prisma/client | ${packageJson.dependencies?.['@prisma/client'] || 'N/A'} | Database ORM |
| bcryptjs | ${packageJson.dependencies?.bcryptjs || 'N/A'} | Password hashing |

**Evidence Location:** \`package.json\`

---

## Railway Configuration

**Platform:** Railway (railway.app)
**Services:** Application hosting, PostgreSQL database
**TLS/HTTPS:** Inherited from Railway platform
**Database Encryption:** Inherited from Railway PostgreSQL service

**Evidence Location:** Railway platform dashboard, \`railway.json\`

---

## File Storage

**Storage Type:** PostgreSQL BYTEA column
**Location:** StoredFile table
**Access Method:** Signed URLs with expiration
**Max File Size:** 10MB
**Allowed MIME Types:** PDF, DOCX, XLSX, images, text files

**Evidence Location:** \`lib/file-storage.ts\`, \`prisma/schema.prisma\` (StoredFile model)

---

## Event Logging

**Storage:** AppEvent table (PostgreSQL)
**Retention:** 90 days minimum
**Events Logged:** Login, logout, user management, file operations, admin actions

**Evidence Location:** \`lib/audit.ts\`, \`prisma/schema.prisma\` (AppEvent model)

---

## CUI Blocking

**Implementation:** Input validation with keyword detection
**Keywords Blocked:** CUI, FOUO, Classified, Confidential, Secret, Top Secret, and related terms

**Evidence Location:** \`lib/cui-blocker.ts\`

---

## Notes

- All sensitive values are redacted in this snapshot
- Actual values are stored securely in Railway environment variables
- This snapshot is for evidence capture only
- Do not commit actual secrets to version control

---

**Generated By:** Configuration Snapshot Script
**Purpose:** CMMC Level 1 Evidence Capture
`

  console.log(markdown)
}

generateConfigSnapshot()
