/**
 * Wallet Types
 * 
 * Type definitions for wallet-related functionality.
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Wallet connection state
 */
export interface WalletState {
  /** The connected wallet's public key */
  publicKey: PublicKey | null;
  /** Whether a wallet is currently connected */
  connected: boolean;
  /** Current balance in SOL */
  balance: number;
}

/**
 * Wallet connection result
 */
export interface WalletConnectionResult {
  /** Whether connection was successful */
  success: boolean;
  /** The connected public key (if successful) */
  publicKey?: PublicKey;
  /** Auth token from Mobile Wallet Adapter */
  authToken?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Wallet adapter authorization
 */
export interface WalletAuthorization {
  publicKey: PublicKey;
  authToken: string;
}

/**
 * Supported wallet types
 */
export type WalletType = 'phantom' | 'solflare' | 'other';

/**
 * Wallet metadata
 */
export interface WalletMetadata {
  name: string;
  type: WalletType;
  icon?: string;
}
