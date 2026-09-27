const { createClient } = require('redis');
const { spawn } = require('node:child_process');

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379/0';
const STREAM = 'synthetic:jobs';
const GROUP = process.env.WORKER_GROUP || 'playwright-workers';
const CONCURRENCY = Math.max(1, Number(process.env.WORKER_CONCURRENCY || 2));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runVisitor(targetUrl) {
  return new Promise((resolve) => {
    const env = { ...process.env, APP_BASE_URL: targetUrl };
    const child = spawn('npx', ['playwright', 'test', 'examples/basic-check.ts', '--project=chromium', '--reporter=line'], { env, stdio: 'inherit' });
    child.on('close', (code) => resolve(code === 0));
  });
}

async function main() {
  const client = createClient({ url: REDIS_URL });
  client.on('error', (error) => console.error(JSON.stringify({ event: 'redis_error', error: error.message })));
  await client.connect();
  try { await client.xGroupCreate(STREAM, GROUP, '$', { MKSTREAM: true }); } catch (error) {
    if (!String(error.message).includes('BUSYGROUP')) throw error;
  }
  console.log(JSON.stringify({ event: 'worker_ready', group: GROUP, concurrency: CONCURRENCY }));
  while (true) {
    const response = await client.xReadGroup(GROUP, `worker-${process.pid}`, [{ key: STREAM, id: '>' }], { COUNT: 1, BLOCK: 5000 });
    if (!response) continue;
    for (const record of response[0].messages) {
      const job = Object.fromEntries(record.message);
      await client.hSet(`synthetic:job:${job.job_id}`, { status: 'running', started_at: new Date().toISOString() });
      const results = await Promise.all(Array.from({ length: Number(job.visitors) }, () => runVisitor(job.target_url)));
      const successful = results.filter(Boolean).length;
      await client.hSet(`synthetic:job:${job.job_id}`, { status: successful === results.length ? 'complete' : 'failed', success_count: successful, completed_at: new Date().toISOString() });
      await client.xAck(STREAM, GROUP, record.id);
    }
    await sleep(50);
  }
}
main().catch((error) => { console.error(error); process.exit(1); });
