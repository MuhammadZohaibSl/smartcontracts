/**
 * Wallet Store (Zustand)
 * 
 * Global state management for wallet connection and transactions.
 * Uses Zustand for simple, performant state management.
 */

import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';
import { TransactionRecord } from '../types';

 
// Types
 

export interface WalletState {
  // Connection state
  publicKey: string | null;
  connected: boolean;
  balance: number;
  
  // Session state (for deep link transactions)
  session: string | null;
  authToken: string | null;
  
  // UI state
  loading: boolean;
  
  // Transaction history
  transactions: TransactionRecord[];
}

export interface WalletActions {
  // Connection actions
  setConnected: (publicKey: string, session?: string, authToken?: string) => void;
  setDisconnected: () => void;
  
  // Balance actions
  setBalance: (balance: number) => void;
  
  // Loading state
  setLoading: (loading: boolean) => void;
  
  // Session management
  setSession: (session: string) => void;
  setAuthToken: (authToken: string) => void;
  
  // Transaction history
  addTransaction: (tx: TransactionRecord) => void;
  clearTransactions: () => void;
  
  // Utility
  getPublicKey: () => PublicKey | null;
}

export type WalletStore = WalletState & WalletActions;

 
// Store Implementation
 

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  publicKey: null,
  connected: false,
  balance: 0,
  session: null,
  authToken: null,
  loading: false,
  transactions: [],

  // Connection actions
  setConnected: (publicKey: string, session?: string, authToken?: string) => {
    console.log('[WalletStore] Setting connected:', publicKey);
    set({
      publicKey,
      connected: true,
      session: session || get().session,
      authToken: authToken || get().authToken,
    });
  },

  setDisconnected: () => {
    console.log('[WalletStore] Disconnecting wallet');
    set({
      publicKey: null,
      connected: false,
      balance: 0,
      session: null,
      authToken: null,
      transactions: [],
    });
  },

  // Balance actions
  setBalance: (balance: number) => {
    console.log('[WalletStore] Setting balance:', balance);
    set({ balance });
  },

  // Loading state
  setLoading: (loading: boolean) => {
    set({ loading });
  },

  // Session management
  setSession: (session: string) => {
    console.log('[WalletStore] Setting session');
    set({ session });
  },

  setAuthToken: (authToken: string) => {
    console.log('[WalletStore] Setting auth token');
    set({ authToken });
  },

  // Transaction history
  addTransaction: (tx: TransactionRecord) => {
    console.log('[WalletStore] Adding transaction:', tx.signature);
    set((state) => ({
      transactions: [tx, ...state.transactions].slice(0, 50), // Keep last 50
    }));
  },

  clearTransactions: () => {
    set({ transactions: [] });
  },

  // Utility
  getPublicKey: () => {
    const { publicKey } = get();
    if (!publicKey) return null;
    try {
      return new PublicKey(publicKey);
    } catch {
      return null;
    }
  },
}));

 
// Selectors (for optimized re-renders)
 

export const selectPublicKey = (state: WalletStore) => state.publicKey;
export const selectConnected = (state: WalletStore) => state.connected;
export const selectBalance = (state: WalletStore) => state.balance;
export const selectLoading = (state: WalletStore) => state.loading;
export const selectTransactions = (state: WalletStore) => state.transactions;
export const selectSession = (state: WalletStore) => state.session;
