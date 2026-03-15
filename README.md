# Blockchain-Based Secure Communication System Using Cryptography

A production-quality secure decentralized communication platform that ensures confidentiality, integrity, authentication, and tamper-proof verification using cryptography and blockchain technology.

## Features

- **User Authentication**: Secure registration and login with hashed passwords
- **Secure Messaging**: End-to-end encrypted messaging with AES-256
- **Message Integrity**: SHA-256 hashing for tamper detection
- **Digital Signatures**: RSA-based authentication for message origin verification
- **Blockchain Verification**: Immutable message proof storage on Ethereum
- **Admin Monitoring**: Security dashboard with attack detection and audit logs
- **File Transfer**: Encrypted file sharing capabilities
- **Real-time Communication**: Socket.io for instant messaging

## Technology Stack

### Frontend
- React 19 + Vite
- TailwindCSS + Framer Motion
- Lucide React icons
- Socket.io client

### Backend
- Node.js + Express.js
- JWT authentication
- Socket.io for real-time messaging
- Rate limiting and security middleware

### Database
- MongoDB for user data and encrypted messages

### Blockchain
- Ethereum (Ganache for local development)
- Solidity smart contracts
- ethers.js integration

### Cryptography
- AES-256-CBC encryption
- SHA-256 hashing
- RSA-2048 digital signatures

## Architecture

### 4-Layer Architecture

1. **Presentation Layer**: Modern cybersecurity dashboard UI
2. **Logic Layer**: Business logic and API endpoints
3. **Security Layer**: Cryptographic operations and validation
4. **Data Layer**: MongoDB and blockchain storage

### Secure Message Pipeline

```
Message Input → AES Encryption → SHA-256 Hash → Digital Signature → Blockchain Storage → Receiver Verification → AES Decryption
```

## Smart Contract

**SecureCommunication.sol** provides:
- `storeMessageHash()`: Store message proof on blockchain
- `verifyMessageHash()`: Verify message integrity
- `getMessageRecord()`: Retrieve message metadata

## Prerequisites

- Node.js 18+
- MongoDB 6+
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blockchain-secure-communication-system
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # On Windows
   net start MongoDB

   # On Linux/Mac
   sudo systemctl start mongod
   ```

5. **Start the system**
   ```bash
   npm run start-all
   ```

This will start:
- Ganache blockchain (port 7545)
- Node.js backend (port 5000)
- React frontend (port 5173)

## Usage

1. **Access the application** at `http://localhost:5173`

2. **Register a new account** or login with existing credentials

3. **Navigate through the dashboard**:
   - **Dashboard**: Overview and statistics
   - **Secure Chat**: Send encrypted messages
   - **File Transfer**: Share encrypted files
   - **Settings**: Account and security configuration
   - **Admin Panel**: Security monitoring (admin only)
   - **Audit Logs**: Message transaction history

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Messaging
- `POST /api/messages/send` - Send encrypted message
- `GET /api/messages/inbox` - Get received messages
- `POST /api/messages/decrypt` - Decrypt message

### Admin
- `GET /api/messages/attacks` - Attack detection logs
- `GET /api/messages/audit` - Message audit logs

## Security Features

- **Zero-trust architecture** with JWT tokens
- **Rate limiting** (200 requests per 15 minutes)
- **Helmet.js** security headers
- **CORS** protection
- **Attack detection** (honeypot, brute force, suspicious activity)
- **No plaintext storage** - all messages encrypted
- **Blockchain immutability** for message verification

## Development

### Project Structure

```
secure-communication-system/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── visualization/   # Crypto animations
├── backend/                  # Node.js API server
│   ├── controllers/         # Route handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── middleware/         # Express middleware
├── blockchain/              # Ethereum smart contracts
│   ├── contracts/          # Solidity contracts
│   └── scripts/            # Deployment scripts
└── package.json            # Root package scripts
```

### Scripts

- `npm run setup` - Install all dependencies
- `npm run start-all` - Start all services
- `npm run frontend` - Start frontend only
- `npm run backend` - Start backend only
- `npm run blockchain` - Start Ganache only

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
      MessageBubble.jsx
      EncryptionStatus.jsx
      BlockchainVerification.jsx
    pages/
      Login.jsx
      Register.jsx
      Dashboard.jsx
      SecureChat.jsx
      AdminPanel.jsx
      AuditLogs.jsx
    services/
      api.js
      cryptoService.js
      blockchainService.js

backend/
  controllers/
    authController.js
    messageController.js
    blockchainController.js
  routes/
    authRoutes.js
    messageRoutes.js
  services/
    cryptoService.js
    blockchainService.js
    attackDetectionService.js
  models/
    User.js
    Message.js
    AttackLog.js
  middleware/
    authMiddleware.js
  server.js

blockchain/
  contracts/
    SecureCommunication.sol
  scripts/
    deploy.js
```

## 3. Local Setup (Step-by-step)

### Prerequisites
- Node.js 20+
- MongoDB local or Atlas URI
- Optional: Sepolia RPC + funded account for real on-chain writes

### Step A: Configure environment files

1. Backend
- Copy `backend/.env.example` to `backend/.env`
- Fill values (`MONGODB_URI`, `JWT_SECRET`, blockchain vars if needed)

2. Frontend
- Copy `frontend/.env.example` to `frontend/.env`

3. Blockchain
- Copy `blockchain/.env.example` to `blockchain/.env`

### Step B: Install and run

From repository root:

```bash
npm install
npm run dev
```

This starts:
- backend on `http://localhost:5000`
- frontend on `http://localhost:5173`

To run backend in start mode:

```bash
npm start
```

## 4. API Overview

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Messages
- `POST /api/messages/send`
- `GET /api/messages/inbox`
- `POST /api/messages/retrieve-by-key`
- `POST /api/messages/:id/decrypt`
- `GET /api/messages/:id/verify`
- `GET /api/messages/:id/blockchain`

Compatibility aliases:
- `GET /api/message/get`
- `POST /api/message/send`

### Admin
- `GET /api/messages/admin/audit`
- `GET /api/messages/admin/attacks`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/block`
- `GET /api/admin/security-state`
- `POST /api/admin/emergency-shutdown`

### Files
- `POST /api/files/upload`
- `GET /api/files/download/:fileId`
- `POST /api/files/download/:fileId/decrypt`

## 5. Smart Contract Workflow

`SecureCommunication.sol` stores immutable verification payload:
- `messageHash`
- `sender`
- `receiver`
- `timestamp`
- `signature`

Deploy:

```bash
cd blockchain
npm install
npm run compile
npm run deploy:sepolia
```

Then copy deployed contract address into `backend/.env` as `CONTRACT_ADDRESS`.

## 6. Docker

Run full stack:

```bash
docker compose up --build
```

Services:
- frontend: `5173`
- backend: `5000`
- mongo: `27017`

## 7. Deployment

### Frontend -> Vercel
- Use `frontend/` as project root
- `vercel.json` included
- Set env: `VITE_API_BASE`, `VITE_SOCKET_URL`

### Backend -> Railway
- Use `backend/` as project root
- `railway.json` included
- Set env variables from `backend/.env.example`

### Database -> MongoDB Atlas
- Create cluster + DB user
- Add IP/network access rules
- Set `MONGODB_URI` in Railway/backend env

## 8. Security Notes

- Plaintext is never saved in DB
- Private keys are password-derived encrypted at rest
- Signatures verified on read/verify endpoints
- Attack attempts logged and queryable from admin panel
- For production hardening, add:
  - key rotation policy
  - KMS/HSM-backed key encryption
  - audit SIEM export
  - WAF and anomaly scoring
