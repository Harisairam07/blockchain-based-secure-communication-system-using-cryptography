// src/BackgroundFX.jsx
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function BackgroundFX() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <div className="absolute inset-0 -z-10">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950 to-black opacity-80" />

      {/* Particle Matrix Effect */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: "#000000" },
          particles: {
            number: { value: 80 },
            color: { value: "#00ff88" },
            links: {
              enable: true,
              color: "#00ff88",
              distance: 150,
            },
            move: { enable: true, speed: 1 },
          },
        }}
        className="absolute inset-0"
      />
    </div>
  );
}
