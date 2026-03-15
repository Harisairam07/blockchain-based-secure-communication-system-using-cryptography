import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function DataPacket({ targetX = 0, y = 0.28, active = false }) {
  const ref = useRef();
  const trailRef = useRef();

  useFrame((state, delta) => {
    if (!ref.current) return;

    ref.current.position.x += (targetX - ref.current.position.x) * Math.min(1, delta * 5.5);
    ref.current.position.y = y + Math.sin(state.clock.elapsedTime * 3.3) * 0.05;
    ref.current.rotation.x += 0.9 * delta;
    ref.current.rotation.y += 1.1 * delta;

    if (trailRef.current) {
      trailRef.current.position.x = ref.current.position.x - 0.15;
      trailRef.current.position.y = ref.current.position.y;
      trailRef.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 8) * 0.08);
    }
  });

  return (
    <group>
      <mesh ref={ref} position={[targetX, y, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        <meshStandardMaterial color={active ? '#22c55e' : '#34d399'} emissive={active ? '#10b981' : '#0b3b2e'} emissiveIntensity={active ? 1.8 : 0.6} metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh ref={trailRef} position={[targetX - 0.15, y, -0.02]}>
        <sphereGeometry args={[0.1, 14, 14]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.85} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
