import { Bell, Menu, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-20 border-b border-cyber-border/70 bg-cyber-bg/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenu} className="rounded-lg border border-cyber-border p-2 lg:hidden">
            <Menu size={16} />
          </button>
          <div>
            <p className="font-display text-base font-semibold sm:text-lg">Secure Cryptography Operations Center</p>
            <p className="text-xs text-cyber-muted">Zero-trust transmission with blockchain attestations</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.95 }} className="rounded-lg border border-cyber-border p-2 text-cyber-muted hover:text-cyber-accent">
            <Bell size={16} />
          </motion.button>
          <div className="hidden items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 sm:flex">
            <ShieldCheck size={14} /> Security posture healthy
          </div>
        </div>
      </div>
    </header>
  );
}
