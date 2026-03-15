export default function SecurityLogs() {
  return (
    <div className="panel p-4">
      <h2 className="mb-3 text-xl font-semibold">Security Logs</h2>
      <div className="space-y-2 text-sm">
        <div className="rounded-lg bg-slate-900/60 p-3">[INFO] AES pipeline healthy</div>
        <div className="rounded-lg bg-slate-900/60 p-3">[WARN] Suspicious login attempt from 103.21.x.x</div>
        <div className="rounded-lg bg-slate-900/60 p-3">[OK] Blockchain verification complete</div>
      </div>
    </div>
  );
}
