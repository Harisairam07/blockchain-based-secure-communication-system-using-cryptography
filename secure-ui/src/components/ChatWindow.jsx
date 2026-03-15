import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="panel h-[58vh] space-y-3 overflow-y-auto p-4 sm:h-[64vh]"
    >
      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center text-center text-sm text-slate-400">
          No messages yet. Start a secure conversation.
        </div>
      )}

      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03 }}
        >
          <MessageBubble message={message} />
        </motion.div>
      ))}
    </div>
  );
}
