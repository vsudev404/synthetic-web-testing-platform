# Enterprise traffic and capacity guide

## Safety first

This platform is for authorized testing only. The API defaults to blocking private, loopback, link-local, and reserved IP targets. Configure `ALLOWED_TARGET_DOMAINS` and use a staging environment wherever possible. Do not use this system to overwhelm systems you do not own or have written permission to test.

## What one visitor means

One visitor is one Playwright browser execution. A browser loads the target page and all resources requested by that page. The traffic is therefore not equal to one HTTP request: a single visitor can produce tens or hundreds of requests depending on JavaScript, images, fonts, analytics, API polling, and redirects.

Approximate traffic:

- sessions per minute = concurrent sessions × 60 / average session duration in seconds
- requests per second = sessions per minute × average requests per session / 60
- bandwidth per hour = sessions per hour × average MB downloaded per session

Measure request count, bytes, and duration against your own staging workload; these are planning formulas, not guarantees.

## Example planning scenarios

| Worker capacity | Safe starting concurrency | Typical session duration | Sessions/hour | Example requests/session | Approx. requests/sec |
|---|---:|---:|---:|---:|---:|
| 4 vCPU / 8 GB | 4–8 | 60 sec | 240–480 | 30 | 2–4 |
| 8 vCPU / 32 GB | 16–32 | 60 sec | 960–1,920 | 30 | 8–16 |
| 16 vCPU / 64 GB | 32–64 | 60 sec | 1,920–3,840 | 30 | 16–32 |

These ranges depend on page weight, browser context isolation, screenshots/video, CPU throttling, network latency, and worker implementation. Start low, observe, then increase gradually.

## Scaling calculation

To target `N` concurrent sessions, use `ceil(N / sessions_per_worker)` worker replicas. Keep 20–50% headroom for browser startup spikes and retries. For example, 100 desired sessions at 20 sessions per worker requires at least 5 workers; production planning should use 6–8.

## Platform limits

- `MAX_VISITORS_PER_JOB` defaults to 100 to protect the target and worker.
- Docker Compose is for development and small controlled tests; use Kubernetes/ECS for autoscaling.
- Redis Streams provide consumer groups and acknowledgements, but production deployments still need pending-entry recovery, retention policies, and a dead-letter process.
- Browser artifacts can consume 2–20+ MB per session; use object storage and retention policies.
- Add authentication, tenant quotas, domain allow-lists, rate limits, and audit logs before exposing the API publicly.
