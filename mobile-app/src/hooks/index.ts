/**
 * Hooks Module Index
 * 
 * Re-exports all custom hooks for easy importing.
 */

export { useSolana } from './useSolana';
export type { WalletState, TransactionResult } from './useSolana';

// New hooks with Zustand + TanStack Query
export { useWallet } from './useWallet';
export { useBalance, useBalanceByAddress, useInvalidateBalance, balanceKeys, getConnection, fetchBalance } from './useBalance';
