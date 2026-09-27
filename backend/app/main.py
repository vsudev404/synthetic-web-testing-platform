from __future__ import annotations

import ipaddress
import json
import logging
import os
import socket
import uuid
from datetime import datetime, timezone
from typing import Literal
from urllib.parse import urlparse

import redis.asyncio as redis
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from pydantic import AnyHttpUrl, BaseModel, Field, field_validator

from .config import settings

logging.basicConfig(level=settings.log_level, format="%(message)s")
logger = logging.getLogger("synthetic-platform")

app = FastAPI(title="Synthetic Web Testing Platform", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

redis_client = redis.from_url(settings.redis_url, decode_responses=True)
QUEUE = "synthetic:jobs"
JOB_PREFIX = "synthetic:job:"
REQUESTS = Counter("api_requests_total", "API requests", ["method", "path", "status"])
JOB_COUNTER = Counter("jobs_created_total", "Jobs created")
REQUEST_LATENCY = Histogram("api_request_duration_seconds", "API request duration")


class WorkerRegistration(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    kind: Literal["browser", "api", "mixed"] = "browser"
    status: Literal["healthy", "degraded", "offline"] = "healthy"
    region: str = Field(default="default", max_length=100)


class JobCreate(BaseModel):
    target_url: AnyHttpUrl
    visitors: int = Field(default=1, ge=1, le=settings.max_visitors_per_job)

    @field_validator("target_url")
    @classmethod
    def validate_target(cls, value: AnyHttpUrl) -> AnyHttpUrl:
        parsed = urlparse(str(value))
        if parsed.scheme not in {"http", "https"}:
            raise ValueError("Only HTTP and HTTPS targets are supported")
        if not settings.allow_private_targets:
            host = parsed.hostname
            if not host:
                raise ValueError("Target hostname is required")
            try:
                addresses = socket.getaddrinfo(host, None)
            except socket.gaierror as exc:
                raise ValueError("Target hostname could not be resolved") from exc
            for address in addresses:
                ip = ipaddress.ip_address(address[4][0])
                if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                    raise ValueError("Private and local network targets are disabled")
        if settings.allowed_target_domains:
            host = (parsed.hostname or "").lower()
            if not any(host == domain or host.endswith("." + domain) for domain in settings.allowed_target_domains):
                raise ValueError("Target domain is not in the configured allow-list")
        return value


@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    with REQUEST_LATENCY.time():
        response = await call_next(request)
    REQUESTS.labels(request.method, request.url.path, str(response.status_code)).inc()
    return response


@app.get("/health")
async def health():
    redis_ok = True
    try:
        await redis_client.ping()
    except Exception:
        redis_ok = False
    return {"status": "ok" if redis_ok else "degraded", "redis": redis_ok}


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/api/workers")
def list_workers():
    return [{"name": "playwright-worker", "kind": "browser", "status": "healthy", "region": "default"}]


@app.post("/api/workers/register")
def register_worker(worker: WorkerRegistration):
    return {"message": "worker registered", "worker": worker.model_dump()}


@app.post("/api/jobs", status_code=202)
async def create_job(job: JobCreate):
    job_id = uuid.uuid4().hex
    now = datetime.now(timezone.utc).isoformat()
    payload = {"job_id": job_id, "target_url": str(job.target_url), "visitors": job.visitors, "status": "queued", "created_at": now}
    await redis_client.hset(f"{JOB_PREFIX}{job_id}", mapping={k: json.dumps(v) if isinstance(v, (dict, list)) else str(v) for k, v in payload.items()})
    await redis_client.xadd(QUEUE, payload, maxlen=100000, approximate=True)
    JOB_COUNTER.inc()
    return {"message": "job queued", "job_id": job_id, "status": "queued"}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    data = await redis_client.hgetall(f"{JOB_PREFIX}{job_id}")
    if not data:
        raise HTTPException(status_code=404, detail="job not found")
    if "visitors" in data:
        data["visitors"] = int(data["visitors"])
    return data


@app.delete("/api/jobs/{job_id}", status_code=202)
async def cancel_job(job_id: str):
    if not await redis_client.exists(f"{JOB_PREFIX}{job_id}"):
        raise HTTPException(status_code=404, detail="job not found")
    await redis_client.hset(f"{JOB_PREFIX}{job_id}", "status", "cancelled")
    return {"job_id": job_id, "status": "cancelled"}


@app.on_event("shutdown")
async def shutdown():
    await redis_client.aclose()
