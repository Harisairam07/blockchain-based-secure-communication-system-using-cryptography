import { ShieldCheck } from 'lucide-react';

export default function MessageBubble({ message }) {
  const own = message.sender === 'me';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
          own
            ? 'bg-cyber-accent/20 text-green-100 ring-1 ring-cyber-accent/30'
            : 'bg-slate-800/70 text-slate-100 ring-1 ring-cyber-border'
        }`}
      >
        <p className="mb-2 text-sm leading-relaxed">{message.text}</p>
        <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="inline-flex items-center gap-1">
            <ShieldCheck size={12} className="text-cyber-accent" />
            {message.encrypted ? 'Encrypted' : 'Unencrypted'}
          </div>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}
