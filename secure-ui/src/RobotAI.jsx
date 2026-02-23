import { motion } from "framer-motion";

import dogSit from "./assets/robodog-sit.png";
import dogStand from "./assets/robodog-stand.png";
import dogWalk from "./assets/robodog-walk.png";

export default function RobotAI({ mode = "stand", isPlaying, activeIndex }) {

  const dogModes = {
    sit: dogSit,
    stand: dogStand,
    walk: dogWalk,
  };

  const isWalking = mode === "walk" && isPlaying;

  return (
    <motion.div
      className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center"
      animate={{
        x: activeIndex * 200 - 400 // cinematic horizontal tracking
      }}
      transition={{ type: "spring", stiffness: 60, damping: 15 }}
    >

      {/* Ground Light */}
      <div className="absolute bottom-3 w-56 h-6 bg-cyan-400 blur-2xl rounded-full opacity-25" />

      <motion.img
        src={dogModes[mode]}
        alt="AI Robotic Dog"
        animate={{
          y: isWalking ? [0, -8, 0] : 0
        }}
        transition={{
          duration: 0.6,
          repeat: isWalking ? Infinity : 0,
          ease: "easeInOut"
        }}
        className="w-64 drop-shadow-[0_0_70px_#00ffff]"
      />

      <div className="mt-4 text-cyan-400 text-sm tracking-widest">
        MODE: {mode.toUpperCase()}
      </div>
    </motion.div>
  );
}