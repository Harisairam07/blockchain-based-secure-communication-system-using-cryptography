import { Link, useLocation } from 'react-router-dom';
import { Blocks, FileArchive, FileLock2, LayoutDashboard, MessageSquareLock, Radar, Settings, ShieldAlert, ShieldCheck, UserCog } from 'lucide-react';
import { motion } from 'framer-motion';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/secure-chat', label: 'Secure Chat', icon: MessageSquareLock },
  { to: '/file-transfer', label: 'File Transfer', icon: FileArchive },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/admin', label: 'Admin Panel', icon: UserCog },
  { to: '/blockchain-monitor', label: 'Blockchain Monitor', icon: Blocks },
  { to: '/security-logs', label: 'Security Logs', icon: FileLock2 },
  { to: '/attack-simulation', label: 'Attack Simulation', icon: Radar }
];

export default function Sidebar({ open, setOpen }) {
  const { pathname } = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-label="Close" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-cyber-border bg-cyber-panel/90 p-4 backdrop-blur-xl transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 rounded-xl border border-cyber-border bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-cyber-muted">Control Node</p>
          <p className="mt-1 font-display text-sm font-semibold">Secure Comm Alpha</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-cyber-accent">
            <ShieldCheck size={12} /> end-to-end telemetry online
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                <motion.div
                  whileHover={{ x: 4, scale: 1.01 }}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                    active
                      ? 'bg-gradient-to-r from-cyber-accent/25 to-emerald-500/15 text-cyber-accent neon-border'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-emerald-200'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs text-red-300">
          <div className="mb-1 flex items-center gap-2"><ShieldAlert size={12} /> Threat sentinel</div>
          Suspicious activity is continuously monitored.
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 w-full rounded-xl border border-cyber-border bg-slate-900/60 px-3 py-2 text-sm text-slate-200 transition hover:border-cyber-accent hover:text-cyber-accent"
        >
          Logout
        </button>
      </aside>
    </>
  );
}
