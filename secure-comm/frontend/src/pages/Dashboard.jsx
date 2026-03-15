export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Security Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-4"><p className="text-sm text-slate-400">Encrypted Sessions</p><p className="text-2xl">128</p></div>
        <div className="panel p-4"><p className="text-sm text-slate-400">Blockchain Verifications</p><p className="text-2xl">94%</p></div>
        <div className="panel p-4"><p className="text-sm text-slate-400">Threat Events</p><p className="text-2xl">12</p></div>
      </div>
    </div>
  );
}
