/**
 * Solana Integration Hook (Safe Version)
 * 
 * Provides wallet connection via Mobile Wallet Adapter or Deep Linking.
 * Optimized for both native environments and Expo Go.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import { 
  CLUSTER, 
  CLUSTER_URL, 
  APP_IDENTITY, 
  LAMPORTS_PER_SOL 
} from '../config/constants';
import { 
  isMWAAvailable, 
  runMWAAction, 
  PhantomDeepLinkService 
} from '../services/wallet';
import * as Linking from 'expo-linking';

 
// Types
 

export interface WalletState {
  publicKey: PublicKey | null;
  connected: boolean;
  balance: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

 
// Hook Implementation
 

export function useSolana() {
  const [connection] = useState(() => new Connection(CLUSTER_URL, 'confirmed'));
  const [walletState, setWalletState] = useState<WalletState>({
    publicKey: null,
    connected: false,
    balance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null); // For MWA
  const [session, setSession] = useState<string | null>(null);     // For Deep Link

  // --------------------------------------------------------------------------
  // Wallet Connection
  // --------------------------------------------------------------------------
  
  const connectWallet = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (isMWAAvailable()) {
        // Use Mobile Wallet Adapter if available (Native)
        const result = await runMWAAction(async (wallet) => {
          return {
            publicKey: new PublicKey(wallet.accounts[0].address),
            authToken: wallet.auth_token,
          };
        }, { cluster: CLUSTER, identity: APP_IDENTITY });

        if (result) {
          setWalletState({
            publicKey: result.publicKey,
            connected: true,
            balance: 0,
          });
          setAuthToken(result.authToken);
          await refreshBalance(result.publicKey);
          return true;
        }
      } else {
        // Fallback to Deep Linking (Expo Go)
        // First check if Phantom is installed
        const isInstalled = await PhantomDeepLinkService.isPhantomInstalled();
        if (!isInstalled) {
          // Open app store to install Phantom
          const installUrl = PhantomDeepLinkService.getPhantomInstallUrl();
          await Linking.openURL(installUrl);
          throw new Error('Phantom wallet is not installed. Please install it and try again.');
        }
        
        const redirectUrl = Linking.createURL('onConnect');
        await PhantomDeepLinkService.connect(redirectUrl);
        // Result will be handled in a listener (see SolanaProvider)
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      throw error; // Re-throw to let the UI handle it
    } finally {
      setLoading(false);
    }
  }, []);

  // --------------------------------------------------------------------------
  // Balance Operations
  // --------------------------------------------------------------------------
  
  const refreshBalance = useCallback(async (customPubkey?: PublicKey | string): Promise<number> => {
    let pubkey: PublicKey | null = null;
    
    // Debug logging
    console.log('=== refreshBalance called ===');
    console.log('customPubkey:', customPubkey);
    console.log('typeof customPubkey:', typeof customPubkey);
    console.log('is string?:', typeof customPubkey === 'string');
    console.log('is PublicKey?:', customPubkey instanceof PublicKey);
    
    // Handle different input types
    if (customPubkey) {
      if (typeof customPubkey === 'string') {
        try {
          pubkey = new PublicKey(customPubkey);
        } catch (e) {
          console.error('Invalid public key string:', customPubkey);
          return 0;
        }
      } else if (customPubkey instanceof PublicKey) {
        pubkey = customPubkey;
      } else {
        // Try to convert if it has toBase58
        try {
          pubkey = new PublicKey((customPubkey as any).toString());
        } catch (e) {
          console.error('Could not convert to PublicKey:', customPubkey);
          return 0;
        }
      }
    } else {
      pubkey = walletState.publicKey;
    }
    
    if (!pubkey) return 0;
    
    try {
      const balance = await connection.getBalance(pubkey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      setWalletState(prev => ({
        ...prev,
        publicKey: pubkey,
        connected: true,
        balance: solBalance,
      }));
      return solBalance;
    } catch (error) {
      console.error('Refresh balance error:', error);
      return walletState.balance;
    }
  }, [connection, walletState.publicKey, walletState.balance]);

  // --------------------------------------------------------------------------
  // Send Transaction
  // --------------------------------------------------------------------------
  
  const sendTransaction = useCallback(async (
    recipientAddress: string,
    amountSol: number
  ): Promise<TransactionResult> => {
    if (!walletState.publicKey) {
      return { signature: '', success: false, error: 'Wallet not connected' };
    }

    try {
      setLoading(true);
      
      // Sanitization to prevent "Non-base58 character" errors
      const sanitizedAddress = recipientAddress.trim();
      if (!sanitizedAddress) throw new Error('Recipient address is required');
      
      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(sanitizedAddress);
      } catch (e) {
        throw new Error('Invalid Solana address format');
      }
      
      const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

      if (isMWAAvailable() && authToken) {
        // MWA Flow
        const signature = await runMWAAction(async (wallet) => {
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
          const transaction = new Transaction({
            feePayer: walletState.publicKey!,
            blockhash,
            lastValidBlockHeight,
          }).add(
            SystemProgram.transfer({
              fromPubkey: walletState.publicKey!,
              toPubkey: recipientPubkey,
              lamports,
            })
          );

          const signedTransactions = await wallet.signAndSendTransactions({
            transactions: [transaction],
          });
          return signedTransactions[0];
        }, { cluster: CLUSTER, identity: APP_IDENTITY, authToken });

        if (signature) {
          await connection.confirmTransaction(signature, 'confirmed');
          await refreshBalance();
          return { signature, success: true };
        }
      } else {
        // Deep Link Flow - Always try deep link when MWA is not available
        // This works for Expo Go and when connected via deep link
        console.log('Using Deep Link flow for transaction...');
        console.log('Session:', session);
        console.log('Wallet connected:', walletState.connected);
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        const transaction = new Transaction({
          feePayer: walletState.publicKey!,
          blockhash,
          lastValidBlockHeight,
        }).add(
          SystemProgram.transfer({
            fromPubkey: walletState.publicKey!,
            toPubkey: recipientPubkey,
            lamports,
          })
        );
        
        const redirectUrl = Linking.createURL('onTransaction');
        await PhantomDeepLinkService.signAndSendTransaction(transaction, session || '', redirectUrl);
        return { signature: 'pending', success: true };
      }
      
      return { signature: '', success: false, error: 'Could not send transaction' };
    } catch (error: any) {
      console.error('Send transaction error:', error);
      let message = error.message || 'Transaction failed';
      
      // Map common errors to human-friendly messages
      if (message.includes('429')) {
        message = 'Solana network rate limit reached. Please try again in a few minutes.';
      } else if (message.includes('Non-base58 character')) {
        message = 'The recipient address contains invalid characters.';
      }
      
      return { signature: '', success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [walletState, authToken, session, connection, refreshBalance]);

  // --------------------------------------------------------------------------
  // Devnet Airdrop
  // --------------------------------------------------------------------------
  
  const requestAirdrop = useCallback(async (amountSol: number = 1): Promise<TransactionResult> => {
    if (!walletState.publicKey) {
      return { signature: '', success: false, error: 'Wallet not connected' };
    }

    try {
      setLoading(true);
      const signature = await connection.requestAirdrop(
        walletState.publicKey,
        amountSol * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature, 'confirmed');
      await refreshBalance();
      return { signature, success: true };
    } catch (error: any) {
      console.error('Airdrop error:', error);
      let message = error.message || 'Airdrop failed';
      
      // User-friendly error mapping
      if (message.includes('429')) {
        message = "You've reached your airdrop limit for today. Using the same IP or wallet too frequently will trigger this limit.";
      }
      
      return { signature: '', success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [walletState.publicKey, connection, refreshBalance]);

  return {
    connection,
    walletState,
    loading,
    cluster: CLUSTER,
    connectWallet,
    disconnectWallet: async () => {
      setWalletState({ publicKey: null, connected: false, balance: 0 });
      setAuthToken(null);
      setSession(null);
    },
    sendTransaction,
    requestAirdrop,
    refreshBalance,
    getBalance: async (addr: string) => {
      const balance = await connection.getBalance(new PublicKey(addr));
      return balance / LAMPORTS_PER_SOL;
    },
    formatAddress: (addr: string | PublicKey) => {
      const str = typeof addr === 'string' ? addr : addr.toBase58();
      return `${str.slice(0, 6)}...${str.slice(-4)}`;
    }
  };
}
