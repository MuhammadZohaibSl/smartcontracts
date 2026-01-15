//! Coin Transfer Program
//! 
//! A simple Solana program for transferring SOL between accounts.
//! Built with the Anchor framework.
//!
//! ## Modules
//! - `errors` - Custom error codes
//! - `state` - Account state structures  
//! - `instructions` - Instruction handlers

use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::*;

declare_id!("HFE4phQSrBXbNakK2ddAcPGmo5Tm5C9z8difCcf4Cjgq");

/// Coin Transfer Program
/// 
/// Provides simple SOL transfer functionality on the Solana blockchain.
#[program]
pub mod coin_transfer {
    use super::*;

    /// Initialize the program
    /// 
    /// Creates a program state account to track transfer statistics.
    /// Should only be called once by the program authority.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::handle_initialize(ctx)
    }

    /// Transfer SOL from sender to recipient
    /// 
    /// # Arguments
    /// * `ctx` - The context containing sender, recipient, and system program
    /// * `amount` - The amount of lamports (1 SOL = 1,000,000,000 lamports)
    /// 
    /// # Errors
    /// * `InvalidAmount` - If amount is 0
    /// * `InsufficientFunds` - If sender doesn't have enough SOL
    pub fn transfer_sol(ctx: Context<TransferSol>, amount: u64) -> Result<()> {
        instructions::handle_transfer_sol(ctx, amount)
    }

    /// Get the balance of an account
    /// 
    /// # Arguments
    /// * `ctx` - The context containing the account to query
    /// 
    /// # Returns
    /// * The balance in lamports
    pub fn get_balance(ctx: Context<GetBalance>) -> Result<u64> {
        instructions::handle_get_balance(ctx)
    }
}
