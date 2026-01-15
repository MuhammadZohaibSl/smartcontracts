# Solana Coin Transfer

A blockchain coin transaction app built with **Solana** (Rust/Anchor) and **React Native** for Android.

## Project Structure

```
smartcontracts/
├── solana-program/                    # Anchor smart contract
│   └── programs/coin_transfer/src/
│       ├── lib.rs                     # Program entry point
│       ├── instructions.rs            # Instruction handlers
│       ├── state.rs                   # Account structures
│       └── errors.rs                  # Custom errors
│
└── mobile-app/                        # React Native (Android)
    ├── App.tsx
    └── src/
        ├── components/
        └── hooks/useSolana.ts         # Phantom wallet integration
```

## Features

- ✅ **Phantom Wallet** - Connect via Mobile Wallet Adapter
- ✅ **View Balance** - Real-time SOL balance
- ✅ **Send SOL** - Transfer to any Solana address
- ✅ **Devnet Faucet** - Request test SOL
- ✅ **Android Only** - Optimized for Android devices

## Tech Stack

| Component | Technology |
|-----------|------------|
| Smart Contract | Rust + Anchor Framework |
| Mobile App | React Native + Expo |
| Wallet | Phantom (via MWA) |
| Network | Solana Devnet |

## Prerequisites

- **Rust** + [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- **Anchor** - `cargo install --git https://github.com/coral-xyz/anchor avm --locked`
- **Node.js 18+** and npm
- **Android Studio** with emulator or physical device
- **Phantom Wallet** app installed on Android device

## Getting Started

### Solana Program

```bash
cd solana-program
npm install
anchor build
anchor test                            # Run tests
anchor deploy --provider.cluster devnet # Deploy to devnet
```

### Mobile App (Android)

```bash
cd mobile-app
npm install
npm run android                        # Start on Android
```

## Usage

1. **Install Phantom** wallet on your Android device
2. **Switch to Devnet** in Phantom settings (Settings → Developer Settings → Change Network)
3. **Launch the app** and tap "Open Phantom"
4. **Approve connection** in Phantom
5. **Get test SOL** using the "Get Devnet SOL" button
6. **Send SOL** to any address

## Phantom Browser Extension

If you have Phantom in your browser:
1. The mobile app connects to the **Phantom mobile app**, not the browser extension
2. Your browser Phantom and mobile Phantom are **separate wallets** unless you import the same seed phrase
3. To use the same wallet, export your seed phrase from browser Phantom and import it in mobile Phantom

## License

MIT
