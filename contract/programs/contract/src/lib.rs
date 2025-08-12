use anchor_lang::prelude::*;

declare_id!("4fGrHJbLbG5pRHQsvkMpFWPZ5QEY89RW1goNDAEm7u5w");

#[program]
pub mod contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
