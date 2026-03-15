import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Ban, Radar, ShieldAlert, ShieldCheck, Siren, TimerReset } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const EVENT_POOL = [
  { type: 'brute_force_login', label: 'Brute Force Login', severity: 'high', color: 'text-red-300' },
  { type: 'suspicious_ip_activity', label: 'Suspicious IP Activity', severity: 'medium', color: 'text-amber-300' },
  { type: 'malicious_message_injection', label: 'Malicious Message Injection', severity: 'critical', color: 'text-rose-300' }
];

const INITIAL_EVENTS = [
  { id: 'seed-1', type: 'suspicious_ip_activity', label: 'Suspicious IP Activity', severity: 'medium', blocked: true, ip: '198.51.100.24', at: new Date().toISOString() }
];

function randomIp() {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

export default function AttackSimulation() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [running, setRunning] = useState(false);

  const chartData = useMemo(() => {
    const grouped = events.reduce((acc, evt) => {
      const hour = new Date(evt.at).getHours().toString().padStart(2, '0');
      if (!acc[hour]) acc[hour] = { h: `${hour}:00`, attacks: 0, blocked: 0 };
      acc[hour].attacks += 1;
      if (evt.blocked) acc[hour].blocked += 1;
      return acc;
    }, {});

    return Object.values(grouped).slice(-10);
  }, [events]);

  const triggerAttack = () => {
    const pattern = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
    const blocked = Math.random() > 0.18;
    const next = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...pattern,
      blocked,
      ip: randomIp(),
      at: new Date().toISOString()
    };

    setEvents((prev) => [next, ...prev].slice(0, 60));
  };

  const startSimulation = () => {
    if (running) return;
    setRunning(true);
    const iterations = 10;
    for (let i = 0; i < iterations; i += 1) {
      setTimeout(() => {
        triggerAttack();
        if (i === iterations - 1) setRunning(false);
      }, i * 700);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <section className="panel xl:col-span-2 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Live Attack Simulation</h2>
            <p className="text-xs text-cyber-muted">Synthetic adversarial traffic to validate automated cyber defense response.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-300">
            <Siren size={12} /> threat emulation lab
          </div>
        </div>

        <div className="mb-4 h-64 rounded-xl border border-cyber-border/70 bg-slate-950/45 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="attackFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="blockedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="h" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Area dataKey="attacks" type="monotone" stroke="#ef4444" fill="url(#attackFill)" />
              <Area dataKey="blocked" type="monotone" stroke="#22c55e" fill="url(#blockedFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={triggerAttack} className="btn-primary inline-flex items-center gap-2">
            <ShieldAlert size={14} /> Trigger Attack
          </button>
          <button onClick={startSimulation} disabled={running} className="btn-secondary inline-flex items-center gap-2 disabled:opacity-60">
            <Radar size={14} /> {running ? 'Simulation Running...' : 'Run Full Simulation'}
          </button>
          <button onClick={() => setEvents([])} className="btn-secondary inline-flex items-center gap-2">
            <TimerReset size={14} /> Reset Timeline
          </button>
        </div>
      </section>

      <section className="panel p-5">
        <h3 className="mb-3 font-display text-sm font-semibold">Threat Alert Timeline</h3>
        <div className="max-h-[29rem] space-y-2 overflow-y-auto pr-1">
          {events.map((evt, idx) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.015 }}
              className="glass rounded-xl p-3"
            >
              <p className={`text-sm font-medium ${evt.color}`}>{evt.label}</p>
              <p className="mt-1 text-[11px] text-cyber-muted">{evt.ip} | {new Date(evt.at).toLocaleTimeString()}</p>
              <div className="mt-2 inline-flex items-center gap-1 text-[11px]">
                {evt.blocked ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300"><ShieldCheck size={11} /> Auto blocked</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-red-300"><Ban size={11} /> Pending containment</span>
                )}
              </div>
            </motion.div>
          ))}
          {!events.length && <p className="text-sm text-cyber-muted">No simulated threats yet.</p>}
        </div>
      </section>
    </div>
  );
}
