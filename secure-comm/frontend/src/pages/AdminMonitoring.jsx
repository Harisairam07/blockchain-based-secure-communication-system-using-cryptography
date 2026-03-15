export default function AdminMonitoring() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="panel p-4"><h3 className="mb-2 font-semibold">Attack Attempts</h3><p className="text-sm text-slate-400">Brute-force and suspicious IP telemetry.</p></div>
      <div className="panel p-4"><h3 className="mb-2 font-semibold">Blockchain Logs</h3><p className="text-sm text-slate-400">Proof records and verification traces.</p></div>
    </div>
  );
}
