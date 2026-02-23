import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import Confetti from "react-confetti";
import ArchitectureFlow from "./ArchitectureFlow";

export default function App() {
  const [message, setMessage] = useState("");
  const [stage, setStage] = useState(null);
  const [response, setResponse] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const stageOrder = ["encrypt", "hash", "sign", "blockchain"];

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsProcessing(true);
    setResponse(null);
    setShowConfetti(false);
    setShowArchitecture(false);

    // Animate stages one by one
    stageOrder.forEach((step, index) => {
      setTimeout(() => {
        setStage(step);
      }, index * 2500);
    });

    try {
      const res = await axios.post("http://localhost:3000/send", { message });

      setTimeout(() => {
        setStage("success");
        setResponse(res.data);
        setShowConfetti(true);
        playSuccessSound();

        // Show architecture after success animation
        setTimeout(() => {
          setShowArchitecture(true);
        }, 3000);

      }, stageOrder.length * 2500 + 1000);

    } catch (err) {
      alert("⚠ Backend not connected");
      setStage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const playSuccessSound = () => {
    const audio = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3"
    );
    audio.play();
  };

  const stages = {
    encrypt: {
      text: "🔐 Encrypting with AES",
      emoji: "🛡️⚡🔒",
      color: "text-yellow-400",
    },
    hash: {
      text: "🧠 Generating SHA-256 Hash",
      emoji: "💻🔢⚡",
      color: "text-blue-400",
    },
    sign: {
      text: "✍ Creating Digital Signature",
      emoji: "🔥📜✨",
      color: "text-pink-400",
    },
    blockchain: {
      text: "⛓ Writing to Blockchain",
      emoji: "🔗📦🚀",
      color: "text-green-400",
    },
    success: {
      text: "🚀 TRANSACTION SUCCESSFUL",
      emoji: "🎉💎⚡🔥",
      color: "text-emerald-400",
    },
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">

      {/* PARTICLE BACKGROUND */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: "#000000" },
          particles: {
            number: { value: 60 },
            color: { value: "#00ff88" },
            links: {
              enable: true,
              color: "#00ff88",
              distance: 140,
            },
            move: { enable: true, speed: 1 },
          },
        }}
        className="absolute inset-0"
      />

      {showConfetti && <Confetti />}

      {/* INPUT SCREEN */}
      {!stage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="z-10 bg-black/70 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-[450px] text-center border border-green-400"
        >
          <h1 className="text-3xl mb-6 font-bold text-green-400">
            🤖 AI Secure Command Center
          </h1>

          <input
            type="text"
            placeholder="Enter secure message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 rounded-lg text-black mb-6"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isProcessing}
            onClick={sendMessage}
            className="w-full bg-green-500 hover:bg-green-600 transition-all p-4 rounded-xl font-bold text-lg disabled:opacity-50"
          >
            {isProcessing ? "⚡ Processing..." : "🚀 Initiate Secure Transaction"}
          </motion.button>
        </motion.div>
      )}

      {/* PROCESS STAGES */}
      <AnimatePresence>
        {stage && !showArchitecture && (
          <motion.div
            key={stage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute w-[400px] h-[400px] border-4 border-green-400 rounded-full opacity-40"
            />

            <motion.h2
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              className={`text-5xl font-extrabold ${stages[stage].color}`}
            >
              {stages[stage].text}
            </motion.h2>

            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-7xl mt-6"
            >
              {stages[stage].emoji}
            </motion.div>

            <div className="mt-6 text-xl text-green-300 animate-pulse">
              🤖 AI Processing Secure Operation...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS DATA PANEL */}
      {response && stage === "success" && !showArchitecture && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-10 bg-black/90 p-6 rounded-xl w-3/4 max-w-3xl border border-green-400"
        >
          <p>🔐 <strong>Encrypted:</strong> {response.encryptedMessage}</p>
          <p>🧠 <strong>Hash:</strong> {response.hash}</p>
          <p>✍ <strong>Signature:</strong> {response.signature}</p>
        </motion.div>
      )}

      {/* ARCHITECTURE FLOW */}
      {showArchitecture && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black overflow-auto"
        >
          <ArchitectureFlow />
        </motion.div>
      )}

    </div>
  );
}