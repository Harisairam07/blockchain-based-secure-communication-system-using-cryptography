import { useState } from "react";
import axios from "axios";
import sitDog from "./assets/robodog-sit.png";

export default function VerificationStage({ data }) {
  const [decrypted, setDecrypted] = useState("");

  const handleDecrypt = async () => {
    const res = await axios.post("http://localhost:5000/decrypt", {
      encrypted: data.encrypted,
    });

    setDecrypted(res.data.decrypted);
  };

  return (
    <div className="two-col-layout">
      <div className="dog-section">
        <img src={sitDog} className="dog-img" />
        <p className="welcome-text">
          ✅ Signature verified. Ready to decrypt securely.
        </p>
      </div>

      <div className="data-section">
        <h2>Digital Signature</h2>
        <div className="card">{data?.signature}</div>

        <button onClick={handleDecrypt}>🔓 Decrypt Message</button>

        {decrypted && (
          <>
            <h2>Decrypted Message</h2>
            <div className="card">{decrypted}</div>
          </>
        )}
      </div>
    </div>
  );
}