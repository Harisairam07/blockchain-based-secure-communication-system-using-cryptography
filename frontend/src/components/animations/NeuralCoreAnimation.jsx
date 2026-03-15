import { motion } from 'framer-motion';

export default function NeuralCoreAnimation({ compact = false }) {
  const sizeClass = compact ? 'h-44 w-44' : 'h-56 w-56';

  return (
    <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-cyber-border/60 bg-slate-900/40 py-6">
      <motion.div
        className="absolute h-80 w-80 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(34,197,94,0.14) 0%, rgba(16,185,129,0.08) 35%, rgba(15,23,42,0) 72%)'
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className={`relative ${sizeClass}`}>
        <motion.div
          className="absolute inset-0 rounded-full border border-emerald-400/45"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          className="absolute inset-3 rounded-full border border-emerald-300/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          className="absolute inset-8 rounded-full border border-emerald-200/20"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute inset-12 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 35% 30%, rgba(167,243,208,0.9) 0%, rgba(16,185,129,0.95) 36%, rgba(6,78,59,0.95) 100%)',
            boxShadow: '0 0 28px rgba(34,197,94,0.45), inset 0 0 32px rgba(167,243,208,0.35)'
          }}
          animate={{ boxShadow: ['0 0 20px rgba(34,197,94,0.3), inset 0 0 22px rgba(167,243,208,0.2)', '0 0 42px rgba(34,197,94,0.65), inset 0 0 35px rgba(167,243,208,0.4)', '0 0 20px rgba(34,197,94,0.3), inset 0 0 22px rgba(167,243,208,0.2)'] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100"
          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="absolute bottom-4 rounded-full border border-cyber-border bg-slate-950/70 px-3 py-1 text-xs text-emerald-300">
        Neural Core Active
      </div>
    </div>
  );
}
