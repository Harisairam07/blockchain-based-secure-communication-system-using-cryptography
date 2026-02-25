import { useState } from "react";
import axios from "axios";
import sitDog from "./assets/robodog-sit.png";

export default function VerificationStage({ data }) {
  const [decrypted, setDecrypted] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDecrypt = async () => {
    try {
      setLoading(true);
      setError("");

      if (!data?.encrypted || !data?.iv) {
        setError("Missing encrypted data or IV.");
        return;
      }

      const res = await axios.post("http://localhost:5000/decrypt", {
        encrypted: data.encrypted,
        iv: data.iv,   // 🔥 REQUIRED
      });

      setDecrypted(res.data.decrypted);
    } catch (err) {
      console.error("Decryption failed:", err);
      setError("Decryption failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="two-col-layout">
      <div className="dog-section">
        <img src={sitDog} className="dog-img" alt="Robot Dog" />
        <p className="welcome-text">
          ✅ Signature verified. Ready to decrypt securely.
        </p>
      </div>

      <div className="data-section">
        <h2>Digital Signature</h2>
        <div className="card">{data?.signature}</div>

        <button onClick={handleDecrypt} disabled={loading}>
          {loading ? "Decrypting..." : "🔓 Decrypt Message"}
        </button>

        {error && (
          <div style={{ marginTop: "15px", color: "red" }}>
            {error}
          </div>
        )}

        {decrypted && (
          <>
            <h2 style={{ marginTop: "30px" }}>Decrypted Message</h2>
            <div className="card">{decrypted}</div>
          </>
        )}
      </div>
    </div>
  );
}import { useState } from "react";
import axios from "axios";
import sitDog from "./assets/robodog-sit.png";

export default function VerificationStage({ data }) {
  const [decrypted, setDecrypted] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDecrypt = async () => {
    try {
      setLoading(true);
      setError("");

      if (!data?.encrypted || !data?.iv) {
        setError("Missing encrypted data or IV.");
        return;
      }

      const res = await axios.post("http://localhost:5000/decrypt", {
        encrypted: data.encrypted,
        iv: data.iv,   // 🔥 REQUIRED
      });

      setDecrypted(res.data.decrypted);
    } catch (err) {
      console.error("Decryption failed:", err);
      setError("Decryption failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="two-col-layout">
      <div className="dog-section">
        <img src={sitDog} className="dog-img" alt="Robot Dog" />
        <p className="welcome-text">
          ✅ Signature verified. Ready to decrypt securely.
        </p>
      </div>

      <div className="data-section">
        <h2>Digital Signature</h2>
        <div className="card">{data?.signature}</div>

        <button onClick={handleDecrypt} disabled={loading}>
          {loading ? "Decrypting..." : "🔓 Decrypt Message"}
        </button>

        {error && (
          <div style={{ marginTop: "15px", color: "red" }}>
            {error}
          </div>
        )}

        {decrypted && (
          <>
            <h2 style={{ marginTop: "30px" }}>Decrypted Message</h2>
            <div className="card">{decrypted}</div>
          </>
        )}
      </div>
    </div>
  );
}
