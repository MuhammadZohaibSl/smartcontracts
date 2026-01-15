/**
 * Formatters Utility Module
 * 
 * Functions for formatting addresses, amounts, and other display values.
 */

import { PublicKey } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '../config/constants';

/**
 * Format a Solana address for display
 * @param address - The address to format (string or PublicKey)
 * @param startChars - Number of characters to show at start
 * @param endChars - Number of characters to show at end
 * @returns Truncated address string (e.g., "ABC1...XYZ4")
 */
export function formatAddress(
  address: string | PublicKey,
  startChars: number = 6,
  endChars: number = 4
): string {
  const str = typeof address === 'string' ? address : address.toBase58();
  
  if (str.length <= startChars + endChars + 3) {
    return str;
  }
  
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}

/**
 * Format SOL balance for display
 * @param balance - Balance in SOL
 * @param decimals - Number of decimal places
 * @returns Formatted balance string
 */
export function formatBalance(balance: number, decimals: number = 4): string {
  return balance.toFixed(decimals);
}

/**
 * Format lamports to SOL
 * @param lamports - Amount in lamports
 * @param decimals - Number of decimal places
 * @returns Balance in SOL
 */
export function lamportsToSol(lamports: number, decimals: number = 9): number {
  return Number((lamports / LAMPORTS_PER_SOL).toFixed(decimals));
}

/**
 * Format SOL to lamports
 * @param sol - Amount in SOL
 * @returns Amount in lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL);
}

/**
 * Format USD value
 * @param amount - Amount in USD
 * @param showCents - Whether to show cents
 * @returns Formatted USD string
 */
export function formatUSD(amount: number, showCents: boolean = true): string {
  if (showCents) {
    return `$${amount.toFixed(2)}`;
  }
  return `$${Math.floor(amount).toLocaleString()}`;
}

/**
 * Format SOL to estimated USD value
 * @param solAmount - Amount in SOL
 * @param solPrice - Current SOL price in USD (default: ~$100 for devnet display)
 * @returns Formatted USD string
 */
export function formatSolToUSD(solAmount: number, solPrice: number = 100): string {
  const usdValue = solAmount * solPrice;
  return formatUSD(usdValue);
}

/**
 * Format a transaction signature for display
 * @param signature - The transaction signature
 * @param length - Number of characters to show
 * @returns Truncated signature
 */
export function formatSignature(signature: string, length: number = 24): string {
  if (signature.length <= length) {
    return signature;
  }
  return `${signature.slice(0, length)}...`;
}

/**
 * Format timestamp to readable date
 * @param timestamp - Unix timestamp in seconds or milliseconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  // Handle both seconds and milliseconds
  const date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 minutes ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}
