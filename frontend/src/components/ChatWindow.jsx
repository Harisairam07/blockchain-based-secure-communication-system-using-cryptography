import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareLock, ShieldCheck } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './animations/TypingIndicator';

export default function ChatWindow({ messages, currentUserId, typing }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages, typing]);

  return (
    <div ref={ref} className="panel h-[58vh] space-y-3 overflow-y-auto p-4">
      {messages.map((item) => (
        <MessageBubble key={item.id || item._id} item={item} self={item.sender === currentUserId || item.sender?._id === currentUserId} />
      ))}
      {typing && <TypingIndicator />}
      {!messages.length && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-10 max-w-md rounded-2xl border border-cyber-border bg-slate-900/55 p-5 text-center">
          <div className="mb-3 inline-flex rounded-xl bg-emerald-500/15 p-2 text-cyber-accent">
            <MessageSquareLock size={18} />
          </div>
          <p className="text-sm font-medium">No secure messages yet</p>
          <p className="mt-1 text-xs text-cyber-muted">Start a conversation to trigger AES encryption, SHA-256 hashing, digital signing, and blockchain attestation.</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">
            <ShieldCheck size={12} /> End-to-end cryptography pipeline ready
          </div>
        </motion.div>
      )}
    </div>
  );
}
