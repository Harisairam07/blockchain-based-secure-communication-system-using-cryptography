import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Binary, Blocks, KeyRound, Lock, ShieldCheck, Shuffle } from 'lucide-react';
import ScrambleText from '../animations/ScrambleText';

const STAGES = [
  { key: 'encrypt', label: 'AES-256 Encrypting Message', icon: Lock },
  { key: 'hash', label: 'Generating SHA-256 Integrity Hash', icon: Binary },
  { key: 'signature', label: 'Digital Signature Created', icon: KeyRound },
  { key: 'blockchain', label: 'Recording Proof on Blockchain Ledger', icon: Blocks },
  { key: 'decrypt', label: 'AES Decrypting Message', icon: Shuffle }
];

export default function CryptoPipelineVisualizer({ trigger, sourceText, decryptedText, onDone }) {
  const [activeStage, setActiveStage] = useState(-1);

  const encryptedSample = useMemo(() => {
    const chars = '0123456789ABCDEF';
    return Array.from({ length: Math.max(sourceText.length * 2, 22) }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }, [sourceText]);

  const hashSample = useMemo(() => {
    const chars = '0123456789abcdef';
    return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }, [trigger]);

  useEffect(() => {
    if (!trigger) {
      setActiveStage(-1);
      return;
    }

    setActiveStage(0);
    const timers = STAGES.map((_, idx) =>
      setTimeout(() => {
        setActiveStage(idx);
        if (idx === STAGES.length - 1 && onDone) {
          setTimeout(onDone, 900);
        }
      }, idx * 1000)
    );

    return () => timers.forEach(clearTimeout);
  }, [trigger, onDone]);

  return (
    <div className="panel p-4">
      <h3 className="mb-4 font-display text-sm font-semibold">Cryptography Pipeline</h3>
      <div className="space-y-2">
        {STAGES.map((stage, index) => {
          const Icon = stage.icon;
          const active = index <= activeStage;
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0.4, x: -8 }}
              animate={{ opacity: active ? 1 : 0.35, x: 0 }}
              className={`glass rounded-xl p-3 ${active ? 'neon-border' : ''}`}
            >
              <div className="flex items-center gap-2 text-xs">
                <Icon size={14} className={active ? 'text-cyber-accent' : 'text-slate-500'} />
                <span>{stage.label}</span>
              </div>
              {active && stage.key === 'encrypt' && (
                <p className="mt-2 font-mono text-xs text-emerald-300">
                  <ScrambleText text={encryptedSample} active={activeStage === index} />
                </p>
              )}
              {active && stage.key === 'hash' && (
                <>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-700">
                    <motion.div className="h-1.5 rounded-full bg-cyber-accent" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} />
                  </div>
                  <p className="mt-2 font-mono text-xs text-emerald-300">
                    <ScrambleText text={hashSample} active={activeStage === index} />
                  </p>
                </>
              )}
              {active && stage.key === 'signature' && (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mt-2 inline-flex items-center gap-1 rounded-full bg-cyber-accent/20 px-2 py-1 text-[11px] text-cyber-accent">
                  <ShieldCheck size={12} /> ? signature seal
                </motion.div>
              )}
              {active && stage.key === 'blockchain' && (
                <div className="mt-2 flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-4 w-6 rounded bg-emerald-500/25"
                      initial={{ y: -3, opacity: 0.4 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.12 }}
                    />
                  ))}
                </div>
              )}
              {active && stage.key === 'decrypt' && (
                <p className="mt-2 text-xs text-slate-200">
                  <ScrambleText text={decryptedText || sourceText} active={activeStage === index} />
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
