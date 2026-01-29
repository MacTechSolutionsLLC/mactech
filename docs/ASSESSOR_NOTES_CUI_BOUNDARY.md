# Assessor Notes: CUI Boundary and SC.L2-3.13.11

**CMMC 2.0 Level 2 | SC.L2-3.13.11 (FIPS-validated cryptography protecting CUI confidentiality)**

---

## 1. Where CUI is first decrypted

**CUI is first decrypted only in the CUI vault boundary (FIPS GCE VM).**

- **Upload:** Browser sends CUI file bytes over HTTPS to the vault (`POST https://vault.<domain>/v1/files/upload`). TLS terminates at the vault; the vault process decrypts and stores CUI. Railway never receives or decrypts CUI file bytes.
- **View:** Browser requests CUI from the vault (`GET https://vault.<domain>/v1/files/{vaultId}?token=...`). TLS terminates at the vault; the vault decrypts and streams bytes to the browser. Railway never receives or decrypts CUI file bytes.

---

## 2. Why Railway is out of boundary for CUI bytes

- Railway hosts the UI, authenticates users, and issues short-lived tokens (upload/view) for vault operations. Railway stores only non-CUI metadata (fileId, vaultId, size, mimeType, owner, timestamps) in its database.
- **Railway terminates TLS for metadata and token issuance only, not for CUI bytes.** Endpoints such as `/api/cui/upload-session`, `/api/cui/view-session`, and `/api/cui/record` carry only metadata and tokens; no CUI file bytes are sent to or from Railway for those requests.
- CUI file bytes are never parsed, buffered, base64-encoded/decoded, or streamed by Railway. There is no multipart CUI upload to Railway and no “get from vault then return bytes to client” path.

---

## 3. Evidence points for SC.L2-3.13.11

- **FIPS-validated cryptography** is employed to protect CUI confidentiality where CUI is processed and stored. TLS termination and all cryptographic protection of CUI occur in the vault boundary (Ubuntu 22.04 OpenSSL Cryptographic Module, FIPS 140-3, CMVP Certificate #4794).
- **Railway:** No cryptographic operations protect CUI on Railway; Railway does not perform encrypt/decrypt of CUI payloads. FIPS validation is not required for Railway for CUI protection because CUI bytes do not touch Railway.
- **Vault:** TLS for CUI upload/download terminates on the vault; encryption at rest and decryption happen only in the vault. Evidence: `compliance/cmmc/level2/05-evidence/docs/FIPS_VERIFICATION_RESULTS.md`, vault TLS and database encryption documentation.

---

## 4. Explicit TLS statement

**Railway terminates TLS for metadata and token issuance only, not for CUI bytes.**

This is the assessor-critical wording: metadata/token endpoints on Railway use TLS (normal for any web app); CUI file payloads are not sent to Railway, so Railway never terminates TLS for CUI bytes.
