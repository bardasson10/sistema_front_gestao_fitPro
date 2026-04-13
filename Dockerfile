FROM node:20-alpine AS base

# 1. Instalar dependências necessárias
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
# Copia os arquivos de dependências da pasta src para o root da build
COPY src/package.json src/package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copia todo o conteúdo da pasta src para o diretório de trabalho
COPY src/ .

# IMPORTANTE: O comando build do Next gera a pasta .next/standalone
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copia os arquivos gerados no modo standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]