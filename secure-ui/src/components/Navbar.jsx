import { Bell, Menu, ShieldCheck } from 'lucide-react';

export default function Navbar({ title, onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-cyber-border/80 bg-cyber-bg/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg border border-cyber-border p-2 text-slate-200 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div>
            <p className="font-display text-base font-semibold text-white sm:text-lg">{title}</p>
            <p className="text-xs text-slate-400">Realtime monitoring enabled</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-cyber-border p-2 text-slate-300 transition hover:border-cyber-accent/60">
            <Bell size={18} />
          </button>
          <div className="hidden items-center gap-2 rounded-lg border border-cyber-border bg-slate-900/60 px-3 py-2 sm:flex">
            <ShieldCheck className="text-cyber-accent" size={16} />
            <span className="text-xs text-slate-300">Zero-Trust Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
}
