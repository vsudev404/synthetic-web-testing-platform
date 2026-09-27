# FastAPI App

This starter app defines the HTTP layer for the synthetic testing platform.

## File structure

```text
backend/
  app/
    __init__.py
    config.py
    main.py
    schemas.py
  Dockerfile
  requirements.txt
```

## Example app code

```python
from fastapi import FastAPI

app = FastAPI(title="Synthetic Web Testing Platform")

@app.get("/health")
def health():
    return {"status": "ok", "service": "synthetic-web-testing-platform"}
```

