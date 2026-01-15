/**
 * Mobile Wallet Adapter (MWA) Service
 * 
 * Safely wraps MWA calls to prevent crashes in environments where
 * the native module is missing (like Expo Go).
 */

import { NativeModules } from 'react-native';
import { ClusterType } from '../../config/constants';

/**
 * Check if the Solana Mobile Wallet Adapter native module is available
 */
export const isMWAAvailable = (): boolean => {
  return !!NativeModules.SolanaMobileWalletAdapter;
};

/**
 * Safely get the transact function
 * This uses dynamic require to avoid top-level import crashes
 */
export const getMWATransact = () => {
  if (!isMWAAvailable()) {
    return null;
  }
  
  try {
    // We use require instead of import to delay loading until we know it's safe
    const { transact } = require('@solana-mobile/mobile-wallet-adapter-protocol-web3js');
    return transact;
  } catch (error) {
    console.warn('MWA library found but failed to load transact:', error);
    return null;
  }
};

/**
 * Unified MWA Action Wrapper
 */
export const runMWAAction = async <T>(
  action: (wallet: any) => Promise<T>,
  config: { cluster: ClusterType; identity: any; authToken?: string }
): Promise<T | null> => {
  const transact = getMWATransact();
  
  if (!transact) {
    throw new Error('Mobile Wallet Adapter is not available in this environment.');
  }

  return await transact(async (wallet: any) => {
    // Authorize
    await wallet.authorize({
      cluster: config.cluster,
      identity: config.identity,
      auth_token: config.authToken,
    });
    
    // Run action
    return await action(wallet);
  });
};
