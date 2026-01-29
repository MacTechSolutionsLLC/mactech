# CUI Vault Integration Guide

**Date:** 2026-01-28  
**Status:** Direct-to-vault flow (Railway never handles CUI bytes)

---

## Overview

CUI file bytes never touch Railway. The browser uploads and downloads CUI directly to/from the CUI vault (vault.mactechsolutionsllc.com). Railway hosts the UI, authenticates users, and issues short-lived tokens for vault upload/view; Railway stores only non-CUI metadata (fileId, vaultId, size, mimeType, owner, timestamps). **Railway terminates TLS for metadata and token issuance only, not for CUI bytes.**

---

## Implementation Summary

### Key Files
- `lib/cui-vault-client.ts` - Token issuance (createUploadSession, createViewSession); deleteCUIFromVault (no byte APIs)
- `app/api/cui/upload-session/route.ts` - Returns uploadUrl + token (metadata only)
- `app/api/cui/view-session/route.ts` - Returns viewUrl + token (metadata only)
- `app/api/cui/record/route.ts` - Records metadata after client uploads to vault
- `lib/file-storage.ts` - recordCUIUploadMetadata, getCUIFileMetadataForView, deleteCUIFile (vault first, then DB)
- `app/api/files/upload/route.ts` - Rejects CUI multipart (400); CUI must use direct-to-vault flow

---

## Configuration

### Environment Variables

**Required (CUI vault is mandatory for CUI storage):**
- `CUI_VAULT_API_KEY` - API key for vault authentication and server-side delete
- `CUI_VAULT_JWT_SECRET` - Secret for signing upload/view JWTs (fallback: CUI_VAULT_API_KEY)

**Optional:**
- `CUI_VAULT_URL` - Vault API base URL (default: `https://vault.mactechsolutionsllc.com`)
- `CUI_VAULT_TIMEOUT` - Request timeout in milliseconds (default: 30000)
- `CUI_VAULT_RETRY_ATTEMPTS` - Number of retry attempts (default: 3)

### Railway Configuration

Add the following environment variables in Railway:
1. Go to your Railway project → Variables
2. Add `CUI_VAULT_URL` (optional, defaults to `https://vault.mactechsolutionsllc.com`)
3. Add `CUI_VAULT_API_KEY` (required for vault integration and server-side delete)
4. Add `CUI_VAULT_JWT_SECRET` (required for upload/view token signing; fallback: `CUI_VAULT_API_KEY`)

---

## Database Migration

**Migration File:** `prisma/migrations/20260126224611_add_cui_vault_fields/migration.sql`

**To Apply Migration:**
```bash
# Generate Prisma client with new schema
npx prisma generate

# Apply migration (if using PostgreSQL)
npx prisma migrate deploy
# OR for development:
npx prisma migrate dev
```

**New Fields Added:**
- `storedInVault: Boolean` - Indicates if file is stored in vault (default: false)
- `vaultId: String?` - CUI vault record ID (if stored in vault)

---

## How It Works

### Storage Flow (no CUI bytes on Railway)

1. **New CUI File Upload:**
   - UI calls `POST /api/cui/upload-session` with metadata only (fileName, mimeType, fileSize). Railway returns uploadUrl + uploadToken.
   - Browser uploads file directly to vault (POST uploadUrl with Bearer token, multipart file). TLS for CUI bytes terminates on vault.
   - Vault returns vaultId, size, mimeType. UI calls `POST /api/cui/record` with { vaultId, size, mimeType }. Railway creates StoredCUIFile metadata only.
   - **Railway never receives CUI file bytes.**

2. **File View:**
   - UI calls `GET /api/cui/view-session?id=fileId`. Railway returns viewUrl (vault URL with token in query).
   - Browser opens viewUrl directly; vault streams file bytes. **Railway never receives or returns CUI file bytes.**

3. **File Delete:**
   - UI calls `DELETE /api/files/cui/[id]`. Railway calls vault DELETE first; only on success marks DB record deleted. On vault failure, DB is not updated and failure is logged (no filename).

4. **File Listing:**
   - All CUI files listed from local database metadata. Access control: user sees own files, admin sees all.

4. **File Deletion:**
   - If file is in vault: Attempt to delete from vault (if endpoint exists)
   - Always perform logical deletion in local database
   - Maintains audit trail

---

## Backward Compatibility

