#!/bin/sh
set -e

# A Vercel builda todo push (inclusive Preview Deployments de PRs). Como o
# Supabase Free só tem um banco, rodamos as migrations apenas no deploy de
# Produção (branch main) — evita rodar a mesma migration em paralelo em
# vários previews e migrar o banco por causa de uma branch de teste.
if [ "$VERCEL_ENV" = "production" ]; then
  echo "==> sistema_focco: ambiente de produção — aplicando migrations..."
  node scripts/migrate.mjs
else
  echo "==> sistema_focco: ambiente '${VERCEL_ENV:-desconhecido}' — pulando migrations."
fi

echo "==> sistema_focco: rodando next build..."
next build
