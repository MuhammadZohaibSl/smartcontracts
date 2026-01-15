//! Custom error codes for the Coin Transfer program

use anchor_lang::prelude::*;

/// Custom error codes for transaction failures
#[error_code]
pub enum TransferError {
    /// Transfer amount must be greater than 0
    #[msg("Transfer amount must be greater than 0")]
    InvalidAmount,

    /// Sender has insufficient funds for this transfer
    #[msg("Sender has insufficient funds for this transfer")]
    InsufficientFunds,

    /// Invalid recipient address provided
    #[msg("Invalid recipient address")]
    InvalidRecipient,

    /// Unauthorized operation attempted
    #[msg("Unauthorized: Signer does not have permission")]
    Unauthorized,
}
