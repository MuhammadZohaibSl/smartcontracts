/**
 * Validators Utility Module
 * 
 * Functions for validating user input and data.
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Validate a Solana public key address
 * @param address - The address to validate
 * @returns Whether the address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  try {
    // PublicKey constructor will throw if invalid
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate a transaction amount
 * @param amount - The amount to validate
 * @param balance - Current wallet balance (optional, for balance check)
 * @param minAmount - Minimum allowed amount (default: 0)
 * @returns Validation result object
 */
export function validateAmount(
  amount: string | number,
  balance?: number,
  minAmount: number = 0
): { valid: boolean; error?: string } {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (numAmount <= minAmount) {
    return { valid: false, error: `Amount must be greater than ${minAmount}` };
  }
  
  if (balance !== undefined && numAmount > balance) {
    return { valid: false, error: 'Insufficient balance' };
  }
  
  // Check for reasonable precision (max 9 decimal places for SOL)
  const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
  if (decimalPlaces > 9) {
    return { valid: false, error: 'Too many decimal places' };
  }
  
  return { valid: true };
}

/**
 * Validate a minimum balance check (for rent-exempt accounts)
 * @param balance - Current balance
 * @param requiredAmount - Amount to send
 * @param feeBuffer - Fee buffer in SOL (default: 0.001)
 * @returns Whether balance is sufficient
 */
export function hasSufficientBalance(
  balance: number,
  requiredAmount: number,
  feeBuffer: number = 0.001
): boolean {
  return balance >= requiredAmount + feeBuffer;
}

/**
 * Sanitize user input for display
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate numeric input (for amount fields)
 * @param input - The input string
 * @returns Whether input is valid numeric format
 */
export function isValidNumericInput(input: string): boolean {
  if (input === '' || input === '.') {
    return true; // Allow empty and starting with decimal
  }
  
  // Allow numbers with optional decimal
  return /^\d*\.?\d*$/.test(input);
}

/**
 * Parse and validate amount input
 * @param input - The input string
 * @returns Parsed number or null if invalid
 */
export function parseAmountInput(input: string): number | null {
  if (!input || input === '.' || input === '') {
    return null;
  }
  
  const parsed = parseFloat(input);
  return isNaN(parsed) ? null : parsed;
}
