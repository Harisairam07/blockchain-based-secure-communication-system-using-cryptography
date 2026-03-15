import { Link, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Files,
  LayoutDashboard,
  Lock,
  MessageSquareLock,
  Settings,
  Shield,
  UserRound
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/chat', label: 'Secure Chat', icon: MessageSquareLock },
  { to: '/files', label: 'File Transfer', icon: Files },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { pathname } = useLocation();

  return (
    <>
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-cyber-border bg-cyber-panel/95 p-4 backdrop-blur-xl transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-cyber-accent/15 p-2">
              <Shield className="text-cyber-accent" size={20} />
            </div>
            <div>
              <p className="font-display text-sm font-semibold">Secure Comm</p>
              <p className="text-xs text-slate-400">Blockchain Verified</p>
            </div>
          </div>
          <button
            className="rounded-lg border border-cyber-border p-1.5 text-slate-400 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const ActiveIcon = item.icon;
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-cyber-accent/15 text-cyber-accent shadow-glow'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <ActiveIcon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-cyber-border bg-slate-900/60 p-4">
          <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">Profile</p>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-cyber-accent/20 p-2 text-cyber-accent">
              <UserRound size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">Security Analyst</p>
              <p className="text-xs text-slate-400">analyst@securecomm.io</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-800/80 px-3 py-2 text-xs text-slate-300">
            <Lock size={14} className="text-cyber-accent" />
            Multi-factor session protected
          </div>
        </div>
      </aside>
    </>
  );
}
