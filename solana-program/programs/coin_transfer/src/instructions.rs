//! Instruction handlers for the Coin Transfer program

use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::errors::TransferError;
use crate::state::ProgramState;

/// Initialize the program with optional state tracking
pub fn handle_initialize(ctx: Context<Initialize>) -> Result<()> {
    let state = &mut ctx.accounts.state;
    state.init(ctx.accounts.authority.key());
    
    msg!("Coin Transfer Program Initialized!");
    msg!("Authority: {}", ctx.accounts.authority.key());
    
    Ok(())
}

/// Transfer SOL from sender to recipient
pub fn handle_transfer_sol(ctx: Context<TransferSol>, amount: u64) -> Result<()> {
    // Validate amount is greater than 0
    require!(amount > 0, TransferError::InvalidAmount);

    let sender = &ctx.accounts.sender;
    let recipient = &ctx.accounts.recipient;

    // Check sender has enough balance
    let sender_balance = sender.lamports();
    require!(
        sender_balance >= amount,
        TransferError::InsufficientFunds
    );

    msg!("=== SOL Transfer ===");
    msg!("Amount: {} lamports ({} SOL)", amount, amount as f64 / 1_000_000_000.0);
    msg!("From: {}", sender.key());
    msg!("To: {}", recipient.key());

    // Execute the transfer using Solana's system program
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: sender.to_account_info(),
            to: recipient.to_account_info(),
        },
    );

    system_program::transfer(cpi_context, amount)?;

    msg!("Transfer successful! ✓");
    
    Ok(())
}

/// Get account balance (view function)
pub fn handle_get_balance(ctx: Context<GetBalance>) -> Result<u64> {
    let balance = ctx.accounts.account.lamports();
    msg!("Account: {}", ctx.accounts.account.key());
    msg!("Balance: {} lamports ({} SOL)", balance, balance as f64 / 1_000_000_000.0);
    Ok(balance)
}

 
// Account Contexts
 

/// Accounts required for program initialization
#[derive(Accounts)]
pub struct Initialize<'info> {
    /// Program state account (PDA)
    #[account(
        init,
        payer = authority,
        space = ProgramState::SIZE,
        seeds = [b"program_state"],
        bump
    )]
    pub state: Account<'info, ProgramState>,
    
    /// Authority initializing the program (pays for state account)
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// System program for account creation
    pub system_program: Program<'info, System>,
}

/// Accounts required for SOL transfer
#[derive(Accounts)]
pub struct TransferSol<'info> {
    /// The sender account (must sign the transaction)
    #[account(mut)]
    pub sender: Signer<'info>,
    
    /// The recipient account (receives SOL)
    /// CHECK: This account is only used to receive SOL, no validation needed
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    
    /// Solana System Program (required for native SOL transfers)
    pub system_program: Program<'info, System>,
}

/// Accounts required for balance query
#[derive(Accounts)]
pub struct GetBalance<'info> {
    /// CHECK: Any account can have its balance queried
    pub account: AccountInfo<'info>,
}
