# C3PAO Assessor Runbook — CUI Boundary, MFA, and FIPS (Model A)

This runbook is designed to be used live during assessor interrogation. It is evidence-first: open the referenced artifacts and demonstrate the flow and controls.

## Approved Boundary Posture (Model A)

- **CUI cryptographic boundary:** Dedicated CUI Vault VM (Ubuntu 22.04 FIPS mode; CMVP Certificate #4794). All CUI byte encryption/decryption and CUI byte storage occur here.
- **CUI system boundary (CMMC scope):** App (Railway) for authentication/authorization, audit logging, and vault token issuance/metadata + CUI Vault for CUI bytes and cryptography.
- **User endpoints:** Authorized browsers/devices receive/transmit CUI bytes during upload/view. This is expected; endpoint handling is governed by policy/training and technical headers (anti-caching) and MFA gating.

## Q1 — “Show me your authoritative CUI boundary definition.”

Open these documents (they must match):
- `compliance/cmmc/level2/01-system-scope/MAC-IT-304_System_Security_Plan.md` (System Boundary + CUI flow)
- `compliance/cmmc/level2/01-system-scope/MAC-IT-105_System_Boundary.md` (component lists)
- `compliance/cmmc/level2/01-system-scope/MAC-IT-305_CUI_Data_Flow_Diagram.md` (end-to-end lifecycle)
- `compliance/cmmc/level2/01-system-scope/MAC-IT-306_CUI_Vault_Architecture_Diagram.md` (vault trust zone + TLS termination)

Show version control and guardrails:
- `.github/workflows/cui-boundary.yml`
- `scripts/check-cui-boundary.ts`

## Q2 — “Which components ever store, process, or transmit CUI bytes?”

Answer with a table (assessor-safe):
- **Browser (endpoint)**: yes (upload/view)
- **Railway app/API**: supported flows do not proxy/store CUI bytes
- **Railway DB**: metadata only for vault-stored CUI
- **CUI Vault**: yes (TLS terminates; encrypt/decrypt; stores ciphertext)
- **Logs/APM**: no plaintext CUI (audit uses identifiers; no payload logging)
Evidence to point at:
- `docs/CUI_VAULT_INTEGRATION.md`
- `app/api/cui/upload-session/route.ts` (metadata-only)
- `app/api/cui/view-session/route.ts` (metadata-only)
- `app/api/cui/record/route.ts` (metadata-only)
- `lib/file-storage.ts` (`recordCUIUploadMetadata` stores `Buffer.alloc(0)` for vault-stored records)
## Q3 — “Demonstrate that NO CUI BYTES exist outside the boundary.”

Do **not** claim that authorized endpoints never receive CUI. Instead demonstrate:
- **No CUI bytes on Railway storage** for vault-stored records
- **No CUI byte proxying** by Railway
- **Spill attempts** to non-CUI endpoints are rejected

Show in code:
- `app/api/cui/upload-session/route.ts` (JSON metadata only)
- `app/api/cui/view-session/route.ts` (returns vault URL/token only)
- `app/api/files/upload/route.ts` (rejects any CUI attempt; non-CUI only)

Show CI guardrail:
- Run `npm run check:cui-boundary` in CI and show forbidden patterns (no `formData.get("file")` in CUI routes).
## Q4 — “Walk me through a single CUI file lifecycle.”

Use the authoritative flow diagram:
- `compliance/cmmc/level2/01-system-scope/MAC-IT-305_CUI_Data_Flow_Diagram.md`

Narrate each step:
1) `POST /api/cui/upload-session` (metadata only)
2) Browser → vault `POST /v1/files/upload` (CUI bytes)
3) `POST /api/cui/record` (metadata only)
4) `GET /api/cui/view-session` (returns vault URL/token)
5) Browser → vault `GET /v1/files/:vaultId?token=...` (CUI bytes)
6) `DELETE /api/files/cui/[id]` (vault delete first, then metadata delete)
## Q5 — “What trust boundary does encryption terminate at?”

Answer:
- **CUI payload TLS terminates at the CUI vault** (nginx on the vault host).
- Railway terminates TLS for **metadata/token issuance only**.

