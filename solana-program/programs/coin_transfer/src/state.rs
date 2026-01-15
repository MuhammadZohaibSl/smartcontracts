//! Account state structures for the Coin Transfer program

use anchor_lang::prelude::*;

/// Program state account (optional - for tracking program metadata)
#[account]
pub struct ProgramState {
    /// Authority that initialized the program
    pub authority: Pubkey,
    
    /// Total number of transfers processed
    pub total_transfers: u64,
    
    /// Total volume of SOL transferred (in lamports)
    pub total_volume: u64,
    
    /// Program version
    pub version: u8,
    
    /// Reserved space for future upgrades
    pub _reserved: [u8; 64],
}

impl Default for ProgramState {
    fn default() -> Self {
        Self {
            authority: Pubkey::default(),
            total_transfers: 0,
            total_volume: 0,
            version: 0,
            _reserved: [0u8; 64],
        }
    }
}

impl ProgramState {
    /// Size of the ProgramState account in bytes
    pub const SIZE: usize = 8 + // discriminator
        32 + // authority
        8 +  // total_transfers
        8 +  // total_volume
        1 +  // version
        64;  // reserved

    /// Initialize new program state
    pub fn init(&mut self, authority: Pubkey) {
        self.authority = authority;
        self.total_transfers = 0;
        self.total_volume = 0;
        self.version = 1;
    }

    /// Record a transfer
    pub fn record_transfer(&mut self, amount: u64) {
        self.total_transfers = self.total_transfers.saturating_add(1);
        self.total_volume = self.total_volume.saturating_add(amount);
    }
}

/// Transfer record for tracking individual transfers (optional)
#[account]
pub struct TransferRecord {
    /// Sender public key
    pub sender: Pubkey,
    
    /// Recipient public key
    pub recipient: Pubkey,
    
    /// Amount transferred in lamports
    pub amount: u64,
    
    /// Unix timestamp of the transfer
    pub timestamp: i64,
    
    /// Bump seed for PDA
    pub bump: u8,
}

impl TransferRecord {
    /// Size of the TransferRecord account in bytes
    pub const SIZE: usize = 8 + // discriminator
        32 + // sender
        32 + // recipient
        8 +  // amount
        8 +  // timestamp
        1;   // bump
}
