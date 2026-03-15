import { motion } from 'framer-motion';

export default function EncryptionStatus({ encrypted = true, label = 'End-to-End Encrypted', compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
        encrypted
          ? 'border-cyber-accent/40 bg-cyber-accent/10 text-green-300'
          : 'border-amber-400/40 bg-amber-400/10 text-amber-300'
      } ${compact ? '' : 'font-medium'}`}
    >
      <span className={`h-2 w-2 rounded-full ${encrypted ? 'bg-cyber-accent' : 'bg-amber-300'}`} />
      {label}
    </motion.div>
  );
}
