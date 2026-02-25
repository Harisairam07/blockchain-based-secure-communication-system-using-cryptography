// src/Timeline.jsx
import { motion } from "framer-motion";

export default function Timeline({ stage }) {
  const steps = [
    { id: 1, label: "Encryption", color: "text-yellow-400" },
    { id: 2, label: "Blockchain", color: "text-green-400" },
    { id: 3, label: "Verification", color: "text-blue-400" },
    { id: 4, label: "Architecture", color: "text-purple-400" },
  ];

  return (
    <div className="flex justify-center items-center gap-6 mb-8">
      {steps.map((step) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`flex flex-col items-center ${
            stage >= step.id ? "" : "opacity-40"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${step.color}`}
          >
            {step.id}
          </div>
          <span className={`mt-2 text-sm ${step.color}`}>{step.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
