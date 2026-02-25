require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { ethers } = require("ethers");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

/* ==============================
   ENV CONFIG
============================== */

const PORT = process.env.PORT || 5000;
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

/* ==============================
   BLOCKCHAIN SETUP
============================== */

let provider;
let wallet;

try {
  provider = new ethers.JsonRpcProvider(RPC_URL);
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("✅ Blockchain Connected");
} catch (err) {
  console.log("⚠ Blockchain not connected. Running in local mode.");
}

/* ==============================
   CRYPTO HELPERS
============================== */

// AES-256 Encryption
function encryptMessage(message) {
  const key = crypto
    .createHash("sha256")
    .update(String(process.env.SECRET_KEY))
    .digest("base64")
    .substring(0, 32);

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(message, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
  };
}

// AES-256 Decryption
function decryptMessage(encryptedData, iv) {
  const key = crypto
    .createHash("sha256")
    .update(String(process.env.SECRET_KEY))
    .digest("base64")
    .substring(0, 32);

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "hex")
  );

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// SHA-256 Hash
function generateHash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/* ==============================
   ROUTES
============================== */

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Secure Communication Backend Running",
  });
});

/* ==============================
   ENCRYPT + STORE
============================== */

app.post("/send", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    console.log("📩 Incoming Message:", message);

    // Encrypt
    const { encryptedData, iv } = encryptMessage(message);

    // Hash
    const hash = generateHash(encryptedData);

    // Sign
    const signature = await wallet.signMessage(hash);

    // Simulated blockchain tx (replace with real contract call if needed)
    const txHash = crypto.randomBytes(32).toString("hex");

    console.log("🔐 Encryption Complete");
    console.log("🔗 Blockchain TX:", txHash);

    res.json({
      encrypted: encryptedData,
      iv,
      hash,
      signature,
      txHash,
      status: "stored",
    });
  } catch (error) {
    console.error("❌ Error in /send:", error);
    res.status(500).json({ error: "Encryption process failed" });
  }
});

/* ==============================
   VERIFY SIGNATURE
============================== */

app.post("/verify", async (req, res) => {
  try {
    const { hash, signature } = req.body;

    const recoveredAddress = ethers.verifyMessage(hash, signature);

    const isValid =
      recoveredAddress.toLowerCase() === wallet.address.toLowerCase();

    res.json({
      verified: isValid,
      signer: recoveredAddress,
    });
  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ==============================
   DECRYPT
============================== */

app.post("/decrypt", (req, res) => {
  try {
    const { encrypted, iv } = req.body;

    if (!encrypted || !iv) {
      return res.status(400).json({ error: "Missing encrypted data" });
    }

    const decrypted = decryptMessage(encrypted, iv);

    res.json({
      decrypted,
      status: "success",
    });
  } catch (error) {
    console.error("❌ Decryption Error:", error);
    res.status(500).json({ error: "Decryption failed" });
  }
});

/* ==============================
   SERVER START
============================== */

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
