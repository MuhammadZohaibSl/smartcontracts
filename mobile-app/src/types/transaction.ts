/**
 * Transaction Types
 * 
 * Type definitions for transaction-related functionality.
 */

/**
 * Transaction execution result
 */
export interface TransactionResult {
  /** Transaction signature */
  signature: string;
  /** Whether transaction was successful */
  success: boolean;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Transaction status
 */
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FINALIZED = 'finalized',
  FAILED = 'failed',
}

/**
 * Transaction type
 */
export enum TransactionType {
  TRANSFER = 'transfer',
  AIRDROP = 'airdrop',
  PROGRAM_CALL = 'program_call',
}

/**
 * Transaction record for history
 */
export interface TransactionRecord {
  /** Transaction signature */
  signature: string;
  /** Transaction type */
  type: TransactionType;
  /** Amount in SOL (if applicable) */
  amount?: number;
  /** Recipient address (for transfers) */
  to?: string;
  /** Sender address (for transfers) */
  from?: string;
  /** Transaction status */
  status: TransactionStatus;
  /** Timestamp */
  timestamp: number;
  /** Network fee in SOL */
  fee?: number;
}

/**
 * Transfer parameters
 */
export interface TransferParams {
  /** Recipient wallet address */
  recipient: string;
  /** Amount in SOL */
  amount: number;
}

/**
 * Airdrop parameters
 */
export interface AirdropParams {
  /** Amount in SOL to request */
  amount: number;
}

/**
 * Transaction confirmation options
 */
export interface ConfirmationOptions {
  /** Confirmation commitment level */
  commitment: 'processed' | 'confirmed' | 'finalized';
  /** Timeout in milliseconds */
  timeout?: number;
}
