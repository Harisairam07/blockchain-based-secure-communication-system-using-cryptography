import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Volume2 } from 'lucide-react';

const briefings = [
  'Good to see you. Neural Core is online and monitoring the secure channel.',
  'Encryption, identity, and ledger signals are stable. I will alert you if anything drifts.',
  'Standing by. Ask for status, threats, blockchain, login, or messages.'
];

function answerFor(input) {
  const text = input.toLowerCase();

  if (text.includes('status') || text.includes('system')) {
    return 'All primary systems are operational. The dashboard is in demo-safe mode unless a hosted backend URL is configured.';
  }

  if (text.includes('login') || text.includes('credential') || text.includes('password')) {
    return 'Demo access is ready. Use admin@gmail.com with password admin on laptop or phone.';
  }

  if (text.includes('message') || text.includes('chat')) {
    return 'Secure chat simulation is ready. Live cross-device messaging will activate after the backend is deployed and connected.';
  }

  if (text.includes('block') || text.includes('ledger') || text.includes('chain')) {
    return 'Blockchain verification is simulated on GitHub Pages. Real ledger writes require the hosted API and contract configuration.';
  }

  if (text.includes('threat') || text.includes('attack') || text.includes('security')) {
    return 'Threat posture is calm. I am watching authentication, rate limits, and unusual message patterns.';
  }

  if (text.includes('help') || text.includes('what can')) {
    return 'I can brief status, login, messaging, blockchain verification, and security posture.';
  }

  return 'Understood. I will keep the secure communication stack steady and report anything that needs your attention.';
}

export default function NeuralCoreAnimation({ compact = false }) {
  const sizeClass = compact ? 'h-44 w-44' : 'h-56 w-56';
  const [conversation, setConversation] = useState([
    { role: 'core', text: compact ? briefings[2] : briefings[0] }
  ]);
  const [prompt, setPrompt] = useState('');

  const latestCoreLine = useMemo(
    () => [...conversation].reverse().find((item) => item.role === 'core')?.text || briefings[0],
    [conversation]
  );

  const submit = (event) => {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    setConversation((items) => [
      ...items.slice(-3),
      { role: 'user', text: cleanPrompt },
      { role: 'core', text: answerFor(cleanPrompt) }
    ]);
    setPrompt('');
  };

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(latestCoreLine);
    utterance.rate = 0.92;
    utterance.pitch = 0.82;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-cyber-border/60 bg-slate-900/40">
      <div className="relative flex w-full items-center justify-center overflow-hidden py-6">
        <motion.div
          className="absolute h-80 w-80 rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(34,197,94,0.14) 0%, rgba(16,185,129,0.08) 35%, rgba(15,23,42,0) 72%)'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className={`relative ${sizeClass}`}>
          <motion.div
            className="absolute inset-0 rounded-full border border-emerald-400/45"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          />

          <motion.div
            className="absolute inset-3 rounded-full border border-emerald-300/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />

          <motion.div
            className="absolute inset-8 rounded-full border border-emerald-200/20"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute inset-12 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 35% 30%, rgba(167,243,208,0.9) 0%, rgba(16,185,129,0.95) 36%, rgba(6,78,59,0.95) 100%)',
              boxShadow: '0 0 28px rgba(34,197,94,0.45), inset 0 0 32px rgba(167,243,208,0.35)'
            }}
            animate={{ boxShadow: ['0 0 20px rgba(34,197,94,0.3), inset 0 0 22px rgba(167,243,208,0.2)', '0 0 42px rgba(34,197,94,0.65), inset 0 0 35px rgba(167,243,208,0.4)', '0 0 20px rgba(34,197,94,0.3), inset 0 0 22px rgba(167,243,208,0.2)'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100"
            animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="absolute bottom-4 rounded-full border border-cyber-border bg-slate-950/70 px-3 py-1 text-xs text-emerald-300">
          Neural Core Listening
        </div>
      </div>

      <div className="border-t border-cyber-border/70 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-300">
            <Bot size={14} /> Neural Core Assistant
          </div>
          <button type="button" onClick={speak} className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-xs">
            <Volume2 size={13} /> Voice Brief
          </button>
        </div>

        <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
          {conversation.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${item.role === 'core' ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-50' : 'border-cyber-border bg-slate-950/45 text-slate-200'}`}>
              <span className="mb-1 block font-semibold text-emerald-300">{item.role === 'core' ? 'Core' : 'You'}</span>
              {item.text}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="mt-3 flex gap-2">
          <input
            className="input h-10 rounded-lg px-3 py-2"
            placeholder="Ask status, threats, blockchain..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
          />
          <button className="btn-primary inline-flex h-10 items-center gap-2 rounded-lg px-3 py-2" type="submit">
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
