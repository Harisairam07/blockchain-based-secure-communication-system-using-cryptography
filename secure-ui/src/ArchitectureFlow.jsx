// src/ArchitectureFlow.jsx
import React from "react";
import { motion } from "framer-motion";

export default function ArchitectureFlow({ mode = "encrypt", data, onDecrypt }) {
  const encryptFlow = [
    { title: "🔐 AES Encryption", description: "AES-256 encryption applied.", value: data?.encrypted || "—" },
    { title: "🧠 SHA-256 Hash", description: "Integrity verification hash generated.", value: data?.hash || "—" },
    { title: "✍ Digital Signature", description: "Signed using sender private key.", value: data?.signature || "—" },
    { title: "⛓ Blockchain Storage", description: "Stored securely on Ethereum blockchain.", value: data?.txHash ? `TX: ${data.txHash}` : "Transaction Confirmed" },
  ];

  const decryptFlow = [
    { title: "🔓 AES Decryption", description: "AES decryption performed.", value: data?.original || "—" },
    { title: "✅ Signature Verification", description: "Integrity and authenticity verified.", value: "Verified" },
  ];

  const steps = mode === "decrypt" ? decryptFlow : encryptFlow;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-12">
      {/* RoboDog Center + Info Right */}
      <div className="flex items-start gap-12 w-full max-w-6xl">
        {/* Info Panel */}
        <div className="flex-1 grid grid-cols-1 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.5 }}
              className="bg-black/80 border border-green-400 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform"
            >
              <h2 className="text-2xl font-bold text-cyan-400 mb-3">{step.title}</h2>
              <p className="text-gray-300 mb-4">{step.description}</p>
              <div className="bg-gray-900 p-3 rounded-lg text-sm break-words text-green-300">
                {step.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* RoboDog Center */}
        <div className="flex-shrink-0 w-[400px] flex justify-center">
          {/* RoboAI is rendered in App.jsx, so this space aligns it visually */}
        </div>
      </div>

      {mode === "encrypt" && (
        <div className="absolute bottom-12 text-center w-full">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDecrypt && onDecrypt()}
            className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-xl text-lg font-bold transition"
          >
            🔓 Proceed to Decrypt
          </motion.button>
        </div>
      )}
    </div>
  );
}
