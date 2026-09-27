from fastapi import FastAPI
from pydantic import BaseModel, AnyUrl
from typing import Literal
import uuid
import json
from datetime import datetime
import asyncio

from .config import settings

import redis.asyncio as aioredis

app = FastAPI(title="Synthetic Web Testing Platform")

# Redis client (used as a job queue)
redis_client = aioredis.from_url(settings.redis_url, decode_responses=True)


class WorkerRegistration(BaseModel):
    name: str
    kind: Literal["browser", "api", "mixed"] = "browser"
    status: Literal["healthy", "degraded", "offline"] = "healthy"
    region: str = "default"


class JobCreate(BaseModel):
    target_url: AnyUrl
    visitors: int = 1


@app.on_event("shutdown")
async def shutdown_event():
    try:
        await redis_client.close()
    except Exception:
        pass


@app.get("/health")
def health():
    return {"status": "ok", "service": "synthetic-web-testing-platform"}


@app.get("/api/workers")
def list_workers():
    return [
        {
            "name": "playwright-headless-worker",
            "kind": "browser",
            "status": "healthy",
            "region": "us-east-1",
        }
    ]


@app.post("/api/workers/register")
def register_worker(worker: WorkerRegistration):
    return {
        "message": "worker registered",
        "worker": worker.model_dump(),
    }


@app.post("/api/jobs")
async def create_job(job: JobCreate):
    job_id = uuid.uuid4().hex
    payload = {
        "job_id": job_id,
        "target_url": str(job.target_url),
        "visitors": int(job.visitors),
        "status": "queued",
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    # push to Redis queue
    await redis_client.rpush("jobs", json.dumps(payload))
    # create job status hash
    await redis_client.hset(f"job:{job_id}", mapping={
        "status": "queued",
        "target_url": payload["target_url"],
        "visitors": str(payload["visitors"]),
        "created_at": payload["created_at"],
    })
    return {"message": "job queued", "job_id": job_id}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    data = await redis_client.hgetall(f"job:{job_id}")
    if not data:
        return {"error": "job not found"}
    # Convert visitors to int if present
    if "visitors" in data:
        try:
            data["visitors"] = int(data["visitors"])
        except Exception:
            pass
    return data
