use anchor_lang::prelude::*;

declare_id!("HJHqL1vC4UMEYrrNqBEwfeK3XcWV2V2ZkfAeYNCMLdSe");

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
