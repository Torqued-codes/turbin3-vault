pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("13tBDvGdSY5VXCKBwVuX5hWzGXLgegWXg52qkSdg6v8Q");

#[program]
pub mod anchor_escrow_q2_2026 {
    use super::*;

    pub fn make(
        ctx: Context<Make>,
        seed: u64,
        deposit: u64,
        receive: u64,
        expiration: i64,
    ) -> Result<()> {
        ctx.accounts.init_escrow(seed, receive, &ctx.bumps, expiration)?;
        ctx.accounts.deposit(deposit)
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.check_expiration()?;
        ctx.accounts.deposit()?;
        ctx.accounts.withdraw_and_close_vault()
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.refund_and_close_vault()
    }
}
