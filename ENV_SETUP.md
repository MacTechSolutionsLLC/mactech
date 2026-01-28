# Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="file:./dev.db"

# Email Configuration (for production)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=noreply@mactechsolutions.com
SMTP_TO=contact@mactechsolutions.com

# OpenAI API (for AI Chatbot)
OPENAI_API_KEY=your-openai-api-key-here

# SAM.gov API (for Contract Discovery)
SAM_GOV_API_KEY=your-sam-gov-api-key-here
# Alternative variable name (also supported):
# SAM_API_KEY=your-sam-gov-api-key-here

# CUI Vault Configuration (REQUIRED for CUI file storage - CMMC Level 2 compliance)
CUI_VAULT_URL=https://vault.mactechsolutionsllc.com
CUI_VAULT_API_KEY=your-cui-vault-api-key-here  # REQUIRED - CUI vault is mandatory for CUI storage
# Optional: CUI_VAULT_TIMEOUT=30000 (request timeout in milliseconds, default: 30000)
# Optional: CUI_VAULT_RETRY_ATTEMPTS=3 (number of retry attempts, default: 3)

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Notes

- In development mode, emails are logged to the console instead of being sent
- For production, configure real SMTP credentials
- The `DATABASE_URL` for SQLite is relative to the `prisma/` directory
- For PostgreSQL, use: `DATABASE_URL="postgresql://user:password@localhost:5432/mactech"`
- The OpenAI API key is required for the AI chatbot feature. Get your key from https://platform.openai.com/api-keys
- The SAM.gov API key is required for the Contract Discovery feature. Get your key from https://api.sam.gov/
- **CUI Vault API key is REQUIRED** for CUI file storage (CMMC Level 2 compliance requirement). If not configured, CUI file uploads will be rejected (no fallback to Railway storage). The vault URL defaults to `https://vault.mactechsolutionsllc.com` if not specified.
- **For Railway/production:** Add `CUI_VAULT_URL` and `CUI_VAULT_API_KEY` to Railway environment variables in your project settings. CUI vault must be configured before accepting CUI uploads.

