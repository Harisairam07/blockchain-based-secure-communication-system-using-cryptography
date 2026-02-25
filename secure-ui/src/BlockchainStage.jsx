import standDog from "./assets/robodog-stand.png";

export default function BlockchainStage({ data, next }) {
  return (
    <div className="two-col-layout">
      <div className="dog-section">
        <img src={standDog} className="dog-img" />
        <p className="welcome-text">
          ⛓ I securely stored your hash on Ethereum blockchain.
        </p>
      </div>

      <div className="data-section">
        <h2>Transaction Hash</h2>
        <div className="card">{data?.txHash}</div>

        <button onClick={next}>➡ Verify Signature</button>
      </div>
    </div>
  );
}