**Existing Files:**
- All existing CUI files remain in local database (legacy files)
- `storedInVault: false` for all existing records
- Existing files continue to work via local database retrieval
- Legacy files are exception, not normal operation

**Fail-Secure Behavior (No Fallback):**
- **If vault is unavailable:** Upload is rejected with error (no fallback to Railway storage)
- **If API key not configured:** Upload is rejected with error (no fallback to Railway storage)
- **CMMC Requirement:** CUI content cannot be stored in Railway database (FIPS-validated cryptography required)
- Error handling ensures CUI content never touches Railway storage

---

## API Endpoints

The CUI vault client uses the following endpoints (assumed format):

- **Store:** `POST /cui/store` - Store CUI file
- **Retrieve:** `GET /cui/[id]` - Retrieve CUI file by ID
- **List:** `GET /cui/list` - List CUI files (may not exist)
- **Delete:** `DELETE /cui/[id]` - Delete CUI file (may not exist)
- **Health:** `GET /health` - Health check

**Note:** The exact API format may need adjustment based on actual vault API implementation.

---

## Testing

**Manual Testing Required:**

1. **Set Environment Variables:**
   ```bash
   export CUI_VAULT_API_KEY=77564883c27638b3dd8b969b6304ef6106d9dd676cf2b5f4956564bb603559fd
   export CUI_VAULT_URL=https://vault.mactechsolutionsllc.com
   ```

2. **Test Store:**
   - Upload a CUI file via the application
   - Verify file is stored in vault
   - Verify metadata is stored in local database with `storedInVault: true`

3. **Test Retrieve:**
   - Retrieve the CUI file via the application
   - Verify file data is retrieved from vault
   - Verify password protection still works

4. **Test Fallback:**
   - Remove `CUI_VAULT_API_KEY` environment variable
   - Upload a CUI file
   - Verify file is stored in local database (fallback)

5. **Test Existing Files:**
   - Access an existing CUI file (stored before integration)
   - Verify it's retrieved from local database
   - Verify it still works correctly

---

## Error Handling

**Vault Unavailable:**
- Logs error to console
- Falls back to local database storage
- System remains functional

**Invalid API Key:**
- Logs error to console
- Falls back to local database storage
- System remains functional

**Network Timeout:**
- Retries with exponential backoff (up to 3 attempts)
- Falls back to local database if all retries fail

**Invalid Response:**
- Logs error to console
- Falls back to local database storage

---

## Security Considerations

**API Key Management:**
- API key stored in environment variables (never in code)
- Use Railway environment variables for production
- Rotate API key periodically

**TLS/HTTPS:**
- All vault communication over TLS 1.3
- Certificate validation performed by Node.js
- No plaintext communication

**Error Messages:**
- API key never exposed in error messages
- Errors logged without sensitive data
- Authentication failures handled gracefully

---

## Next Steps

1. **Apply Database Migration:**
   - Run `npx prisma generate` to regenerate Prisma client
   - Apply migration to database

2. **Configure Environment Variables:**
   - Add `CUI_VAULT_API_KEY` to Railway environment variables
   - Optionally set `CUI_VAULT_URL` if different from default

3. **Test Integration:**
   - Test file upload to vault
   - Test file retrieval from vault
   - Test fallback behavior
   - Verify existing files still work

4. **Monitor:**
   - Monitor vault API availability
   - Review error logs for vault communication issues
   - Verify files are being stored in vault as expected

---

## Troubleshooting

**Issue: Files not storing in vault**
- Check `CUI_VAULT_API_KEY` is set correctly
- Check vault API is accessible
- Review application logs for errors
- Verify vault API endpoint format matches implementation

**Issue: TypeScript errors about missing fields**
- Run `npx prisma generate` to regenerate Prisma client
- Ensure migration has been applied to database

**Issue: Files not retrieving from vault**
- Check `storedInVault` flag is `true` in database
- Check `vaultId` is set correctly
- Verify vault API retrieve endpoint format
- Review error logs for vault communication issues

---

## Related Documentation

- CUI Vault Deployment Evidence: `compliance/cmmc/level2/05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`
- CUI Vault Architecture: `compliance/cmmc/level2/01-system-scope/MAC-IT-306_CUI_Vault_Architecture_Diagram.md`
- System Security Plan: `compliance/cmmc/system/01-system-scope/MAC-IT-304_System_Security_Plan.md`
