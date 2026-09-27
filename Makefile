.DEFAULT_GOAL := start

COMPOSE := docker compose

.PHONY: start stop logs restart health build

start:
	@if [ -f .env.example ] && [ ! -f .env ]; then cp .env.example .env; fi
	@echo "Starting full stack (Postgres, Redis, backend, frontend, worker) using $(COMPOSE)..."
	$(COMPOSE) up --build -d
	@echo "Waiting for backend health..."
	./scripts/check-health.sh

stop:
	@echo "Stopping full stack..."
	$(COMPOSE) down --volumes --remove-orphans

logs:
	$(COMPOSE) logs -f --tail=200

restart:
	$(MAKE) stop
	$(MAKE) start

health:
	./scripts/check-health.sh

build:
	$(COMPOSE) build
