import sit from "./assets/robodog-sit.png";
import stand from "./assets/robodog-stand.png";
import walk from "./assets/robodog-walk.png";

export default function RobotAI({ stage }) {
  const explanations = [
    "Hello! I am your AI Security Assistant.",
    "Now I am encrypting your message using AES-256.",
    "Message is being stored securely on Blockchain.",
    "Verifying digital signature for authenticity.",
    "System architecture overview complete.",
  ];

  const images = [sit, walk, stand, stand, sit];

  return (
    <div className="robot-container">
      <img src={images[stage]} alt="AI Dog" className="robot-img" />
      <div className="speech">
        {explanations[stage]}
      </div>
    </div>
  );
}