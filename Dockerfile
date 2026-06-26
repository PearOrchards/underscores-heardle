ARG NODE_IMAGE=node:26-alpine

# ! builder: install deps + produce standalone Next output
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
RUN npm i -g corepack@latest && corepack enable
# manifest first so the install layer caches until the lockfile changes.
# and copy pnpm-workspace.yaml since it carries the allowBuilds / supply-chain settings
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
# metadataBase / OpenGraph image URLs are baked into static pages at build time.
# Override with real domain: --build-arg URL=https://heardle.orchards.dev
ARG URL=http://localhost:5000
ENV URL=${URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ! RUNNER: run the thing
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

# /api/audio uses ffmpeg via fluent-ffmpeg. so install that.
RUN apk add --no-cache ffmpeg

RUN addgroup -S -g 1001 nodejs \
    && adduser -S -u 1001 -G nodejs nextjs

# standalone bundle has node_modules + server.js, but no public/ or .next/static. so copy those.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 5000
CMD ["node", "server.js"]
