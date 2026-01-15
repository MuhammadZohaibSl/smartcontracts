# 🌟 Solana Coin Transfer

A complete Solana-based cryptocurrency transfer solution featuring a **React Native mobile app** with **Phantom wallet integration** and an **Anchor smart contract** deployed on Solana Devnet.

![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo)
![Anchor](https://img.shields.io/badge/Anchor-0.32.1-blue?style=for-the-badge)

---

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Mobile App](#-mobile-app)
- [Solana Program](#-solana-program)
- [Configuration](#-configuration)
- [License](#-license)

---

## ✨ Features

### Mobile App
- 🔐 **Phantom Wallet Integration** - Connect via deep linking
- 💰 **Balance Display** - Real-time SOL balance with auto-refresh
- 📤 **Send Transactions** - Transfer SOL to any Solana address
- 📜 **Transaction History** - Track all your transfers
- 💧 **Devnet Airdrop** - Request test SOL from the faucet
- 🎨 **Premium UI** - Glassmorphism design with smooth animations

### Solana Program
- ⚡ **Fast Transfers** - Native SOL transfers on Solana blockchain
- 🔒 **Secure** - Built with Anchor framework
- 📊 **State Tracking** - Optional transfer statistics
- ✅ **Validated** - Input validation and error handling

---

## 📁 Project Structure

```
smartcontracts/
├── mobile-app/                 # React Native Expo App
│   ├── App.tsx                 # Main app component
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── SendTransaction.tsx
│   │   │   ├── balance/
│   │   │   ├── transaction/
│   │   │   └── common/         # Button, Card, Input
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useWallet.ts    # Phantom wallet integration
│   │   │   ├── useBalance.ts   # TanStack Query balance hook
│   │   │   └── useSolana.ts    # Solana utilities
│   │   ├── config/             # App configuration
│   │   ├── context/            # React contexts
│   │   ├── store/              # Zustand state management
│   │   └── services/           # API services
│   └── package.json
│
├── solana-program/             # Anchor Smart Contract
│   ├── programs/coin_transfer/
│   │   └── src/
│   │       ├── lib.rs          # Program entry point
│   │       ├── instructions.rs # Transfer handlers
│   │       ├── state.rs        # Account structures
│   │       └── errors.rs       # Custom errors
│   ├── Anchor.toml             # Anchor configuration
│   └── Cargo.toml
│
└── README.md
```

---

## 🛠 Tech Stack

### Mobile App
| Technology | Purpose |
|------------|---------|
| **React Native 0.81** | Cross-platform mobile framework |
| **Expo 54** | Development and build tooling |
| **TypeScript** | Type-safe development |
| **Zustand** | Lightweight state management |
| **TanStack Query** | Data fetching and caching |
| **@solana/web3.js** | Solana blockchain interaction |

### Solana Program
| Technology | Purpose |
|------------|---------|
| **Rust** | Smart contract language |
| **Anchor 0.32.1** | Solana development framework |
| **Solana Devnet** | Test network deployment |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Android Studio** (for Android development)
- **Phantom Wallet** installed on your mobile device
- **Rust** and **Anchor CLI** (for smart contract development)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/MuhammadZohaibSl/smartcontracts.git
cd smartcontracts

# Setup mobile app
cd mobile-app
npm install
npx expo start --clear

# Scan QR code with Expo Go app
```

---

## 📱 Mobile App

### Running the App

```bash
cd mobile-app

# Install dependencies
npm install

# Start development server
npx expo start --clear

# Run on Android
npx expo run:android
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android device/emulator |
| `npm run build:android` | Build production APK with EAS |
| `npm run prebuild` | Generate native Android project |

### Key Components

- **WalletConnect** - Phantom wallet connection via deep linking
- **Balance** - Displays SOL balance with refresh functionality
- **SendTransaction** - Form to send SOL with amount validation
- **TransactionHistory** - List of recent transactions

---

## ⚡ Solana Program

### Program ID
```
HFE4phQSrBXbNakK2ddAcPGmo5Tm5C9z8difCcf4Cjgq
```

### Instructions

| Instruction | Description |
|-------------|-------------|
| `initialize` | Initialize program state (one-time setup) |
| `transfer_sol` | Transfer SOL from sender to recipient |
| `get_balance` | Query account balance |

### Building & Deploying

```bash
cd solana-program

# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `mobile-app` directory:

```env
# Network Configuration
EXPO_PUBLIC_CLUSTER=devnet

# Program ID
EXPO_PUBLIC_PROGRAM_ID=HFE4phQSrBXbNakK2ddAcPGmo5Tm5C9z8difCcf4Cjgq

# App Identity
EXPO_PUBLIC_APP_NAME=Solana Coin Transfer
EXPO_PUBLIC_APP_URI=https://solanacointransfer.app

# UI Configuration
EXPO_PUBLIC_BALANCE_REFRESH_INTERVAL=30000
EXPO_PUBLIC_TRANSACTION_TIMEOUT=60000
```

### Network Options

| Cluster | Description |
|---------|-------------|
| `devnet` | Solana test network (default) |
| `testnet` | Public test network |
| `mainnet-beta` | Production network |
| `localnet` | Local validator (localhost:8899) |

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Muhammad Zohaib**

- GitHub: [@MuhammadZohaibSl](https://github.com/MuhammadZohaibSl)

---

<p align="center">
  Built with ❤️ on Solana
</p>
