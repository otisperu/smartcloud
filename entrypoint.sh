#!/bin/sh
set -e

echo "🔄 Aplicando schema de Prisma a la base de datos..."
npx prisma db push --skip-generate

echo "🚀 Iniciando servidor Next.js..."
exec node server.js
