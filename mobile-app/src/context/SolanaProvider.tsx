/**
 * Solana Context Provider (Zustand + TanStack Query)
 * 
 * Provides global Solana connection and wallet state.
 * Handles Deep Link redirects from Phantom for Expo Go support.
 * Uses Zustand for state management and TanStack Query for data fetching.
 */

import React, { ReactNode, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { PhantomDeepLinkService } from '../services/wallet';
import { toast, Toasts } from '@backpackapp-io/react-native-toast';
import { useWalletStore } from '../store';
import { balanceKeys, fetchBalance } from '../hooks/useBalance';

 
// Query Client (singleton)
 

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000, // 10 seconds
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

 
// Toast Helper
 

export const showFeedback = (message: string, type: 'success' | 'error' | 'loading' | 'info' = 'info') => {
  switch (type) {
    case 'success':
      toast.success(message, { id: message, duration: 4000 });
      break;
    case 'error':
      toast.error(message, { id: message, duration: 5000 });
      break;
    case 'loading':
      toast.loading(message, { id: message });
      break;
    default:
      toast(message, { id: message, duration: 4000 });
  }
};

 
// Deep Link Handler Component
 

function DeepLinkHandler({ children }: { children: ReactNode }) {
  const { setConnected, setSession, setBalance } = useWalletStore();

  /**
   * Handle incoming deep link from Phantom
   */
  const handleDeepLink = useCallback(async (event: { url: string }) => {
    console.log('=== INCOMING DEEP LINK ===');
    console.log('URL:', event.url);
    
    const parsed = Linking.parse(event.url);
    console.log('Parsed path:', parsed.path);
    console.log('Parsed queryParams:', parsed.queryParams);
    
    // Check if this is a connection response
    if (parsed.path === 'onConnect' || event.url.includes('onConnect')) {
      console.log('Processing onConnect callback...');
      
      const result = PhantomDeepLinkService.parseConnectionResult(event.url);
      
      if (result && result.publicKey) {
        console.log('✅ Successfully parsed Phantom response!');
        console.log('Public Key:', result.publicKey);
        console.log('Session:', result.session);
        
        // Update Zustand store
        setConnected(result.publicKey, result.session);
        if (result.session) {
          setSession(result.session);
        }
        
        // Fetch and set balance
        try {
          console.log('Fetching balance for:', result.publicKey);
          const balance = await fetchBalance(result.publicKey);
          setBalance(balance);
          
          // Also update the query cache
          queryClient.setQueryData(balanceKeys.byAddress(result.publicKey), balance);
          
          showFeedback(
            `Connected to: ${result.publicKey.slice(0, 8)}...${result.publicKey.slice(-4)}`,
            'success'
          );
        } catch (error) {
          console.error('Error fetching balance:', error);
          showFeedback('Connected but failed to fetch balance.', 'error');
        }
      } else {
        console.log('❌ Failed to parse Phantom response');
        if (parsed.queryParams?.errorCode) {
          const errorMsg = parsed.queryParams.errorMessage as string || 'Connection was cancelled';
          console.log('Phantom error:', parsed.queryParams.errorCode, errorMsg);
          showFeedback(errorMsg, 'error');
        } else {
          showFeedback(
            'Could not parse the response from Phantom. Please try again.',
            'error'
          );
        }
      }
    } else if (parsed.path === 'onTransaction' || event.url.includes('onTransaction')) {
      console.log('Processing onTransaction callback...');
      
      // Parse the transaction result
      const txResult = PhantomDeepLinkService.parseTransactionResult(event.url);
      
      // Get current state from store
      const { publicKey, addTransaction } = useWalletStore.getState();
      
      if (txResult && 'transaction' in txResult) {
        // signTransaction returns signed transaction bytes - we need to broadcast it
        console.log('✅ Got signed transaction, broadcasting to network...');
        showFeedback('Broadcasting transaction...', 'loading');
        
        try {
          // Decode the signed transaction and broadcast it
          const { getConnection } = await import('../hooks/useBalance');
          const connection = getConnection();
          const bs58 = await import('bs58');
          
          const signedTxBytes = bs58.default.decode(txResult.transaction);
          const signature = await connection.sendRawTransaction(signedTxBytes, {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });
          
          console.log('Transaction sent! Signature:', signature);
          
          // Wait for confirmation
          await connection.confirmTransaction(signature, 'confirmed');
          console.log('Transaction confirmed!');
          
          // Add to transaction history
          addTransaction({
            signature,
            type: 'transfer' as any,
            amount: 0,
            status: 'confirmed' as any,
            timestamp: Date.now(),
          });
          
          showFeedback(`Transaction confirmed: ${signature.slice(0, 8)}...`, 'success');
        } catch (error: any) {
          console.error('Error broadcasting transaction:', error);
          showFeedback(error?.message || 'Failed to broadcast transaction', 'error');
        }
      } else if (txResult && 'signature' in txResult) {
        // Legacy: signAndSendTransaction returns signature directly
        console.log('✅ Transaction confirmed with signature:', txResult.signature);
        
        addTransaction({
          signature: txResult.signature,
          type: 'transfer' as any,
          amount: 0,
          status: 'confirmed' as any,
          timestamp: Date.now(),
        });
        
        showFeedback(`Transaction confirmed: ${txResult.signature.slice(0, 8)}...`, 'success');
      } else if (txResult && 'error' in txResult) {
        console.log('❌ Transaction failed:', txResult.error);
        showFeedback(txResult.error, 'error');
      } else {
        console.log('No valid transaction result, unknown response');
        showFeedback('Transaction response unclear. Check your wallet.', 'info');
      }
      
      // Always refresh balance after transaction callback
      if (publicKey) {
        await queryClient.invalidateQueries({ queryKey: balanceKeys.byAddress(publicKey) });
        
        try {
          const balance = await fetchBalance(publicKey);
          useWalletStore.getState().setBalance(balance);
        } catch (error) {
          console.error('Error refreshing balance after transaction:', error);
        }
      }
    } else {
      console.log('Unknown deep link path:', parsed.path);
    }
  }, [setConnected, setSession, setBalance]);

  /**
   * Listen for incoming deep links from Phantom
   */
  useEffect(() => {
    console.log('Setting up deep link listener...');
    
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (if app was opened via link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('App opened with initial URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => {
      console.log('Removing deep link listener');
      subscription.remove();
    };
  }, [handleDeepLink]);

  return <>{children}</>;
}

 
// Provider Component
 

interface SolanaProviderProps {
  children: ReactNode;
}

export function SolanaProvider({ children }: SolanaProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DeepLinkHandler>
        {children}
        <Toasts />
      </DeepLinkHandler>
    </QueryClientProvider>
  );
}

 
// Export query client for external use
 

export { queryClient };
