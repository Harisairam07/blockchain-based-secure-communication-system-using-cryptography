import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1.5 text-xs text-cyber-muted">
      <span>typing</span>
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-cyber-accent"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.12 }}
        />
      ))}
    </div>
  );
}
