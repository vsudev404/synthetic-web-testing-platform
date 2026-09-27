const { spawn } = require('child_process');
const { createClient } = require('redis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379/0';

async function main() {
  const client = createClient({ url: REDIS_URL });
  client.on('error', (err) => console.error('Redis Client Error', err));
  await client.connect();
  console.log('Worker connected to Redis, waiting for jobs...');

  while (true) {
    try {
      // BRPOP blocks until a job is available
      const res = await client.brPop('jobs', 0);
      // res may be { key, element } (node-redis v4) or an array
      const jobStr = res.element || (Array.isArray(res) ? res[1] : undefined);
      if (!jobStr) {
        console.warn('Received unexpected BRPOP response:', res);
        continue;
      }
      const job = JSON.parse(jobStr);
      console.log('Received job:', job.job_id, job.target_url, job.visitors);

      // Launch visitors (run playwright test for each visitor in parallel)
      const procs = [];
      for (let i = 0; i < job.visitors; i++) {
        const env = Object.assign({}, process.env, { APP_BASE_URL: job.target_url });
        // run the example test file once per visitor
        const p = spawn('npx', ['playwright', 'test', 'examples/basic-check.ts', '--project=chromium', '--reporter=list'], { stdio: 'inherit', env });
        procs.push(new Promise((resolve) => p.on('close', (code) => resolve(code))));
      }
      const results = await Promise.all(procs);
      const successCount = results.filter((c) => c === 0).length;

      // update job status in Redis
      await client.hSet(`job:${job.job_id}`, 'status', 'complete');
      await client.hSet(`job:${job.job_id}`, 'completed_at', new Date().toISOString());
      await client.hSet(`job:${job.job_id}`, 'success_count', String(successCount));

      console.log(`Job ${job.job_id} complete. Success: ${successCount}/${job.visitors}`);
    } catch (err) {
      console.error('Worker error:', err);
      // small delay before retrying
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

main().catch((e) => {
  console.error('Fatal worker error', e);
  process.exit(1);
});
