# API Setup

The backend is intended to serve as the orchestrator API for job registration and health monitoring.

## Endpoints

- `GET /health`
- `GET /api/workers`
- `POST /api/workers/register`
- `POST /api/jobs`
- `GET /api/jobs/{job_id}`

## Status model

```json
{
  "job_id": "job-123",
  "status": "queued",
  "worker": "playwright-worker-01",
  "created_at": "2026-09-27T00:00:00Z"
}
```

