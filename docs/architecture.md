# Architecture Overview

```text
Browser Workers  ->  Redis Queue  ->  FastAPI API  ->  PostgreSQL
                              ^
                              |
                           Next.js UI
```

This design keeps the platform modular and allows each layer to scale independently.

