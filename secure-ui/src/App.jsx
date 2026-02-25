import { useState } from "react";
import axios from "axios";
import EncryptionStage from "./EncryptionStage";
import BlockchainStage from "./BlockchainStage";
import VerificationStage from "./VerificationStage";

import standDog from "./assets/robodog-stand.png";
import "./App.css";

export default function App() {
  const [stage, setStage] = useState(0);
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message) return;

    const res = await axios.post("http://localhost:5000/send", {
      message,
    });

    setData(res.data);
    setStage(1);
  };

  return (
    <div className="main-container">
      {stage === 0 && (
        <div className="home-layout">
          <div className="dog-section">
            <img src={standDog} className="dog-img" />
            <p className="welcome-text">
              🤖 Welcome to Cyber Secure Transmission System
            </p>
          </div>

          <div className="data-section">
            <h1 className="project-title">
              BLOCKCHAIN-BASED SECURE COMMUNICATION SYSTEM
            </h1>

            <h2 className="project-subtitle">
              USING CRYPTOGRAPHY
            </h2>

            <div className="divider"></div>

            <h3 className="app-heading">
              🔐 Secure Communication 2.0
            </h3>

            <input
              placeholder="Enter secure message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button onClick={handleSend}>
              🚀 Encrypt & Store on Blockchain
            </button>
          </div>
        </div>
      )}

      {stage === 1 && (
        <EncryptionStage data={data} next={() => setStage(2)} />
      )}

      {stage === 2 && (
        <BlockchainStage data={data} next={() => setStage(3)} />
      )}

      {stage === 3 && (
        <VerificationStage data={data} />
      )}
    </div>
  );
}