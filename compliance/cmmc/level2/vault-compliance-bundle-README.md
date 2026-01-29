# Vault Compliance Bundle

Policies and procedures that apply to the **CUI vault VM boundary** (CMMC Level 2). This subset is bundled in the deployable CUI vault image under `/opt/compliance/policies`.

## Manifest

- **Manifest:** [vault-compliance-bundle-manifest.json](vault-compliance-bundle-manifest.json) — list of policy and procedure files included in the bundle.

## Build

From repository root:

```bash
python3 scripts/build-vault-compliance-bundle.py
```

Output: `compliance/cmmc/level2/vault-compliance-bundle/` (copy of listed files).

Optional:

- `--output-dir <path>` — custom output directory.
- `--install-dir /opt/compliance/policies` — also copy bundle to this path (e.g. during image build; may require root).

## Use in deployable image

The image build (Packer or Docker) should run the script and copy the bundle to `/opt/compliance/policies` so the VM ships with CMMC-required policies and procedures for the vault boundary.
