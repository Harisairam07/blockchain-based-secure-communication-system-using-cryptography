import { motion, AnimatePresence } from "framer-motion";

export default function ProcessingStage({ stage, response }) {

  const stages = {
    encrypt: {
      title: "Encrypting with AES",
      color: "text-yellow-400",
      icons: "🛡️ ⚡ 🔐",
    },
    hash: {
      title: "Generating SHA-256 Hash",
      color: "text-blue-400",
      icons: "🧠 💻 ⚡",
    },
    sign: {
      title: "Creating Digital Signature",
      color: "text-pink-400",
      icons: "✍️ 📜 ✨",
    },
    blockchain: {
      title: "Writing to Blockchain",
      color: "text-green-400",
      icons: "⛓️ 📦 🚀",
    },
    success: {
      title: "Transaction Successful",
      color: "text-emerald-400",
      icons: "🎉 💎 ⚡",
    }
  };

  if (!stage) return null;

  const current = stages[stage];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">

      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6 }}
          className="relative flex items-center justify-center"
        >

          {/* Outer Neon Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="absolute w-[520px] h-[520px] border-4 border-green-400 rounded-full opacity-30"
          />

          {/* Pulse Glow Ring */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute w-[480px] h-[480px] rounded-full bg-green-400/5 blur-2xl"
          />

          {/* Main Content */}
          <div className="w-[450px] h-[450px] rounded-full border-4 border-green-400 flex flex-col items-center justify-center text-center px-10">

            <h1 className={`text-4xl font-bold mb-6 ${current.color}`}>
              {current.title}
            </h1>

            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl mb-6"
            >
              {current.icons}
            </motion.div>

            <div className="text-green-300 text-lg opacity-80">
              🤖 AI Processing Secure Operation...
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* SUCCESS DATA PANEL */}
      {stage === "success" && response && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 bg-black/80 border border-green-400 rounded-2xl p-6 w-[700px]"
        >
          <p className="mb-2">
            🔐 <strong>Encrypted:</strong> {response.encryptedMessage}
          </p>
          <p className="mb-2 break-all">
            🧠 <strong>Hash:</strong> {response.hash}
          </p>
          <p className="break-all">
            ✍️ <strong>Signature:</strong> {response.signature}
          </p>
        </motion.div>
      )}
    </div>
  );
}