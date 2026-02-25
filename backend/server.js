const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const forge = require("node-forge");
const Web3 = require("web3");

const app = express();
app.use(cors());
app.use(express.json());

// ================== CONFIG ==================
const GANACHE_RPC = "http://127.0.0.1:7545";
const CONTRACT_ADDRESS = "PASTE_YOUR_CONTRACT_ADDRESS";
const ABI = [PASTE_YOUR_ABI_JSON];

// ================== WEB3 ==================
const web3 = new Web3(GANACHE_RPC);
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// ================== MONGODB ==================
mongoose.connect("mongodb://127.0.0.1:27017/securecomm");

const MessageSchema = new mongoose.Schema({
  encryptedMessage: String,
  hash: String,
  signature: String,
  txHash: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", MessageSchema);

// ================== RSA KEYS ==================
const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);

// ================== ROUTE ==================
app.post("/send", async (req, res) => {
  try {
    const { message } = req.body;

    // 🔐 AES key
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // 🔒 Encrypt
    const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    // 🧾 Hash
    const hash = crypto.createHash("sha256").update(encrypted).digest("hex");

    // ✍️ Sign
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const md = forge.md.sha256.create();
    md.update(hash, "utf8");
    const signature = forge.util.encode64(privateKey.sign(md));

    // ================= BLOCKCHAIN =================
    const accounts = await web3.eth.getAccounts();

    const tx = await contract.methods
      .storeMessage(hash, signature)
      .send({
        from: accounts[0],
        gas: 3000000
      });

    const txHash = tx.transactionHash;

    // ================= MONGODB =================
    await Message.create({
      encryptedMessage: encrypted,
      hash,
      signature,
      txHash
    });

    // ================= RESPONSE =================
    res.json({
      success: true,
      txHash,
      steps: [
        { step: "AES Encryption Completed", status: "success" },
        { step: "SHA-256 Hash Generated", status: "success" },
        { step: "RSA Digital Signature Created", status: "success" },
        { step: "Stored in MongoDB", status: "success" },
        { step: "Blockchain Transaction Confirmed", status: "success" }
      ]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});