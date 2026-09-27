# Synthetic Web Testing Platform

Synthetic Web User Testing Platform is a monorepo for launching controlled synthetic browser sessions against web apps in a secure, authorized testing environment. It combines a FastAPI backend, a Next.js UI, Redis job orchestration, PostgreSQL persistence, and Playwright-based worker execution.

## Overview

This platform helps teams:

- register and manage synthetic browser workers
- queue browser tests and user scenarios
- execute Playwright runs in isolated jobs
- view test status from a web dashboard
- run local development stacks with Docker Compose

## Architecture

- Frontend: Next.js dashboard and control plane
- Backend: FastAPI API for worker registration, job submission, and health checks
- Queue: Redis for async job dispatch
- Database: PostgreSQL for job metadata and worker registry
- Workers: Playwright-based automation scripts running browser sessions

## Repository Layout

- `backend/` — FastAPI service
- `frontend/` — Next.js admin dashboard
- `workers/` — Playwright execution scripts and examples
- `docker-compose.yml` — local dev environment
- `.env.example` — copy to `.env` and customize

## Features

- Worker registry with health checks
- Redis-backed job queue
- PostgreSQL metadata store
- Example Playwright worker scripts
- Dockerized local development setup
- Auth-ready API surface for testing environments

## Quick Start

### 1. Clone and configure

```bash
git clone https://github.com/vsudev404/synthetic-web-testing-platform.git
cd synthetic-web-testing-platform
cp .env.example .env
```

### 2. Start the full stack

```bash
docker compose up --build
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- API on `http://localhost:8000`
- Frontend on `http://localhost:3000`

### 3. Verify the API

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{"status":"ok","service":"synthetic-web-testing-platform"}
```

## Environment Variables

Copy `.env.example` to `.env` and adjust values.

Example:

```env
POSTGRES_DB=synthetic_platform
POSTGRES_USER=platform
POSTGRES_PASSWORD=platform
REDIS_URL=redis://redis:6379/0
API_BASE_URL=http://backend:8000
FRONTEND_BASE_URL=http://frontend:3000
JWT_SECRET=change-me
```

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Worker scripts

```bash
cd workers
npm install
npx playwright install --with-deps
npx playwright test
```

## Example API

The FastAPI service includes starter endpoints for:

- `GET /health` — service health
- `GET /api/workers` — list registered workers
- `POST /api/workers/register` — register a worker
- `POST /api/jobs` — submit a new synthetic run
- `GET /api/jobs/{job_id}` — status lookup

## Security Notes

- Use a strong `JWT_SECRET` for authentication
- Restrict the platform to authorized testing environments
- Protect internal endpoints behind proper auth and network controls
- Avoid exposing sensitive credentials in browser automation logs

## Recommended Roadmap

- Add authentication and RBAC
- Add job retries and dead-letter handling
- Add queue metrics and dashboard analytics
- Add browser session recordings and screenshots
- Add policy checks for authorized user testing

## Contributing

Please open a discussion or issue before major changes. Keep config values environment-driven and document operational assumptions.

## License

This project is licensed under the MIT License. See `LICENSE` for details.

## Support

For questions, operational setup, and deployment guidance, open an issue in this repository.

