FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat vips-cpp
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache vips-cpp
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Next standalone tracing omits tesseract.js worker-script/ (MODULE_NOT_FOUND on '..')
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tesseract.js ./node_modules/tesseract.js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/tesseract.js-core ./node_modules/tesseract.js-core
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bmp-js ./node_modules/bmp-js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/idb-keyval ./node_modules/idb-keyval
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/is-url ./node_modules/is-url
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/node-fetch ./node_modules/node-fetch
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/regenerator-runtime ./node_modules/regenerator-runtime
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/wasm-feature-detect ./node_modules/wasm-feature-detect
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/zlibjs ./node_modules/zlibjs

# After standalone copy — tesseract reads langPath/eng.traineddata (gzip: false in ocr.ts)
ADD https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata ./eng.traineddata
RUN chown nextjs:nodejs ./eng.traineddata

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
