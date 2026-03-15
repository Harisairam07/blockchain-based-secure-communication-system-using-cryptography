# Secure Comm Platform

Industry-style microservice secure communication platform with encryption, signatures, blockchain attestation, and monitoring.

## Run

1. Copy `.env.example` to `.env`
2. Start:

```bash
docker-compose up --build
```

## Services

- `frontend` (React dashboard)
- `gateway` (API Gateway)
- `auth-service`
- `messaging-service`
- `crypto-service`
- `blockchain-service`
- `mongo`
- `ganache`
- `nginx`

## Core features

- AES-256 encryption
- SHA-256 integrity hash
- RSA-2048 signatures
- Blockchain hash notarization
- JWT auth + bcrypt
- Rate-limit + brute-force + bot field detection
- 3D encryption pipeline visualization
