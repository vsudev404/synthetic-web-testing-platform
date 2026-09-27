#!/usr/bin/env bash
set -euo pipefail

# Convenience script to start the full stack and wait for the backend to be healthy.
# Usage: ./scripts/start.sh

RETRIES=30
SLEEP=2
HEALTH_URL="http://localhost:8000/health"

command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is required but not installed. Aborting."; exit 1; }

if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
  echo "Copied .env.example to .env - please review .env before running in production."
fi

echo "Bringing up services with: docker compose up --build -d"
docker compose up --build -d

echo "Waiting for backend to report healthy at ${HEALTH_URL} (timeout $((RETRIES*SLEEP))s)"

i=0
until [ $i -ge $RETRIES ]
do
  if curl -sS ${HEALTH_URL} >/dev/null 2>&1; then
    echo "Backend is healthy."
    exit 0
  fi
  i=$((i+1))
  echo "  - attempt ${i}/${RETRIES}..."
  sleep ${SLEEP}
done

echo "Timed out waiting for backend to become healthy. Check logs with 'make logs' or ./scripts/check-health.sh'"
exit 2
