import { motion } from 'framer-motion';

export default function CyberDogAnimation() {
  return (
    <div className="relative mx-auto flex h-52 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border border-cyber-border/60 bg-slate-900/40">
      <motion.div
        className="absolute h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.svg
        width="220"
        height="170"
        viewBox="0 0 220 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <rect x="72" y="56" width="96" height="58" rx="22" fill="#94a3b8" />
        <rect x="44" y="50" width="56" height="52" rx="24" fill="#cbd5e1" />

        <path d="M52 42L63 22L74 46" fill="#94a3b8" />
        <path d="M71 45L83 24L93 49" fill="#94a3b8" />

        <circle cx="63" cy="69" r="5" fill="#0f172a" />
        <circle cx="82" cy="69" r="5" fill="#0f172a" />
        <ellipse cx="72" cy="82" rx="8" ry="6" fill="#334155" />

        <path d="M65 91C69 95 75 95 79 91" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

        <rect x="84" y="108" width="13" height="36" rx="6" fill="#94a3b8" />
        <rect x="111" y="108" width="13" height="36" rx="6" fill="#94a3b8" />
        <rect x="136" y="108" width="13" height="36" rx="6" fill="#94a3b8" />
        <rect x="156" y="108" width="13" height="36" rx="6" fill="#94a3b8" />

        <motion.path
          d="M166 72C192 70 195 102 168 104"
          stroke="#cbd5e1"
          strokeWidth="8"
          strokeLinecap="round"
          animate={{ rotate: [-18, 20, -18] }}
          transition={{ duration: 0.42, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: 0.82, originY: 0.53 }}
        />

        <rect x="44" y="44" width="56" height="8" rx="4" fill="#22c55e" opacity="0.85" />
      </motion.svg>

      <motion.div
        className="absolute bottom-4 rounded-full border border-cyber-border bg-slate-950/70 px-3 py-1 text-xs text-emerald-300"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        Cyber Guard Dog Online
      </motion.div>
    </div>
  );
}
