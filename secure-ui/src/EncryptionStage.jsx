import walkDog from "./assets/robodog-walk.png";

export default function EncryptionStage({ data, next }) {
  return (
    <div className="two-col-layout">
      <div className="dog-section">
        <img src={walkDog} className="dog-img" />
        <p className="welcome-text">
          🔐 I encrypted your message using AES-256 and generated SHA-256 hash.
        </p>
      </div>

      <div className="data-section">
        <h2>AES Encryption</h2>
        <div className="card">{data?.encrypted}</div>

        <h2>SHA-256 Hash</h2>
        <div className="card">{data?.hash}</div>

        <button onClick={next}>➡ Proceed to Blockchain</button>
      </div>
    </div>
  );
}