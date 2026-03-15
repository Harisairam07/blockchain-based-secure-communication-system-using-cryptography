import { motion } from 'framer-motion';

export default function NeonPulseCard({ title, value, sub, icon: Icon }) {
  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="panel neon-border p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-emerald-500/15 p-2 text-cyber-accent">
          <Icon size={17} />
        </div>
        <span className="text-xs text-cyber-muted">live</span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-cyber-muted">{title}</p>
      {sub && <p className="mt-3 text-xs text-emerald-300">{sub}</p>}
    </motion.article>
  );
}
