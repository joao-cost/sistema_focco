#!/bin/sh
set -e

# Em Swarm/compose o container do "app" pode iniciar antes do Postgres estar
# pronto pra aceitar conexões (não há orquestração de "health" entre serviços
# no Swarm). Em vez de deixar o container crash-looping em cada tentativa,
# espera algumas vezes antes de desistir.
echo "==> sistema_focco: aguardando banco de dados..."
attempt=0
until node scripts/migrate.mjs; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 15 ]; then
    echo "==> sistema_focco: banco não respondeu após várias tentativas, desistindo."
    exit 1
  fi
  echo "==> sistema_focco: banco ainda não disponível (tentativa $attempt/15), tentando de novo em 3s..."
  sleep 3
done

echo "==> sistema_focco: iniciando servidor..."
exec node server.js
