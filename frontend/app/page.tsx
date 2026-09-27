const jobs = [
  { id: 'job-101', status: 'running', worker: 'playwright-eu-01' },
  { id: 'job-102', status: 'queued', worker: 'playwright-us-02' },
  { id: 'job-103', status: 'complete', worker: 'playwright-us-01' },
];

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <h1>Synthetic Web Testing Platform</h1>
      <p>
        Launch controlled synthetic browser sessions for authorized testing across your web product.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', margin: '2rem 0' }}>
        <StatCard label="Workers" value="12" />
        <StatCard label="Queued" value="3" />
        <StatCard label="Running" value="2" />
        <StatCard label="Success Rate" value="98.4%" />
      </div>

      <section>
        <h2>Latest Jobs</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.75rem' }}>Job</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.75rem' }}>Worker</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '0.75rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>{job.id}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>{job.worker}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                    backgroundColor: job.status === 'complete' ? '#d1fae5' : job.status === 'running' ? '#dbeafe' : '#fef3c7',
                    color: '#111827',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', background: '#f9fafb' }}>
      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
