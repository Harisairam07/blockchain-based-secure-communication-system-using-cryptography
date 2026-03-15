import { Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BlockchainVerification({ txHash, status }) {
  return (
    <div className="panel p-4">
      <h3 className="mb-3 font-display text-sm font-semibold">Blockchain Verification</h3>
      <div className="mb-3 flex items-center gap-2 text-xs text-cyber-muted">
        <Link2 size={12} className="text-cyber-accent" /> transaction status
      </div>
      <div className="glass rounded-xl p-3 font-mono text-xs text-emerald-300">{txHash || 'waiting for tx hash...'}</div>
      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} className="mt-3 h-1 rounded-full bg-emerald-500/60" />
      <p className="mt-2 text-xs text-cyber-muted">{status || 'pending'}</p>
    </div>
  );
}
