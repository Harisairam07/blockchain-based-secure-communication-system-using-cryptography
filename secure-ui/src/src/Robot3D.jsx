import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function CyberDog({ shield }) {
  const meshRef = useRef();
  const shieldRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }

    if (shieldRef.current && shield) {
      shieldRef.current.rotation.y += 0.02;
      shieldRef.current.rotation.x += 0.01;
    }
  });

  return (
    <group>
      {/* Main Robot Body */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[2, 1, 1]} />
        <meshStandardMaterial
          color="#111111"
          metalness={1}
          roughness={0.2}
          emissive="#00ffff"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Head */}
      <mesh position={[1.5, 0.5, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.6]} />
        <meshStandardMaterial
          color="#222"
          metalness={1}
          emissive="#00ffff"
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* Cyber Shield */}
      {shield && (
        <mesh ref={shieldRef}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshStandardMaterial
            color="#00ffff"
            transparent
            opacity={0.15}
            emissive="#00ffff"
            emissiveIntensity={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

export default function Robot3D({ shield }) {
  return (
    <div className="w-full h-[500px]">
      <Canvas shadows camera={{ position: [5, 3, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
        />
        <Environment preset="city" />
        <CyberDog shield={shield} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}