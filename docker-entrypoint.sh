#!/bin/sh
set -e

echo "==> sistema_focco: aplicando migrations..."
node scripts/migrate.mjs

echo "==> sistema_focco: iniciando servidor..."
exec node server.js
