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

**Vault server (for browser uploads from app):** Set on the CUI vault host so the browser can POST to the vault from the app origin:
- `CUI_VAULT_CORS_ORIGIN` - Comma-separated list of allowed origins (e.g. `https://www.mactechsolutionsllc.com,https://mactech-staging.up.railway.app`) or `*` for any. Required for GUI-to-vault uploads; without it, the browser blocks cross-origin requests.

**App Content Security Policy:** The app adds the CUI vault origin to the CSP `connect-src` directive (in `next.config.js` and `lib/security-headers.ts`) so the browser allows fetch/XHR to the vault. If you use a different vault URL via `CUI_VAULT_URL`, that origin is included automatically.

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

Vault API contract (see [CUI_VAULT_API_CONTRACT.md](CUI_VAULT_API_CONTRACT.md)):

- **Upload:** `POST /v1/files/upload` — `Authorization: Bearer <uploadToken>`, multipart `file`; response `{ vaultId, sha256?, size, mimeType, createdAt }`
- **View:** `GET /v1/files/{vaultId}?token=<viewToken>` — returns raw file bytes with `Content-Type` and `Content-Disposition`
- **Delete:** `DELETE /v1/files/{vaultId}` — `X-VAULT-KEY: <apiKey>`; 204 or 404
- **Health:** `GET /health` — 200 OK (no auth)

---

## Integrating the vault into your website or enclave

To use the deployable CUI vault from your own application or enclave over HTTPS:

1. **Deploy the vault** (VM or container) so it is reachable at an HTTPS URL (e.g. `https://vault.yourdomain.com`). TLS 1.3 must terminate at the vault host so CUI bytes are never decrypted outside the FIPS boundary.
2. **Configure your app** with the vault base URL and a shared JWT secret (and API key for server-side delete). Your app must **not** receive or decrypt CUI file bytes; it only issues short-lived tokens.
3. **Upload flow:** Your backend authenticates the user, then returns an upload URL and a signed JWT (e.g. `POST /api/cui/upload-session` → `{ uploadUrl, uploadToken }`). The browser (or client) uploads the file directly to `uploadUrl` with `Authorization: Bearer <uploadToken>`. Your backend then records metadata (e.g. `vaultId`, size, mimeType) after the client reports success.
4. **View flow:** Your backend returns a view URL that includes a signed JWT (e.g. `https://vault.yourdomain.com/v1/files/{vaultId}?token=<viewToken>`). The user opens that URL in the browser; the vault streams the file. Your backend never handles the file bytes.
5. **Delete:** Your backend calls `DELETE /v1/files/{vaultId}` with `X-VAULT-KEY` and, on success, removes the record from your metadata store.

**Reference implementation:** This repo uses `lib/cui-vault-client.ts` and the `/api/cui/*` routes for token issuance and metadata; the browser talks directly to the vault for upload and view. You can mirror that pattern in your stack (any language) as long as CUI bytes never touch your app server.

---

## Testing

**GUI upload path (Admin → Vault):**

1. Log in as an admin and go to **Admin → File Management**.
2. Open the **CUI** tab. If the vault is not configured, a banner will show (uses `GET /api/cui/vault-status`).
3. Check **Store as CUI**, choose a file, and upload. The flow is:
   - `POST /api/cui/upload-session` (fileName, mimeType, fileSize) → returns `uploadUrl`, `uploadToken`
   - Browser `POST uploadUrl` with `Authorization: Bearer <uploadToken>` and multipart `file` (direct to vault; CORS must allow your app origin via `CUI_VAULT_CORS_ORIGIN` on the vault server)
   - Vault responds with `{ vaultId, size, mimeType }`
   - `POST /api/cui/record` with `{ vaultId, size, mimeType }` → creates metadata and audit log
4. Verify the file appears in the CUI list and view/delete work as expected.

**Automated:** Run `npm run test:cui-flow` to validate token/URL generation (no network calls).

**Manual Testing Required:**

1. **Set Environment Variables:**
   ```bash
   export CUI_VAULT_API_KEY=77564883c27638b3dd8b969b6304ef6106d9dd676cf2b5f4956564bb603559fd
   export CUI_VAULT_URL=https://vault.mactechsolutionsllc.com
   ```

2. **Test Upload:**
   - Upload a CUI file via the application (direct-to-vault flow)
   - Verify file is stored in vault and metadata in local database with `storedInVault: true`

3. **Test View:**
   - Open a CUI file via the application; verify the browser loads from vault URL with token
   - Verify file data is streamed from vault (no CUI bytes on Railway)

