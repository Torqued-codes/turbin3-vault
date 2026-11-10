use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use crate::state::Escrow;

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    pub receive_mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        has_one = maker,
        has_one = receive_mint,
        seeds = [b"escrow", maker.key().as_ref(), escrow.seed.to_le_bytes().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, Escrow>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl<'info> Update<'info> {
    pub fn update(&mut self, receive: u64) -> Result<()> {
        self.escrow.receive = receive;
        Ok(())
    }
}