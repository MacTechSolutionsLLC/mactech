# Deployable CUI Vault — Product Definition

**Version:** 1.0  
**Date:** 2026-01-28  
**Status:** Product and artifact definition

---

## 1. Product Scope

MacTech Solutions offers **Deployable CUI Vaults** for:

- **Federal programs** and **defense contractors** requiring a FIPS-controlled CUI boundary
- **Private organizations** seeking CMMC compliance with a CUI FIPS boundary

The offering is a **fully CMVP-recognized, actively certified FIPS deployment** running Ubuntu with:

- Hardening playbooks
- Validation playbooks
- Evidence generators for CMMC C3PAO auditors
- NIST CMMC control-required policies and procedures for the VM deployment
- Easy HTTPS integration into the customer’s own website or enclave

---

## 2. FIPS Boundary

- **Platform:** Ubuntu 22.04 LTS with FIPS mode enabled (kernel + OpenSSL FIPS provider).
- **CMVP:** Canonical Ltd. Ubuntu 22.04 OpenSSL Cryptographic Module — **NIST CMVP Certificate #4794** (FIPS 140-3 Level 1, active until 2026-09-10).
- **CUI in transit:** TLS 1.3 (AES-256-GCM-SHA384) terminated on the vault host.
- **CUI at rest:** AES-256-GCM application-level encryption; FIPS-validated module per Certificate #4794.

All CUI decryption and cryptographic protection occur **only** inside the vault boundary. The customer’s main application (or Railway) does not receive or decrypt CUI file bytes; it issues tokens only. CUI bytes flow directly between client (browser) and vault over HTTPS.

---

## 3. C3PAO Evidence

- **Hardening evidence:** Produced by `harden_ubuntu_cmmc.py` (cloud-safe CMMC Level 2); stored under `/opt/compliance/hardening-evidence`.
- **Validation evidence:** Produced by `cmmc_hardening_validation_evidence.py`; stored under `/opt/compliance/validation-evidence`.
- **Evidence package:** [scripts/export-cmmc-evidence-package.sh](../scripts/export-cmmc-evidence-package.sh) collects hardening + validation evidence and (optionally) the policy bundle into a single tarball for C3PAO handoff.
- **Reference evidence:** Pre-built MAC-RPT-* and FIPS documentation live in the repo (`compliance/cmmc/level2/05-evidence/`, `docs/FIPS_VERIFICATION_RESULTS.md`) and can be shipped or linked from the deployable image.

---

## 4. HTTPS Integration

- **API contract:** [CUI_VAULT_API_CONTRACT.md](CUI_VAULT_API_CONTRACT.md) — POST `/v1/files/upload`, GET `/v1/files/{vaultId}`, DELETE `/v1/files/{vaultId}`.
- **Customer flow:** Customer app authenticates users and issues short-lived JWTs (upload/view). Browser uploads/downloads CUI directly to/from the vault over HTTPS; customer app never handles CUI file bytes.
- **Integration guide:** [CUI_VAULT_INTEGRATION.md](CUI_VAULT_INTEGRATION.md) — environment variables, flows, and optional SDK/snippet for “easy integration into customer website or enclave.”

---

## 5. Deployable Image Contents

The deployable unit (VM image or container) includes:

| Component | Description |
|-----------|-------------|
| **OS** | Ubuntu 22.04 LTS, FIPS mode (kernel + OpenSSL FIPS provider per CMVP #4794) |
| **CUI Vault Service** | Implements [CUI_VAULT_API_CONTRACT](CUI_VAULT_API_CONTRACT.md): POST/GET/DELETE `/v1/files/*`; JWT validation; API key for server-side delete; AES-256-GCM encrypt/decrypt |
| **TLS** | nginx — TLS 1.3 termination, security headers, reverse proxy to vault service |
| **Database** | Local PostgreSQL (or equivalent) bound to localhost; table(s) for encrypted CUI (ciphertext, nonce, tag, metadata) |
| **Hardening** | `harden_ubuntu_cmmc.py` (and optionally `harden_ubuntu_stig.py`) — run at build or first-boot; evidence in `/opt/compliance/hardening-evidence` |
| **Validation** | `cmmc_hardening_validation_evidence.py` — run after hardening; evidence in `/opt/compliance/validation-evidence` |
| **Policy bundle** | Vault-boundary subset of CMMC policies/procedures under `/opt/compliance/policies` (see vault-compliance-bundle) |
| **Evidence export** | [scripts/export-cmmc-evidence-package.sh](../scripts/export-cmmc-evidence-package.sh) — tarball of hardening + validation evidence + policies for C3PAO |

---

## 6. Vault Server Source

The vault server (upload/store/serve/delete with AES-256-GCM, JWT validation, API key) is **implemented in this repo** under `cui-vault-server/` and satisfies the API contract. Build and run instructions are in the deployable image build docs (Packer/Docker).

---

## 7. Artifact Formats

- **VM image:** Packer-built image (e.g. GCE, AWS AMI, Azure VHD) for DoD/federal environments where VM hardening and FIPS kernel are required.
- **Container:** Dockerfile/OCI image for cloud deployments; same vault service and tooling, with FIPS and hardening applied as documented for the container build.

---

## 8. Related Documents

- [CUI_VAULT_API_CONTRACT.md](CUI_VAULT_API_CONTRACT.md) — API contract
- [CUI_VAULT_INTEGRATION.md](CUI_VAULT_INTEGRATION.md) — Customer integration
- [DEPLOYABLE_CUI_VAULT_BUILD.md](DEPLOYABLE_CUI_VAULT_BUILD.md) — Build and run instructions
- [compliance/cmmc/level2/01-system-scope/MAC-IT-306_CUI_Vault_Architecture_Diagram.md](../compliance/cmmc/level2/01-system-scope/MAC-IT-306_CUI_Vault_Architecture_Diagram.md) — Architecture
- [compliance/cmmc/level2/05-evidence/docs/FIPS_VERIFICATION_RESULTS.md](../compliance/cmmc/level2/05-evidence/docs/FIPS_VERIFICATION_RESULTS.md) — FIPS verification
