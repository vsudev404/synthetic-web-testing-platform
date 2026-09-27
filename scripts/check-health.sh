#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL="http://localhost:8000/health"
RETRIES=10
SLEEP=2

i=0
until [ $i -ge $RETRIES ]
do
  printf "Checking backend health (%d/%d)\n" "$((i+1))" "$RETRIES"
  if curl -fsS ${HEALTH_URL} >/dev/null 2>&1; then
    echo "OK: backend healthy"
    exit 0
  fi
  i=$((i+1))
  sleep ${SLEEP}
done

echo "Backend not healthy or not responding at ${HEALTH_URL}."
exit 1
