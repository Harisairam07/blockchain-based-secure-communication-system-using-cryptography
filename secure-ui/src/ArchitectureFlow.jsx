import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import RobotAI from "./RobotAI";

const steps = [
  { title: "User Interface 🧑‍💻", desc: "Secure input validation.", mode: "sit" },
  { title: "AES Encryption 🔐", desc: "AES-256-GCM encryption.", mode: "stand" },
  { title: "SHA-256 Hash 🧠", desc: "Integrity verification.", mode: "walk" },
  { title: "RSA Signature ✍️", desc: "Authenticity assurance.", mode: "stand" },
  { title: "Blockchain ⛓️", desc: "Immutable record storage.", mode: "walk" },
  { title: "MongoDB Storage 🗄️", desc: "Encrypted off-chain storage.", mode: "stand" },
];

export default function ArchitectureFlow() {

  const containerRef = useRef(null);
  const intervalRef = useRef(null);

  const [active, setActive] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2500);

  useEffect(() => {
    containerRef.current?.scrollTo({
      left: active * 600,
      behavior: "smooth",
    });
  }, [active]);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const start = () => {
    if (intervalRef.current) return;

    setIsPlaying(true);

    intervalRef.current = setInterval(() => {
      setActive(prev => {
        if (prev < steps.length - 1) return prev + 1;
        stop();
        return prev;
      });
    }, speed);
  };

  const stop = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const next = () => setActive(p => Math.min(p + 1, steps.length - 1));
  const back = () => setActive(p => Math.max(p - 1, 0));
  const restart = () => {
    stop();
    setActive(0);
  };

  return (
    <div className="w-full h-screen bg-black text-white relative overflow-hidden">

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-950 to-black" />

      <h2 className="text-5xl text-center pt-10 text-cyan-400 font-bold relative z-20">
        Secure AI Command Center
      </h2>

      {/* Control Panel */}
      <div className="flex justify-center gap-6 mt-10 relative z-20">
        {[{icon:"▶",fn:start},{icon:"⏸",fn:stop},{icon:"⏮",fn:back},{icon:"⏭",fn:next},{icon:"🔁",fn:restart}]
        .map((btn,i)=>(
          <motion.button
            key={i}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={btn.fn}
            className="text-3xl px-6 py-4 rounded-2xl border border-cyan-400 text-cyan-400 bg-black/60 hover:bg-cyan-400 hover:text-black transition-all"
          >
            {btn.icon}
          </motion.button>
        ))}

        <select
          value={speed}
          onChange={e=>setSpeed(Number(e.target.value))}
          className="text-lg px-4 py-3 rounded-xl bg-black border border-cyan-400 text-cyan-300"
        >
          <option value={2500}>1x</option>
          <option value={1500}>2x</option>
          <option value={800}>3x</option>
        </select>
      </div>

      {/* Cards */}
      <div
        ref={containerRef}
        className="flex items-center h-[60%] space-x-40 px-40 overflow-x-auto mt-20 relative z-10"
      >
        {steps.map((step,index)=>(
          <motion.div
            key={index}
            animate={{
              scale: active===index?1.1:1,
              opacity: active>=index?1:0.3
            }}
            transition={{ duration: 0.4 }}
            className="min-w-[500px] h-[280px] p-8 rounded-2xl border border-cyan-400 bg-black/70 backdrop-blur-md"
          >
            <h3 className="text-xl text-cyan-300 mb-4">{step.title}</h3>
            <p className="text-gray-300">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* FLOATING DOG */}
      <RobotAI
        mode={steps[active].mode}
        isPlaying={isPlaying}
        activeIndex={active}
      />

    </div>
  );
}