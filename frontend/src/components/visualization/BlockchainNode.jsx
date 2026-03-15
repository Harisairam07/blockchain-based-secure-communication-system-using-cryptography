import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function BlockchainNode({ x, active }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    if (active) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3.2) * 0.02;
    } else {
      groupRef.current.position.y = 0;
    }
  });

  return (
    <group ref={groupRef} position={[x, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[i * 0.18 - 0.18, 0, i * 0.03]}>
          <boxGeometry args={[0.14, 0.14, 0.14]} />
          <meshStandardMaterial color={active ? '#22c55e' : '#334155'} emissive={active ? '#10b981' : '#0f172a'} emissiveIntensity={active ? 1.15 : 0.2} />
        </mesh>
      ))}
      <Text position={[0, -0.36, 0]} fontSize={0.1} color={active ? '#86efac' : '#94a3b8'} anchorX="center" maxWidth={1.2}>
        Blockchain Verify
      </Text>
    </group>
  );
}
