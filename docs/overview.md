# Synthetic Web Testing Platform

This project provides a starter monorepo for a synthetic web testing platform that orchestrates browser workloads with Playwright, Redis, PostgreSQL, and a FastAPI control plane.

## Included

- `backend/` — FastAPI app starter
- `frontend/` — Next.js dashboard starter
- `workers/` — Playwright example runner
- `docker-compose.yml` — local orchestration
- `README.md` — project overview

## Local startup

```bash
docker compose up --build
```

## Documentation

- `README.md`
- `backend/README.md`
- `frontend/README.md`
- `workers/README.md`

## Maintainer

This repository is intended for controlled synthetic testing workflows and can be extended with auth, queue workers, and analytics.

