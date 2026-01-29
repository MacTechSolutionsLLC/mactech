# CUI Vault API Contract

**Purpose:** Defines the contract between the Railway application (metadata/token issuer) and the CUI vault (FIPS boundary). Railway terminates TLS for metadata and token issuance only, **not for CUI bytes**. All CUI file bytes flow directly between browser and vault; TLS for CUI payloads terminates on the vault host.

---

## Assumed Vault Endpoints

Base URL: `CUI_VAULT_URL` (e.g. `https://vault.mactechsolutionsllc.com`).

### POST /v1/files/upload

- **Auth:** `Authorization: Bearer <uploadToken>` (JWT issued by Railway; signed with `CUI_VAULT_JWT_SECRET` or `CUI_VAULT_API_KEY`).
- **Body:** Multipart form-data (file).
- **Response:** `{ vaultId, sha256?, size, mimeType, createdAt }`.

### GET /v1/files/{vaultId}

- **Auth:** Query param `?token=<viewToken>` (JWT issued by Railway with claim `vaultId`).
- **Response:** Raw bytes with appropriate `Content-Type` and `Content-Disposition` for inline or download.

### DELETE /v1/files/{vaultId}

- **Auth:** `X-VAULT-KEY: <CUI_VAULT_API_KEY>` (server-side call from Railway).
- **Response:** 204 on success. 404 acceptable (already deleted).

---

## Railway Role

- **Upload:** Railway returns `uploadUrl` (vault `/v1/files/upload`) and `uploadToken` (JWT). Browser uploads file directly to vault. Railway never receives CUI bytes.
- **View:** Railway returns `viewUrl` (vault URL with token in query). Browser opens URL directly; vault streams bytes. Railway never receives CUI bytes.
- **Delete:** Railway calls vault DELETE, then marks DB record deleted. If vault delete fails, Railway does not mark deleted and logs failure (no filename).

---

## TLS and CUI Boundary

- **Railway terminates TLS** for metadata and token-issuance endpoints only (`/api/cui/upload-session`, `/api/cui/view-session`, `/api/cui/record`). That is acceptable.
- **Railway does not terminate TLS for CUI bytes.** CUI file upload/download occurs directly between browser and vault; TLS for those payloads terminates on the vault host. All CUI decryption and cryptographic protection occur in the vault boundary (FIPS-validated).