4. **Test No Fallback:**
   - With vault unavailable or `CUI_VAULT_API_KEY` unset, attempt CUI upload
   - Verify upload is rejected (no fallback to Railway storage)

5. **Test Existing (legacy) files:**
   - Access a file stored before vault integration (`storedInVault: false`)
   - Verify it is retrieved from local database as documented

---

## Error Handling

**Vault Unavailable:**
- CUI upload is rejected (no fallback to Railway storage)
- Error returned to user; CUI bytes never touch Railway

**Invalid or Missing API Key:**
- CUI upload is rejected
- Server-side delete will fail until key is configured

**Network Timeout:**
- Retries with exponential backoff (up to `CUI_VAULT_RETRY_ATTEMPTS`)
- On final failure, upload is rejected (no fallback)

**Invalid Response:**
- Logs error; operation fails; no CUI stored on Railway

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

**Step-by-step: Vault connect and read/write**

1. **App env (Railway / app host)**  
   Set `CUI_VAULT_API_KEY` and `CUI_VAULT_JWT_SECRET` (or `CUI_VAULT_API_KEY` for both). Optionally `CUI_VAULT_URL` if the vault is not at the default host.

2. **Test from app**  
   In Admin → File Management → CUI tab, click **Test vault connection**.  
   - If "Vault connection OK": app can reach the vault; continue to step 3.  
   - If "Vault URL not reachable": fix `CUI_VAULT_URL`, firewall, and that the vault process is running and reachable from the app.

3. **Vault env (vault host)**  
   Set `CUI_VAULT_JWT_SECRET` (same value as app), `CUI_VAULT_API_KEY`, `CUI_ENCRYPTION_KEY`, and DB. Set `CUI_VAULT_CORS_ORIGIN` to the app origin(s), e.g. `https://www.mactechsolutionsllc.com`.

4. **Browser upload**  
   Uploads go from the user’s browser directly to the vault. If "Test vault connection" is OK but uploads fail with "Cannot reach the CUI vault" or CORS errors, the browser cannot reach the vault or CORS is blocking. Confirm the vault URL is reachable from the internet and `CUI_VAULT_CORS_ORIGIN` includes the site’s origin.

5. **View / download**  
   View uses a signed URL to the vault. If view fails, check JWT secret match and that the vault GET endpoint is reachable from the browser.

**Issue: Users unable to upload to CUI vault (browser → vault)**

1. **"Cannot reach the CUI vault" / network error**
   - Vault must be reachable from the user's browser at `CUI_VAULT_URL` (e.g. `https://vault.mactechsolutionsllc.com`). Check DNS, firewall, and that the vault process is running behind TLS.
   - On the **vault server**, set `CUI_VAULT_CORS_ORIGIN` to the app origin(s), e.g. `https://www.mactechsolutionsllc.com,https://your-app.up.railway.app`. Without this, the browser blocks the cross-origin request.

2. **"Unauthorized" from vault (401)**
   - The app and vault must use the **same** `CUI_VAULT_JWT_SECRET` (or same `CUI_VAULT_API_KEY` if used as JWT fallback). Set `CUI_VAULT_JWT_SECRET` on both Railway (app) and the vault host.

3. **"Vault not configured" / 503 from upload-session**
   - On the **app** (Railway), set `CUI_VAULT_API_KEY` and `CUI_VAULT_JWT_SECRET` (or `CUI_VAULT_API_KEY` for both). Upload-session will not issue tokens until these are set.

4. **CSP blocking the request**
   - The app adds the vault origin to CSP `connect-src` (see Configuration). If you use a custom vault URL, set `CUI_VAULT_URL` on the app so the correct origin is included.

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

- [CUI_VAULT_API_CONTRACT.md](CUI_VAULT_API_CONTRACT.md) — Vault API contract
- [DEPLOYABLE_CUI_VAULT_PRODUCT.md](DEPLOYABLE_CUI_VAULT_PRODUCT.md) — Deployable CUI vault product scope
- [DEPLOYABLE_CUI_VAULT_BUILD.md](DEPLOYABLE_CUI_VAULT_BUILD.md) — Build and run instructions
- CUI Vault Deployment Evidence: `compliance/cmmc/level2/05-evidence/MAC-RPT-125_CUI_Vault_Deployment_Evidence.md`
- CUI Vault Architecture: `compliance/cmmc/level2/01-system-scope/MAC-IT-306_CUI_Vault_Architecture_Diagram.md`
- C3PAO evidence package: run `scripts/export-cmmc-evidence-package.sh` on the vault VM to produce a tarball for auditor handoff
