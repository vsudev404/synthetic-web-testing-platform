# Enterprise operations

## Configuration

- `MAX_VISITORS_PER_JOB` limits a single request (default `100`).
- `ALLOWED_TARGET_DOMAINS` is a comma-separated allow-list supported by deployment configuration.
- `ALLOW_PRIVATE_TARGETS=false` blocks local/private network targets by default.
- `WORKER_CONCURRENCY` controls worker capacity (start at 2 per container).

## Reliability

Jobs are persisted as Redis hashes and delivered through Redis Streams consumer groups. Workers acknowledge messages only after visitor executions finish. Production deployments should add a scheduled pending-message reclaimer and a dead-letter stream.

## Security checklist

- Put the API behind authentication and TLS.
- Use per-tenant quotas and audit logs.
- Keep target domains explicitly allow-listed.
- Run browser workers in isolated containers with restricted egress.
- Store secrets in a secret manager, not `.env` in source control.

## Local verification

```bash
docker compose build --no-cache
docker compose up -d
curl http://localhost:8000/health
curl http://localhost:8000/metrics
```
