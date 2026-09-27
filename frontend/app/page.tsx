'use client'

import React, { useState } from 'react';

export default function Home() {
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [visitors, setVisitors] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  async function submitJob(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Submitting job...');
    setJobStatus(null);
    try {
      const res = await fetch(`${apiBase}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_url: targetUrl, visitors: Number(visitors) }),
      });
      const data = await res.json();
      if (res.ok) {
        setJobId(data.job_id);
        setMessage('Job queued: ' + data.job_id);
      } else {
        setMessage('Error: ' + JSON.stringify(data));
      }
    } catch (err: any) {
      setMessage('Request failed: ' + String(err));
    }
  }

  async function pollStatus() {
    if (!jobId) return;
    try {
      const res = await fetch(`${apiBase}/api/jobs/${jobId}`);
      const data = await res.json();
      setJobStatus(data);
    } catch (err: any) {
      setMessage('Status request failed: ' + String(err));
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <h1>Synthetic Web Testing Platform</h1>
      <p>Launch controlled synthetic browser sessions for authorized testing across your web product.</p>

      <section style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #eee', borderRadius: 8 }}>
        <h2>Launch a synthetic visitor run</h2>
        <form onSubmit={submitJob}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Target URL</label>
            <input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Number of visitors</label>
            <input
              type="number"
              min={1}
              value={visitors}
              onChange={(e) => setVisitors(Number(e.target.value))}
              style={{ width: 120, padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '0.5rem 1rem' }}>Start</button>
            <button type="button" onClick={pollStatus} style={{ padding: '0.5rem 1rem' }} disabled={!jobId}>
              Check Status
            </button>
          </div>
        </form>

        <div style={{ marginTop: 12 }}>
          {message && <div style={{ marginBottom: 8 }}>{message}</div>}
          {jobStatus && (
            <pre style={{ background: '#fbfbfb', padding: 12, borderRadius: 6 }}>{JSON.stringify(jobStatus, null, 2)}</pre>
          )}
        </div>
      </section>

    </main>
  );
}
