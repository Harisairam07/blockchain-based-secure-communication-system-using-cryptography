const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/secureComm");

const MessageSchema = new mongoose.Schema({
  encryptedMessage: String,
  hash: String,
  signature: String,
});

const Message = mongoose.model("Message", MessageSchema);

// Generate RSA Key Pair (once)
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

// AES Key
const AES_KEY = crypto.randomBytes(32);

app.post("/send", async (req, res) => {
  try {
    const { message } = req.body;

    // AES Encryption
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", AES_KEY, iv);
    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    const encryptedMessage = iv.toString("hex") + ":" + encrypted;

    // SHA-256 Hash
    const hash = crypto.createHash("sha256")
      .update(message)
      .digest("hex");

    // RSA Signature
    const signature = crypto.sign(
      "sha256",
      Buffer.from(hash),
      privateKey
    ).toString("hex");

    // Save to DB
    const newMessage = new Message({
      encryptedMessage,
      hash,
      signature,
    });

    await newMessage.save();

    res.json({ encryptedMessage, hash, signature });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing secure transaction");
  }
});

app.listen(3000, () =>
  console.log("🔐 Secure Server running at http://localhost:3000")
);