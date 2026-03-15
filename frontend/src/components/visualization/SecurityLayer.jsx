import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function SecurityLayer({ x, label, active = false }) {
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.z += delta * 0.8;
    const pulse = active ? 1 + Math.sin(state.clock.elapsedTime * 5) * 0.12 : 1;
    ringRef.current.scale.set(pulse, pulse, 1);
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 30]} />
        <meshStandardMaterial color={active ? '#22c55e' : '#1e293b'} emissive={active ? '#10b981' : '#0f172a'} emissiveIntensity={active ? 1.35 : 0.2} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.31, 0.012, 8, 42]} />
        <meshStandardMaterial color={active ? '#34d399' : '#334155'} emissive={active ? '#10b981' : '#0f172a'} emissiveIntensity={active ? 0.9 : 0.1} />
      </mesh>
      <Text position={[0, -0.36, 0]} fontSize={0.1} color={active ? '#86efac' : '#94a3b8'} anchorX="center" maxWidth={1.2}>
        {label}
      </Text>
    </group>
  );
}
