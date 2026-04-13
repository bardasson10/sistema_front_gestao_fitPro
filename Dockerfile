FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app/src
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps

COPY src/package.json src/package-lock.json ./
RUN npm ci

FROM base AS builder

COPY --from=deps /app/src/node_modules ./node_modules
COPY src/ ./

RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/src/public ./public
COPY --from=builder /app/src/.next/standalone ./
COPY --from=builder /app/src/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]