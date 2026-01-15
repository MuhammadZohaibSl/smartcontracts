/**
 * Balance Hook (TanStack Query)
 * 
 * Fetches and caches wallet balance using React Query.
 * Provides automatic refetching and cache invalidation.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { CLUSTER_URL, LAMPORTS_PER_SOL } from '../config/constants';
import { useWalletStore } from '../store';


// Query Keys

export const balanceKeys = {
  all: ['balance'] as const,
  byAddress: (address: string) => [...balanceKeys.all, address] as const,
};




// Connection Instance (singleton)

let connectionInstance: Connection | null = null;

export const getConnection = (): Connection => {
  if (!connectionInstance) {
    connectionInstance = new Connection(CLUSTER_URL, 'confirmed');
  }
  return connectionInstance;
};




// Balance Fetcher

export const fetchBalance = async (address: string): Promise<number> => {
  if (!address) return 0;

  const connection = getConnection();
  const publicKey = new PublicKey(address);
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
};



// useBalance Hook

export function useBalance() {
  const queryClient = useQueryClient();
  const { publicKey, setBalance } = useWalletStore();

  const query = useQuery({
    queryKey: balanceKeys.byAddress(publicKey || ''),
    queryFn: () => fetchBalance(publicKey!),
    enabled: !!publicKey,
    staleTime: 60000, // Consider data fresh for 60 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Sync balance to Zustand store when query succeeds (in useEffect to avoid setState during render)
  useEffect(() => {
    if (query.data !== undefined && query.data !== useWalletStore.getState().balance) {
      setBalance(query.data);
    }
  }, [query.data, setBalance]);

  const refresh = async () => {
    if (publicKey) {
      await queryClient.invalidateQueries({ queryKey: balanceKeys.byAddress(publicKey) });
    }
  };

  return {
    balance: query.data ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refresh,
    refetch: query.refetch,
  };
}


// useBalanceByAddress Hook (for checking other addresses)

export function useBalanceByAddress(address: string | null) {
  return useQuery({
    queryKey: balanceKeys.byAddress(address || ''),
    queryFn: () => fetchBalance(address!),
    enabled: !!address,
    staleTime: 10000,
    retry: 2,
  });
}


// Invalidation Helper

export function useInvalidateBalance() {
  const queryClient = useQueryClient();
  const { publicKey } = useWalletStore();

  return async () => {
    if (publicKey) {
      console.log('[useBalance] Invalidating balance cache for:', publicKey);
      await queryClient.invalidateQueries({ queryKey: balanceKeys.byAddress(publicKey) });
    }
  };
}
