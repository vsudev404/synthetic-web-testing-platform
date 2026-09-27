from fastapi import FastAPI
from pydantic import BaseModel
from typing import Literal

app = FastAPI(title="Synthetic Web Testing Platform")


class WorkerRegistration(BaseModel):
    name: str
    kind: Literal["browser", "api", "mixed"] = "browser"
    status: Literal["healthy", "degraded", "offline"] = "healthy"
    region: str = "default"


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
def create_job():
    return {
        "job_id": "job-001",
        "status": "queued",
        "message": "job accepted",
    }
