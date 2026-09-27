# Backend Service

The backend provides the control plane for the synthetic web testing platform. It exposes a FastAPI API for worker registration, job submission, result polling, and health checks.

## Stack

- FastAPI
- Pydantic
- PostgreSQL-ready models
- Redis-ready worker queue integration
- Docker-friendly configuration

## Run locally

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Core API

- `GET /health` — service health check
- `GET /api/workers` — list known workers
- `POST /api/workers/register` — add a worker
- `POST /api/jobs` — create a job
- `GET /api/jobs/{job_id}` — fetch job state

## Example request

```bash
curl -X POST http://localhost:8000/api/workers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "playwright-headless-worker",
    "kind": "browser",
    "status": "healthy",
    "region": "us-east-1"
  }'
```

## Configuration

Environment variables are loaded from `.env` or Docker Compose environment settings.

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `REDIS_URL`
- `JWT_SECRET`

