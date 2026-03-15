import { CheckCheck, CircleDashed, Link2, ShieldAlert, ShieldCheck, Stamp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MessageBubble({ item, self }) {
  const preview = item.preview || '[Encrypted Payload]';
  const status = item.verificationStatus || (item.encrypted ? 'pending' : 'verified');

  return (
    <motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex ${self ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${self ? 'bg-emerald-500/20 border border-emerald-500/25' : 'bg-slate-800/75 border border-cyber-border'}`}>
        <p className="mb-2 text-sm leading-relaxed">{preview}</p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-cyber-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300"><ShieldCheck size={11} /> encrypted</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-300"><Link2 size={11} /> blockchain</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-300"><Stamp size={11} /> signed</span>

          {status === 'verified' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300"><CheckCheck size={11} /> integrity ok</span>
          ) : status === 'failed' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-red-300"><ShieldAlert size={11} /> integrity failed</span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/70 px-2 py-0.5 text-slate-300"><CircleDashed size={11} /> verifying</span>
          )}

          <span>{new Date(item.timestamp || item.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
