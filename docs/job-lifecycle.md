## Launching visitor jobs

The frontend submits `target_url` and `visitors` to `POST /api/jobs`. The backend validates the URL, enforces the visitor limit and target safety policy, stores job state, and publishes the job to a Redis Stream. A Playwright worker consumes the stream, runs the requested number of isolated browser executions, and updates status at `GET /api/jobs/{job_id}`.

See `docs/traffic-capacity.md` for traffic calculations, sizing examples, and platform limits. See `docs/enterprise-operations.md` for production hardening guidance.
