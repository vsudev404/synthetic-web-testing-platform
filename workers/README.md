# Worker Scripts

The `workers/` directory contains Playwright-based test scripts and runner examples for creating synthetic browser sessions.

## Run locally

```bash
cd workers
npm install
npx playwright install --with-deps
npx playwright test
```

## Example script

See `workers/examples/basic-check.ts` for a simple flow that loads a page and asserts the title.

## Typical workflow

1. register the worker with the control plane
2. submit a job to run a Playwright scenario
3. gather logs, screenshots, and final status

## Notes

These scripts are intentionally simple and designed as a starting point for authorization-aware browser testing scenarios.