Show:
- `compliance/cmmc/level2/05-evidence/MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md`
- `cui-vault-server/server.js` (vault decrypt + stream)
## Q6 — “List every cryptographic module used for CUI.”

Provide the CUI vault module list:
- **Canonical Ltd. Ubuntu 22.04 OpenSSL Cryptographic Module** — **CMVP Certificate #4794** (FIPS 140-3 L1)

Show:
- `compliance/cmmc/level2/05-evidence/docs/FIPS_VERIFICATION_RESULTS.md`
## Q7 — “Prove the system is operating in FIPS mode.”

On the vault host, show runtime evidence:
- `/proc/sys/crypto/fips_enabled = 1`
- `openssl list -providers` shows the Ubuntu 22.04 FIPS provider active

Reference evidence:
- `compliance/cmmc/level2/05-evidence/docs/FIPS_VERIFICATION_RESULTS.md`
## Q8 — “Where are encryption keys generated, stored, and protected?”

Vault key handling (assessor expects specifics):
- Vault encryption key provided via `CUI_ENCRYPTION_KEY` on the vault host
- Not stored in the database
- Access restricted to the vault service account / systemd unit

Show:
- `cui-vault-server/config.js`
- `cui-vault-server/crypto-util.js`

Also show key-management evidence docs:
- `compliance/cmmc/level2/05-evidence/MAC-RPT-127_CUI_Vault_Database_Encryption_Evidence.md`
## Q9–Q10 — Transmission security (SC.L2-3.13.8)

Show TLS version/cipher and that no non-FIPS service sees plaintext CUI:
- `compliance/cmmc/level2/05-evidence/MAC-RPT-126_CUI_Vault_TLS_Configuration_Evidence.md`
- `cui-vault-server/server.js` (anti-caching headers on GET)

Key point:
- No CDN terminates CUI payload TLS outside the vault.
## Q11–Q12 — Access + MFA enforcement

Demonstrate server-side MFA gating:
- MFA required for all authenticated sessions
- Protected routes (`/admin`, `/user`, `/portal`) redirect to MFA verify when `mfaVerified` is false
- API authorization (`requireAuth`) blocks until MFA verified

Show in code:
- `middleware.ts` (redirect to `/auth/mfa/verify`)
- `lib/authz.ts` (`requireAuth` checks `mfaVerified`)
- `app/api/auth/mfa/verify/route.ts` (requires authenticated session; logs audit events)
- `lib/auth.ts` (session includes `mfaRequired`/`mfaVerified` and supports `session.update({ mfaVerified:true })`)

Evidence docs:
- `compliance/cmmc/level2/05-evidence/MAC-RPT-104_MFA_Implementation_Evidence.md`
- `compliance/cmmc/level2/05-evidence/MAC-RPT-123_IA_L2_3_5_3_MFA_Requirements_Verification.md`
## Q13–Q15 — Assessor trap questions

**Q13 (“Show a system outside boundary and prove it cannot access CUI”)**
- Demonstrate that non-CUI upload endpoint rejects CUI.
- Demonstrate CUI bytes are only retrievable from the vault with a valid short-lived token.
- Show `check:cui-boundary` CI guardrail.

**Q14 (“If breached, where is CUI exposed?”)**
- “CUI exposure is limited to the vault boundary and authorized endpoints; CUI bytes are encrypted at rest in the vault and protected in transit by TLS 1.3. Railway stores metadata only and is gated by MFA + RBAC.”

**Q15 (“If I remove one non-boundary service, does CUI security change?”)**
- Removing unrelated services does not change the vault cryptographic boundary. The only security-critical components for CUI bytes are the vault and the controlled token issuance/access control path.
## Live Demo Checklist (15–20 minutes)

1) Open SSP + boundary docs + diagrams (Q1)
2) Show direct-to-vault endpoints in code (Q2–Q4)
3) Show vault server endpoints and anti-caching headers (Q5/Q9/Q10)
4) Show FIPS evidence (Q6–Q7)
5) Show MFA gating (Q11–Q12)
6) Show CI guardrail workflow and script (Q13)
