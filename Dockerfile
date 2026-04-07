FROM node:20-alpine AS base

# ── Stage 1: Dependencias ──────────────────────────────────────────────────
FROM base AS deps
# Instalamos libc6-compat y openssl para que Prisma funcione en Alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# ── Stage 2: Construcción ───────────────────────────────────────────────────
FROM base AS builder
# Necesitamos openssl también en el builder para prisma generate
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivamos telemetría
ENV NEXT_TELEMETRY_DISABLED=1

# Generamos el Cliente de Prisma
RUN npx prisma generate

# IMPORTANTE: Saltamos el chequeo de base de datos durante el build de Next.js
# Esto evita que el despliegue falle si el VPS de base de datos no está listo
ENV SKIP_PRISMA_BUILD_CHECK=true
RUN npm run build

# ── Stage 3: Ejecución Producción ──────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Creamos la carpeta public si no existe para evitar errores al copiar
RUN mkdir -p public

# Copiamos solo lo necesario del builder (archivo standalone)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
