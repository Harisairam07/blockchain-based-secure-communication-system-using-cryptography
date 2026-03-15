import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';

function randomHex() {
  const chars = 'abcdef0123456789';
  return Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function HashGenerator({ x, active }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const [hash, setHash] = useState(randomHex());

  useEffect(() => {
    if (active) setHash(randomHex());
  }, [active]);

  useFrame((_, delta) => {
    if (!outerRef.current || !innerRef.current) return;
    if (active) {
      outerRef.current.rotation.y += delta * 2.4;
      innerRef.current.rotation.x += delta * 1.8;
    }
  });

  const label = useMemo(() => (active ? hash : 'SHA-256 Hash'), [active, hash]);

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={outerRef}>
        <torusGeometry args={[0.16, 0.04, 16, 48]} />
        <meshStandardMaterial color={active ? '#22c55e' : '#334155'} emissive={active ? '#10b981' : '#0f172a'} emissiveIntensity={active ? 1.2 : 0.2} />
      </mesh>
      <mesh ref={innerRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.018, 10, 36]} />
        <meshStandardMaterial color={active ? '#6ee7b7' : '#475569'} emissive={active ? '#34d399' : '#0f172a'} emissiveIntensity={active ? 0.8 : 0.1} />
      </mesh>
      <Text position={[0, -0.36, 0]} fontSize={0.08} color={active ? '#86efac' : '#94a3b8'} anchorX="center" maxWidth={1.45}>
        {label}
      </Text>
    </group>
  );
}
