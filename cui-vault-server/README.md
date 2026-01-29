# CUI Vault Server

Implements the [CUI Vault API Contract](../../docs/CUI_VAULT_API_CONTRACT.md): POST/GET/DELETE `/v1/files/*` with JWT (upload/view) and API key (delete). CUI is stored encrypted (AES-256-GCM) in PostgreSQL.

## Requirements

- Node.js 18+
- PostgreSQL (localhost or `DB_*` env)

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `CUI_VAULT_JWT_SECRET` | Yes* | Secret for verifying upload/view JWTs (same as Railway) |
| `CUI_VAULT_API_KEY` | Yes | API key for X-VAULT-KEY (delete); also fallback for JWT secret |
| `CUI_ENCRYPTION_KEY` | Yes | 64-char hex (32 bytes) for AES-256-GCM |
| `DB_HOST` | No | Default 127.0.0.1 |
| `DB_PORT` | No | Default 5432 |
| `DB_NAME` | No | Default cuivault |
| `DB_USER` | No | Default cuivault_user |
| `DB_PASSWORD` | Yes for DB | PostgreSQL password |
| `PORT` | No | Default 3001 (listen 127.0.0.1) |
| `CUI_VAULT_MAX_FILE_SIZE` | No | Max upload size bytes (default 52428800 = 50MB) |
| `CUI_VAULT_CORS_ORIGIN` | Yes for browser uploads | Comma-separated allowed origins (e.g. `https://www.mactechsolutionsllc.com`) or `*`. Required so the app’s GUI can POST to the vault from a different origin. |

## Database

Create database and user, then run:

```bash
npm run init-db
```

Table: `cui_records (id, ciphertext, nonce, tag, mime_type, created_at)`.

## Run

```bash
npm install
npm run init-db
npm start
```

Server listens on `127.0.0.1:PORT`. Put nginx (or another reverse proxy) in front for TLS 1.3.

## Endpoints

- `GET /health` — 200 OK (no auth)
- `POST /v1/files/upload` — `Authorization: Bearer <uploadToken>`, multipart `file`
- `GET /v1/files/:vaultId?token=<viewToken>` — returns raw file bytes
- `DELETE /v1/files/:vaultId` — `X-VAULT-KEY: <apiKey>`, 204 or 404
