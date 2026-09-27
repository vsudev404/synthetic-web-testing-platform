#!/usr/bin/env bash
set -euo pipefail

echo "Stopping and removing containers..."
docker compose down --volumes --remove-orphans

echo "Stopped."
