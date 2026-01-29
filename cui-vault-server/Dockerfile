# CUI Vault API server - run behind nginx for TLS.
# Database (PostgreSQL) must be provided via DB_* env or linked container.
FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY config.js crypto-util.js jwt-util.js db.js server.js ./
COPY scripts/ scripts/

# Listen on 127.0.0.1 when used behind nginx; override with PORT and bind in entrypoint if needed
ENV NODE_ENV=production
EXPOSE 3001

USER node
CMD ["node", "server.js"]
