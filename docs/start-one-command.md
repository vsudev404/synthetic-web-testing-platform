## One-command start

This repository includes convenient scripts and a Makefile target to start the full development stack with a single command.

- Linux / macOS
  - make start
  - or ./scripts/start.sh

- Windows (PowerShell)
  - .\scripts\start.ps1

What these do:

- copy `.env.example` to `.env` if no `.env` exists
- run `docker compose up --build -d` to build and start Postgres, Redis, backend, frontend, and worker
- wait for the backend health endpoint (`http://localhost:8000/health`) to respond

Troubleshooting

- Check logs with `make logs` or `docker compose logs -f`
- Stop the stack with `make stop` or `./scripts/stop.sh`
