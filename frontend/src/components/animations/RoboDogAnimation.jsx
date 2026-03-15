import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import robodogSit from '../../assets/robodog-sit.png';
import robodogStand from '../../assets/robodog-stand.png';
import robodogWalk from '../../assets/robodog-walk.png';

export default function RoboDogAnimation({ compact = false }) {
  const wrapperSize = compact ? 'h-52 max-w-xs' : 'h-64 max-w-sm';
  const [frameIndex, setFrameIndex] = useState(0);

  const frames = useMemo(() => [robodogSit, robodogStand, robodogWalk, robodogStand], []);

  useEffect(() => {
    const t = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 1500);
    return () => clearInterval(t);
  }, [frames.length]);

  return (
    <div className={`relative mx-auto flex w-full ${wrapperSize} items-center justify-center overflow-hidden rounded-2xl border border-cyber-border/60 bg-slate-900/40`}>
      <motion.div
        className="absolute h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl"
        animate={{ scale: [1, 1.22, 1], opacity: [0.3, 0.68, 0.3] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 80%, rgba(34,197,94,0.2) 0%, rgba(15,23,42,0) 55%)'
        }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <AnimatePresence mode="wait">
        <motion.img
          key={frameIndex}
          src={frames[frameIndex]}
          alt="RoboDog security sentinel"
          className="relative z-10 h-[92%] w-auto object-contain"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
          exit={{ opacity: 0, scale: 1.02, y: -4 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          draggable={false}
        />
      </AnimatePresence>

      <motion.div
        className="absolute bottom-4 rounded-full border border-cyber-border bg-slate-950/70 px-3 py-1 text-xs text-emerald-300"
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        RoboDog Sentinel Tracking
      </motion.div>
    </div>
  );
}
