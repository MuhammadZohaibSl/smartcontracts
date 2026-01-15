/**
 * Wallet Hook
 * 
 * Provides wallet connection and transaction functionality.
 * Uses Zustand for state and TanStack Query for balance.
 */

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import * as Linking from 'expo-linking';
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
import { useWalletStore } from '../store';
import { balanceKeys, getConnection } from './useBalance';
import { TransactionResult } from '../types';
import { TransactionRecord, TransactionType, TransactionStatus } from '../types';

 
// useWallet Hook
 

export function useWallet() {
  const queryClient = useQueryClient();
  const {
    publicKey,
    connected,
    session,
    authToken,
    loading,
    setConnected,
    setDisconnected,
    setLoading,
    setSession,
    setAuthToken,
    addTransaction,
    getPublicKey,
  } = useWalletStore();

  const connection = getConnection();

  // --------------------------------------------------------------------------
  // Connect Wallet
  // --------------------------------------------------------------------------
  
  const connectWallet = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (isMWAAvailable()) {
        // Use Mobile Wallet Adapter if available (Native)
        const result = await runMWAAction(async (wallet) => {
          return {
            publicKey: wallet.accounts[0].address,
            authToken: wallet.auth_token,
          };
        }, { cluster: CLUSTER, identity: APP_IDENTITY });

        if (result) {
          setConnected(result.publicKey, undefined, result.authToken);
          // Invalidate balance query to fetch fresh data
          await queryClient.invalidateQueries({ queryKey: balanceKeys.byAddress(result.publicKey) });
          return true;
        }
      } else {
        // Fallback to Deep Linking (Expo Go)
        const isInstalled = await PhantomDeepLinkService.isPhantomInstalled();
        if (!isInstalled) {
          const installUrl = PhantomDeepLinkService.getPhantomInstallUrl();
          await Linking.openURL(installUrl);
          throw new Error('Phantom wallet is not installed. Please install it and try again.');
        }
        
        const redirectUrl = Linking.createURL('onConnect');
        await PhantomDeepLinkService.connect(redirectUrl);
        // Result will be handled in deep link listener
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setConnected, queryClient]);

  // --------------------------------------------------------------------------
  // Disconnect Wallet
  // --------------------------------------------------------------------------
  
  const disconnectWallet = useCallback(async () => {
    // Clear all balance queries
    if (publicKey) {
      queryClient.removeQueries({ queryKey: balanceKeys.byAddress(publicKey) });
    }
    setDisconnected();
  }, [publicKey, queryClient, setDisconnected]);

  // --------------------------------------------------------------------------
  // Send Transaction Mutation
  // --------------------------------------------------------------------------
  
  const sendTransactionMutation = useMutation({
    mutationFn: async ({ recipient, amount }: { recipient: string; amount: number }): Promise<TransactionResult> => {
      const senderPubkey = getPublicKey();
      if (!senderPubkey) {
        return { signature: '', success: false, error: 'Wallet not connected' };
      }

      const sanitizedAddress = recipient.trim();
      if (!sanitizedAddress) {
        return { signature: '', success: false, error: 'Recipient address is required' };
      }

      let recipientPubkey: PublicKey;
      try {
        recipientPubkey = new PublicKey(sanitizedAddress);
      } catch (e) {
        return { signature: '', success: false, error: 'Invalid Solana address format' };
      }

      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      if (isMWAAvailable() && authToken) {
        // MWA Flow
        const signature = await runMWAAction(async (wallet) => {
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
          const transaction = new Transaction({
            feePayer: senderPubkey,
            blockhash,
            lastValidBlockHeight,
          }).add(
            SystemProgram.transfer({
              fromPubkey: senderPubkey,
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
          return { signature, success: true };
        }
      } else {
        // Deep Link Flow
        console.log('[useWallet] Using Deep Link flow for transaction...');
        console.log('[useWallet] Session from store:', session ? session.slice(0, 20) + '...' : 'NULL');
        console.log('[useWallet] Connected:', connected);
        console.log('[useWallet] Public key:', publicKey);
        
        if (!session) {
          console.warn('[useWallet] No session! User needs to reconnect.');
          return { 
            signature: '', 
            success: false, 
            error: 'Session expired. Please disconnect and reconnect your wallet.' 
          };
        }
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        const transaction = new Transaction({
          feePayer: senderPubkey,
          blockhash,
          lastValidBlockHeight,
        }).add(
          SystemProgram.transfer({
            fromPubkey: senderPubkey,
            toPubkey: recipientPubkey,
            lamports,
          })
        );
        
        const redirectUrl = Linking.createURL('onTransaction');
        await PhantomDeepLinkService.signAndSendTransaction(transaction, session, redirectUrl);
        return { signature: 'pending', success: true };
      }

      return { signature: '', success: false, error: 'Could not send transaction' };
    },
    onSuccess: async (result, variables) => {
      if (result.success && publicKey) {
        // Add to transaction history
        addTransaction({
          signature: result.signature,
          type: TransactionType.TRANSFER,
          amount: variables.amount,
          to: variables.recipient,
          status: TransactionStatus.CONFIRMED,
          timestamp: Date.now(),
        });
        
        // Invalidate balance to refetch
        console.log('[useWallet] Transaction successful, invalidating balance...');
        await queryClient.invalidateQueries({ queryKey: balanceKeys.byAddress(publicKey) });
      }
    },
    onError: (error) => {
      console.error('[useWallet] Transaction error:', error);
    },
  });

  // --------------------------------------------------------------------------
  // Request Airdrop Mutation
  // --------------------------------------------------------------------------
  
  const requestAirdropMutation = useMutation({
    mutationFn: async (amountSol: number = 1): Promise<TransactionResult> => {
      const senderPubkey = getPublicKey();
      if (!senderPubkey) {
        return { signature: '', success: false, error: 'Wallet not connected' };
      }

      const signature = await connection.requestAirdrop(
        senderPubkey,
        amountSol * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature, 'confirmed');
      return { signature, success: true };
    },
    onSuccess: async (result, amountSol) => {
      if (result.success && publicKey) {
        // Add to transaction history
        addTransaction({
          signature: result.signature,
          type: TransactionType.AIRDROP,
          amount: amountSol,
          status: TransactionStatus.CONFIRMED,
          timestamp: Date.now(),
        });
        
        // Invalidate balance to refetch
        console.log('[useWallet] Airdrop successful, invalidating balance...');
        await queryClient.invalidateQueries({ queryKey: balanceKeys.byAddress(publicKey) });
      }
    },
    onError: (error) => {
      console.error('[useWallet] Airdrop error:', error);
    },
  });

  // --------------------------------------------------------------------------
  // Utility Functions
  // --------------------------------------------------------------------------
  
  const formatAddress = useCallback((addr: string | PublicKey) => {
    const str = typeof addr === 'string' ? addr : addr.toBase58();
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  }, []);

  return {
    // State
    publicKey,
    connected,
    loading: loading || sendTransactionMutation.isPending || requestAirdropMutation.isPending,
    
    // Actions
    connectWallet,
    disconnectWallet,
    
    // Transactions
    sendTransaction: (recipient: string, amount: number) => 
      sendTransactionMutation.mutateAsync({ recipient, amount }),
    isSending: sendTransactionMutation.isPending,
    sendError: sendTransactionMutation.error,
    
    // Airdrop
    requestAirdrop: (amount?: number) => requestAirdropMutation.mutateAsync(amount || 1),
    isAirdropping: requestAirdropMutation.isPending,
    airdropError: requestAirdropMutation.error,
    
    // Utilities
    formatAddress,
    getPublicKey,
    
    // Deep link session management (for SolanaProvider)
    setSession,
    setConnected,
  };
}
