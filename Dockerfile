# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN npm install -g pnpm@9

WORKDIR /app
COPY package.json pnpm-workspace.yaml .npmrc ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/legal-rag/package.json  ./artifacts/legal-rag/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json         ./lib/api-spec/
COPY lib/api-zod/package.json          ./lib/api-zod/
COPY lib/db/package.json               ./lib/db/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app
COPY . .

# Build React frontend first (outputs to artifacts/legal-rag/dist/public)
RUN pnpm --filter @workspace/legal-rag run build

# Build Express API server (outputs to artifacts/api-server/dist/)
RUN pnpm --filter @workspace/api-server run build

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN npm install -g pnpm@9

WORKDIR /app
ENV NODE_ENV=production

# Copy only what is needed at runtime
COPY --from=builder /app/package.json             ./package.json
COPY --from=builder /app/pnpm-workspace.yaml      ./pnpm-workspace.yaml
COPY --from=builder /app/.npmrc                   ./.npmrc
COPY --from=builder /app/artifacts/api-server/package.json  ./artifacts/api-server/package.json
COPY --from=builder /app/lib/db/package.json                ./lib/db/package.json

# Install production-only deps
RUN pnpm install --prod --frozen-lockfile

# Copy build artefacts
COPY --from=builder /app/artifacts/api-server/dist  ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/legal-rag/dist   ./artifacts/legal-rag/dist

EXPOSE 8080
ENV PORT=8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
