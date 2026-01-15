/**
 * App Configuration Constants
 * 
 * Centralized configuration for the Solana Coin Transfer app.
 * Values are read from environment variables when available.
 */

import { clusterApiUrl } from '@solana/web3.js';

// ============================================================================
// Network Configuration
// ============================================================================

export type ClusterType = 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';

export const CLUSTER: ClusterType =
  (process.env.EXPO_PUBLIC_CLUSTER as ClusterType) || 'devnet';

export const CLUSTER_URLS: Record<ClusterType, string> = {
  'mainnet-beta': clusterApiUrl('mainnet-beta'),
  'testnet': clusterApiUrl('testnet'),
  'devnet': clusterApiUrl('devnet'),
  'localnet': 'http://localhost:8899',
};

// Use custom RPC URL if provided, otherwise use default cluster URL
export const CLUSTER_URL =
  process.env.EXPO_PUBLIC_CUSTOM_RPC_URL || CLUSTER_URLS[CLUSTER];

// ============================================================================
// Program Configuration
// ============================================================================

/**
 * Deployed Coin Transfer Program ID on Devnet
 */
export const PROGRAM_ID =
  process.env.EXPO_PUBLIC_PROGRAM_ID || 'HFE4phQSrBXbNakK2ddAcPGmo5Tm5C9z8difCcf4Cjgq';

// ============================================================================
// App Identity (for Mobile Wallet Adapter)
// ============================================================================

export const APP_IDENTITY = {
  name: process.env.EXPO_PUBLIC_APP_NAME || 'Solana Coin Transfer',
  uri: process.env.EXPO_PUBLIC_APP_URI || 'https://solanacointransfer.app',
  icon: 'favicon.ico',
};

// ============================================================================
// Transaction Configuration
// ============================================================================

export const LAMPORTS_PER_SOL = 1_000_000_000;
export const DEFAULT_TRANSACTION_FEE = 0.000005; // ~5000 lamports
export const MIN_BALANCE_FOR_RENT = 0.00089088; // Minimum rent-exempt balance

// ============================================================================
// UI Configuration
// ============================================================================

export const BALANCE_REFRESH_INTERVAL =
  parseInt(process.env.EXPO_PUBLIC_BALANCE_REFRESH_INTERVAL || '30000', 10);
export const TRANSACTION_CONFIRMATION_TIMEOUT =
  parseInt(process.env.EXPO_PUBLIC_TRANSACTION_TIMEOUT || '60000', 10);

// ============================================================================
// Explorer URLs
// ============================================================================

export const EXPLORER_URLS: Record<ClusterType, string> = {
  'mainnet-beta': 'https://explorer.solana.com',
  'testnet': 'https://explorer.solana.com?cluster=testnet',
  'devnet': 'https://explorer.solana.com?cluster=devnet',
  'localnet': 'https://explorer.solana.com?cluster=custom&customUrl=http://localhost:8899',
};

export const getExplorerUrl = (type: 'tx' | 'address', value: string): string => {
  const baseUrl = EXPLORER_URLS[CLUSTER];
  const path = type === 'tx' ? 'tx' : 'address';
  return `${baseUrl}/${path}/${value}`;
};

// ============================================================================
// App Metadata
// ============================================================================

export const APP_VERSION = '1.0.0';
export const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME || 'Solana Coin Transfer';
