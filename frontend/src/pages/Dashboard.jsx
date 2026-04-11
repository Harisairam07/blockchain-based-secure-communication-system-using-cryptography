import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Blocks, ShieldAlert, Users } from 'lucide-react';
import { io } from 'socket.io-client';
import { authApi, messageApi } from '../services/api';
import { isDemoMode, socketUrl } from '../services/runtimeConfig';
import NeonPulseCard from '../components/visualization/NeonPulseCard';
import RoboDogAnimation from '../components/animations/RoboDogAnimation';
import NeuralCoreAnimation from '../components/animations/NeuralCoreAnimation';
import ThreatRadarAnimation from '../components/animations/ThreatRadarAnimation';
import LiveMetricsPulseChart from '../components/visualization/LiveMetricsPulseChart';

const encryptionHealth = [
  { t: '00:00', value: 88 },
  { t: '04:00', value: 92 },
  { t: '08:00', value: 95 },
  { t: '12:00', value: 93 },
  { t: '16:00', value: 97 },
  { t: '20:00', value: 96 }
];

const securityEvents = [
  { d: 'Mon', threats: 4, verified: 34 },
  { d: 'Tue', threats: 3, verified: 41 },
  { d: 'Wed', threats: 8, verified: 44 },
  { d: 'Thu', threats: 2, verified: 39 },
  { d: 'Fri', threats: 5, verified: 47 },
  { d: 'Sat', threats: 3, verified: 52 }
];

const verificationRate = [
  { t: '00:00', rate: 93 },
  { t: '04:00', rate: 95 },
  { t: '08:00', rate: 98 },
  { t: '12:00', rate: 96 },
  { t: '16:00', rate: 99 },
  { t: '20:00', rate: 97 }
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    messages: 0,
    attacks: 0,
    verified: 0,
    activeUsers: 0,
    systemHealth: 'healthy',
    user: null
  });

  useEffect(() => {
    if (isDemoMode) {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      setStats((s) => ({
        ...s,
        user,
        messages: 12,
        verified: 12,
        attacks: 0,
        activeUsers: 1,
        systemHealth: 'demo'
      }));
      return;
    }

    const load = async () => {
      try {
        const [me, telemetry] = await Promise.all([authApi.me(), messageApi.stats()]);
        setStats((s) => ({
          ...s,
          user: me?.data?.user || null,
          messages: telemetry?.data?.encryptedSessions || 0,
          verified: telemetry?.data?.blockchainVerifications || 0,
          attacks: telemetry?.data?.threatEvents || 0,
          activeUsers: telemetry?.data?.activeUsers || 0,
          systemHealth: telemetry?.data?.systemHealth || 'healthy'
        }));
      } catch (error) {
        console.warn('Dashboard base stats unavailable:', error?.message || error);
        setStats((s) => ({ ...s, user: s.user || null, messages: 0, verified: 0 }));
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!socketUrl) return undefined;

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socket.on('metrics:update', (payload) => {
      setStats((prev) => ({
        ...prev,
        messages: payload?.encryptedSessions ?? prev.messages,
        verified: payload?.blockchainVerifications ?? prev.verified,
        attacks: payload?.threatEvents ?? prev.attacks,
        activeUsers: payload?.activeUsers ?? prev.activeUsers,
        systemHealth: payload?.systemHealth ?? prev.systemHealth
      }));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <NeonPulseCard title="Encrypted Sessions" value={stats.messages} sub="AES-256 channel active" icon={Activity} />
        <NeonPulseCard title="Blockchain Verifications" value={stats.verified} sub="Ledger proof sync" icon={Blocks} />
        <NeonPulseCard title="Threat Events" value={stats.attacks} sub="Anomaly watchlist" icon={ShieldAlert} />
        <NeonPulseCard title="Active Users" value={stats.activeUsers} sub={`System health: ${stats.systemHealth}`} icon={Users} />
        <article className="panel neon-border p-5">
          <p className="text-xs text-cyber-muted">Analyst</p>
          <p className="mt-2 text-lg font-semibold">{stats.user?.name || '-'}</p>
          <p className="text-xs text-cyber-muted">{stats.user?.email || ''}</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel p-5">
          <h3 className="mb-4 font-display text-sm font-semibold">Encryption Health</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={encryptionHealth}>
                <defs>
                  <linearGradient id="healthGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="t" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#healthGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel p-5">
          <h3 className="mb-4 font-display text-sm font-semibold">Verification vs Security Events</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={securityEvents}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="d" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="verified" stroke="#22c55e" strokeWidth={2.2} dot={false} />
                <Line type="monotone" dataKey="threats" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="panel p-5">
        <h3 className="mb-4 font-display text-sm font-semibold">Blockchain Verification Rate</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={verificationRate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="t" stroke="#94a3b8" />
              <YAxis domain={[85, 100]} stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2.4} dot={{ r: 2.5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <LiveMetricsPulseChart value={Number(stats.verified || 0)} />

      <section className="panel p-5">
        <h3 className="mb-4 font-display text-sm font-semibold">Security Companion</h3>
        <p className="mb-4 text-xs text-cyber-muted">Visual heartbeat for active secure-session monitoring.</p>
        <RoboDogAnimation />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel p-5">
          <h3 className="mb-3 font-display text-sm font-semibold">AI Neural Core</h3>
          <p className="mb-4 text-xs text-cyber-muted">Adaptive intelligence engine modeling live session behavior.</p>
          <NeuralCoreAnimation />
        </section>

        <section className="panel p-5">
          <h3 className="mb-3 font-display text-sm font-semibold">Autonomous Threat Radar</h3>
          <p className="mb-4 text-xs text-cyber-muted">Continuous anomaly scanning with weighted signal intensity.</p>
          <ThreatRadarAnimation />
        </section>
      </div>
    </div>
  );
}
