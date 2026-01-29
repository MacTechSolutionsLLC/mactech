# Deployable CUI Vault — Build and Run

How to build and run the deployable CUI vault (vault server + optional full VM/image). See [DEPLOYABLE_CUI_VAULT_PRODUCT.md](DEPLOYABLE_CUI_VAULT_PRODUCT.md) for product scope.

---

## 1. Vault server only (Docker)

From repository root:

```bash
cd cui-vault-server
docker compose up -d db
# Wait for DB healthy, then create table:
docker compose run --rm vault node scripts/init-db.js
docker compose up -d vault
```

Vault API: `http://localhost:3001`. Use nginx (or another reverse proxy) in front for TLS 1.3 in production.

**Production env:** Set `CUI_VAULT_JWT_SECRET`, `CUI_VAULT_API_KEY`, `CUI_ENCRYPTION_KEY` (64-char hex). Generate key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2. Full deployable image (VM or container)

Target contents:

- Ubuntu 22.04 with FIPS mode (kernel + OpenSSL FIPS provider per CMVP #4794)
- PostgreSQL (localhost, `cuivault` DB)
- CUI vault server ([cui-vault-server/](../cui-vault-server/)) — Node, listen 127.0.0.1
- nginx — TLS 1.3 termination, proxy to vault
- Hardening: [scripts/harden_ubuntu_cmmc.py](../scripts/harden_ubuntu_cmmc.py) → evidence in `/opt/compliance/hardening-evidence`
- Validation: [scripts/cmmc_hardening_validation_evidence.py](../scripts/cmmc_hardening_validation_evidence.py) → evidence in `/opt/compliance/validation-evidence`
- Policy bundle: [scripts/build-vault-compliance-bundle.py](../scripts/build-vault-compliance-bundle.py) → `/opt/compliance/policies`
- Evidence package script: [scripts/export-cmmc-evidence-package.sh](../scripts/export-cmmc-evidence-package.sh) (see Phase 4)

### Option A — Packer (VM image)

1. Use Ubuntu 22.04 base (e.g. `ubuntu-2204-lts` on GCP).
2. Enable FIPS: install `ubuntu-fips` (or Canonical FIPS kernel package), set kernel boot param, enable OpenSSL FIPS provider per [FIPS_VERIFICATION_RESULTS.md](../compliance/cmmc/level2/05-evidence/docs/FIPS_VERIFICATION_RESULTS.md).
3. Install Node 20, PostgreSQL, nginx; deploy vault server code; run `build-vault-compliance-bundle.py --install-dir /opt/compliance/policies`; copy hardening and validation scripts to `/opt/compliance/scripts/`.
4. Run hardening script (with approval where required), then validation script.
5. Configure nginx to proxy `/v1/files` to `127.0.0.1:3001`; TLS with certificate (e.g. Let’s Encrypt or customer-provided).
6. Systemd unit for vault service; DB init (run `cui-vault-server/scripts/init-db.js`) on first boot or image build.

A Packer template can automate the above; a minimal `packer.pkr.hcl` or `packer.json` would reference the Ubuntu 22.04 source and the provisioning steps above.

### Option B — Docker (full stack in one image)

Build a single image that runs PostgreSQL + vault + nginx (e.g. supervisord or multiple processes). FIPS in Docker depends on host or base image; for strict FIPS use a VM (Option A). For non-FIPS dev/test, use [cui-vault-server/docker-compose.yml](../cui-vault-server/docker-compose.yml) and add an nginx container with TLS.

---

## 3. Verify

- **Health:** `curl -s http://127.0.0.1:3001/health` (or via nginx) → `{"status":"ok"}`.
- **FIPS (VM):** See [compliance/cmmc/level2/05-evidence/docs/FIPS_VERIFICATION_RESULTS.md](../compliance/cmmc/level2/05-evidence/docs/FIPS_VERIFICATION_RESULTS.md); run `openssl version` and verify FIPS provider when FIPS mode is enabled.
- **Upload/View/Delete:** Use [CUI_VAULT_INTEGRATION.md](CUI_VAULT_INTEGRATION.md) and main app (Railway) to obtain tokens and exercise POST/GET/DELETE against the vault base URL.
