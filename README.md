# Synthetic Web Testing Platform

Synthetic Web User Testing Platform is a monorepo for launching controlled synthetic browser sessions against web apps in a secure, authorized testing environment. It combines a FastAPI backend, a Next.js UI, Redis job orchestration, PostgreSQL persistence, and Playwright-based worker execution.

## One-step install (start the full stack)

If you want to run the entire platform locally with one command, use the provided Makefile or scripts. This will build and start PostgreSQL, Redis, the backend API, the frontend dashboard, and a worker, then wait for the backend to report healthy.

- Linux / macOS
  - make start
  - or ./scripts/start.sh

- Windows (PowerShell)
  - .\scripts\start.ps1

What this does:
- Copies `.env.example` to `.env` if no `.env` exists
- Runs `docker compose up --build -d` to build and start Postgres, Redis, backend, frontend, and worker
- Waits for the backend health endpoint (`http://localhost:8000/health`) to respond

Troubleshooting
- Check logs with `make logs` or `docker compose logs -f`
- Stop the stack with `make stop` or `./scripts/stop.sh`


## New: Run synthetic visitor jobs from the frontend

You can now submit visitor jobs directly from the frontend. In the dashboard, enter:

- Target URL — the URL to visit (e.g., https://staging.example.com)
- Number of visitors — how many browser sessions to run

Click Start. The frontend will POST a job to the backend which queues it in Redis. A worker process will pick up the job and run Playwright-based sessions against the target URL. After completion you can poll the job status from the frontend.

## Overview

This platform helps teams:

- register and manage synthetic browser workers
- queue browser tests and user scenarios
- execute Playwright runs in isolated jobs
- view test status from a web dashboard
- run local development stacks with Docker Compose

... (rest of README unchanged)
