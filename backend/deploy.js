// deploy.js

const Web3 = require("web3");

// ✅ Ganache RPC
const RPC_URL = "http://127.0.0.1:7545";

// 🔥 IMPORTANT — PASTE FROM REMIX
const ABI = [PASTE_YOUR_ABI_HERE];
const BYTECODE = "0xPASTE_YOUR_BYTECODE_HERE";

// ================== INIT ==================
const web3 = new Web3(RPC_URL);

async function deploy() {
  try {
    console.log("🚀 Starting deployment...\n");

    // Get accounts from Ganache
    const accounts = await web3.eth.getAccounts();
    console.log("👤 Deploying from:", accounts[0]);

    // Create contract instance
    const contract = new web3.eth.Contract(ABI);

    // Deploy
    const deployed = await contract
      .deploy({ data: BYTECODE })
      .send({
        from: accounts[0],
        gas: 3000000,
      });

    console.log("\n✅ Contract deployed successfully!");
    console.log("📌 Contract Address:", deployed.options.address);
    console.log("⛓ Network:", RPC_URL);

  } catch (err) {
    console.error("❌ Deployment failed:");
    console.error(err.message);
  }
}

deploy();