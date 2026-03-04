# ---- Build stage ----
FROM node:22-slim AS build

RUN corepack enable pnpm

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/atlas-parser/package.json packages/atlas-parser/
COPY packages/atlas-server/package.json packages/atlas-server/
COPY packages/atlas-ui/package.json packages/atlas-ui/
COPY packages/atlas-cli/package.json packages/atlas-cli/
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY tsconfig.base.json ./
COPY packages/ packages/
RUN pnpm build

# ---- Runtime stage ----
FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*
RUN corepack enable pnpm

WORKDIR /app

# Copy built artifacts and production deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/atlas-parser/package.json packages/atlas-parser/
COPY packages/atlas-server/package.json packages/atlas-server/
COPY packages/atlas-cli/package.json packages/atlas-cli/
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/packages/atlas-parser/dist packages/atlas-parser/dist
COPY --from=build /app/packages/atlas-server/dist packages/atlas-server/dist
COPY --from=build /app/packages/atlas-cli/dist packages/atlas-cli/dist

# Include sample ADRs for demo
COPY examples/ examples/

ENV NODE_ENV=production
EXPOSE 3000

VOLUME ["/root/.atlas"]

ENTRYPOINT ["node", "packages/atlas-cli/dist/main.js"]
CMD ["serve"]
