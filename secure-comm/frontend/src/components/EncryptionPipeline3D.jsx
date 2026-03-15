import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo, useState } from 'react';

const layers = ['Input', 'AES', 'SHA-256', 'Sign', 'Blockchain', 'Decrypt'];

function Packet({ x }) {
  return (
    <mesh position={[x, 0.2, 0]}>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshStandardMaterial color="#22c55e" emissive="#10b981" emissiveIntensity={1.2} />
    </mesh>
  );
}

export default function EncryptionPipeline3D() {
  const [stage, setStage] = useState(0);
  const x = useMemo(() => -2.5 + stage, [stage]);

  return (
    <div className="panel p-4">
      <div className="mb-2 flex gap-2">
        <button className="btn" onClick={() => { setStage(0); const i = setInterval(() => setStage((s) => { if (s >= 5) { clearInterval(i); return s; } return s + 1; }), 700); }}>Play</button>
        <button className="btn" onClick={() => setStage((s) => Math.min(5, s + 1))}>Step</button>
        <button className="btn" onClick={() => setStage(0)}>Replay</button>
      </div>
      <div className="h-64 rounded-xl bg-slate-900/60">
        <Canvas camera={{ position: [0, 1.2, 5] }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[0, 2, 2]} intensity={2} color="#10b981" />
          {layers.map((label, i) => (
            <mesh key={label} position={[-2.5 + i, 0, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.15, 20]} />
              <meshStandardMaterial color={i <= stage ? '#22c55e' : '#1e293b'} />
            </mesh>
          ))}
          <Packet x={x} />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
      <p className="mt-2 text-xs text-slate-300">Stage: {layers[stage]}</p>
    </div>
  );
}
