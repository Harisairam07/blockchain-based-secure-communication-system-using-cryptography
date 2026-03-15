import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Gauge, Lock, Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import DataPacket from './DataPacket';
import SecurityLayer from './SecurityLayer';
import BlockchainNode from './BlockchainNode';
import HashGenerator from './HashGenerator';

const LAYERS = [
  { key: 'input', label: 'Message Input Node', x: -2.5 },
  { key: 'aes', label: 'AES Encryption Module', x: -1.5 },
  { key: 'sha', label: 'SHA-256 Hash Generator', x: -0.5 },
  { key: 'sig', label: 'Digital Signature Validator', x: 0.5 },
  { key: 'chain', label: 'Blockchain Verification Node', x: 1.5 },
  { key: 'decrypt', label: 'Receiver Decryption Module', x: 2.5 }
];

function PipelineFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-950/60">
      <div className="rounded-xl border border-cyber-border bg-slate-900/70 px-4 py-3 text-center">
        <p className="text-sm font-medium text-emerald-300">3D Renderer Unavailable</p>
        <p className="mt-1 text-xs text-cyber-muted">Running secure pipeline in compatibility mode.</p>
      </div>
    </div>
  );
}

export default function EncryptionPipeline3D({ autoStart = 0 }) {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('normal');

  const packetX = useMemo(() => LAYERS[Math.min(stage, LAYERS.length - 1)].x, [stage]);
  const intervalMs = speed === 'slow' ? 1400 : speed === 'fast' ? 550 : 900;

  useEffect(() => {
    if (!autoStart) return;
    setStage(0);
    setPlaying(true);
  }, [autoStart]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setStage((prev) => {
        if (prev >= LAYERS.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [playing, intervalMs]);

  const step = () => setStage((s) => Math.min(s + 1, LAYERS.length - 1));
  const replay = () => {
    setStage(0);
    setPlaying(true);
  };

  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold">3D Encryption Pipeline</h3>
          <p className="text-xs text-cyber-muted">Message packet flowing through cryptographic layers</p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1 text-[11px] text-emerald-300">
          <Lock size={11} /> secure flow
        </div>
      </div>

      <div className="glass mb-3 h-60 overflow-hidden rounded-xl">
        <Canvas
          camera={{ position: [0, 1.1, 4.8], fov: 46 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          fallback={<PipelineFallback />}
        >
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={0.9} />
          <pointLight position={[0, 2, 3]} intensity={3} color="#10b981" />
          <pointLight position={[packetX, 0.6, 0.5]} intensity={2.2} color="#22c55e" />

          {LAYERS.map((layer, index) =>
            layer.key === 'sha' ? (
              <HashGenerator key={layer.key} x={layer.x} active={index <= stage} />
            ) : layer.key === 'chain' ? (
              <BlockchainNode key={layer.key} x={layer.x} active={index <= stage} />
            ) : (
              <SecurityLayer key={layer.key} x={layer.x} label={layer.label.replace(' Module', '').replace(' Node', '')} active={index <= stage} />
            )
          )}

          {LAYERS.slice(0, -1).map((layer, i) => {
            const activeLine = i < stage;
            return (
              <group key={`line-${layer.key}`}>
                <mesh position={[layer.x + 0.5, 0, 0]}>
                  <boxGeometry args={[0.5, 0.02, 0.02]} />
                  <meshStandardMaterial color={activeLine ? '#22c55e' : '#334155'} emissive={activeLine ? '#10b981' : '#0f172a'} emissiveIntensity={activeLine ? 0.9 : 0.1} />
                </mesh>
                {activeLine && (
                  <mesh position={[layer.x + 0.5, 0.04, 0]}>
                    <boxGeometry args={[0.14, 0.01, 0.01]} />
                    <meshStandardMaterial color="#86efac" emissive="#34d399" emissiveIntensity={1.2} />
                  </mesh>
                )}
              </group>
            );
          })}

          <DataPacket targetX={packetX} y={0.28} active={playing} />
          <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={1.9} minPolarAngle={1.2} />
          <EffectComposer>
            <Bloom luminanceThreshold={0.14} intensity={0.9} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="mb-2 grid grid-cols-3 gap-2">
        <button className="btn-primary inline-flex items-center justify-center gap-1" onClick={() => setPlaying((p) => !p)}>{playing ? <Pause size={13} /> : <Play size={13} />} {playing ? 'Pause' : 'Play'}</button>
        <button className="btn-secondary inline-flex items-center justify-center gap-1" onClick={step}><SkipForward size={13} /> Step</button>
        <button className="btn-secondary inline-flex items-center justify-center gap-1" onClick={replay}><RotateCcw size={13} /> Replay</button>
      </div>

      <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-2 text-[11px] text-cyber-muted">
        <Gauge size={12} className="text-cyber-accent" />
        <span>Speed:</span>
        {['slow', 'normal', 'fast'].map((s) => (
          <button
            key={s}
            className={`rounded-full px-2 py-0.5 transition ${speed === s ? 'bg-cyber-accent/20 text-cyber-accent' : 'bg-slate-800/80 text-slate-300'}`}
            onClick={() => setSpeed(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <motion.div key={stage} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} className="rounded-lg bg-slate-900/60 px-3 py-2 text-xs text-cyber-muted">
        Active Stage: <span className="text-cyber-accent">{LAYERS[stage].label}</span>
      </motion.div>
    </section>
  );
}
