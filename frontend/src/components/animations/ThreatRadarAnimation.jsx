import { motion } from 'framer-motion';

const points = [
  { x: '24%', y: '36%', delay: 0.2 },
  { x: '67%', y: '22%', delay: 0.8 },
  { x: '72%', y: '63%', delay: 1.2 },
  { x: '33%', y: '74%', delay: 1.7 },
  { x: '51%', y: '49%', delay: 0.4 }
];

export default function ThreatRadarAnimation() {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-cyber-border/60 bg-slate-900/40">
      <div className="absolute inset-4 rounded-full border border-emerald-500/25" />
      <div className="absolute inset-10 rounded-full border border-emerald-500/20" />
      <div className="absolute inset-16 rounded-full border border-emerald-500/20" />
      <div className="absolute inset-1/2 h-px -translate-x-1/2 bg-emerald-500/20" style={{ width: '88%' }} />
      <div className="absolute left-1/2 top-3 h-[88%] w-px -translate-x-1/2 bg-emerald-500/20" />

      <motion.div
        className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(16,185,129,0.35) 0deg, rgba(16,185,129,0.1) 28deg, rgba(16,185,129,0) 52deg, rgba(16,185,129,0) 360deg)'
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'linear' }}
      />

      {points.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute h-2.5 w-2.5 rounded-full bg-emerald-300"
          style={{ left: p.x, top: p.y, boxShadow: '0 0 14px rgba(52,211,153,0.9)' }}
          animate={{ opacity: [0.25, 1, 0.25], scale: [1, 1.7, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="absolute bottom-4 left-4 rounded-full border border-cyber-border bg-slate-950/70 px-3 py-1 text-xs text-emerald-300">
        Threat Radar Scanning
      </div>
    </div>
  );
}
