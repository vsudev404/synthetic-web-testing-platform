from pydantic import BaseModel


class JobStatus(BaseModel):
    job_id: str
    status: str
    worker: str | None = None
    created_at: str | None = None
