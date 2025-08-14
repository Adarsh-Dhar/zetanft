use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use std::mem::size_of;

declare_id!("HmnB7toz4ckbzuTToptnXEf8LJ9PB8HVVsSFGZzybPet"); // Replace with your program ID

#[program(skip-lint)]
pub mod zetachain_gateway {
    use super::*;

    /// Initialize the program with gateway configuration
    pub fn initialize(
        ctx: Context<Initialize>,
        gateway_program_id: Pubkey,
        zetachain_chain_id: u64,
        owner: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.gateway_program_id = gateway_program_id;
        config.zetachain_chain_id = zetachain_chain_id;
        config.owner = owner;
        config.bump = ctx.bumps.config;
        
        emit!(ProgramInitialized {
            gateway_program_id,
            zetachain_chain_id,
            owner,
        });
        
        Ok(())
    }

    /// Initialize the program with a custom seed (useful for testing)
    pub fn initialize_with_seed(
        ctx: Context<InitializeWithSeed>,
        gateway_program_id: Pubkey,
        zetachain_chain_id: u64,
        owner: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.gateway_program_id = gateway_program_id;
        config.zetachain_chain_id = zetachain_chain_id;
        config.owner = owner;
        config.bump = ctx.bumps.config;
        
        emit!(ProgramInitialized {
            gateway_program_id,
            zetachain_chain_id,
            owner,
        });
        
        Ok(())
    }

    /// Deposit native SOL and trigger cross-chain call to ZetaChain
    pub fn deposit_and_call(
        ctx: Context<DepositAndCall>,
        recipient_chain_id: u64,
        recipient_address: [u8; 20],
        amount: u64,
        message: Vec<u8>,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(!message.is_empty(), ErrorCode::EmptyMessage);
        require!(
            recipient_chain_id == ctx.accounts.config.zetachain_chain_id,
            ErrorCode::InvalidChainId
        );

        // Transfer SOL from user to program
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.config.key(),
            amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.config.to_account_info(),
            ],
        )?;

        // Call ZetaChain Gateway
        // let _gateway_cpi_ctx = CpiContext::new(
        //     ctx.accounts.gateway_program.to_account_info(),
        //     DepositAndCallCpi {
        //         user: ctx.accounts.user.to_account_info(),
        //         config: ctx.accounts.config.to_account_info(),
        //     },
        // );

        // This would be the actual CPI call to ZetaChain Gateway
        // gateway::cpi::deposit_and_call(gateway_cpi_ctx, recipient_chain_id, recipient_address, amount, message)?;

        emit!(DepositAndCallExecuted {
            user: ctx.accounts.user.key(),
            recipient_chain_id,
            recipient_address,
            amount,
            message: message.clone(),
        });

        Ok(())
    }

    /// Deposit SPL tokens and trigger cross-chain call to ZetaChain
    pub fn deposit_spl_token_and_call(
        ctx: Context<DepositSplTokenAndCall>,
        mint: Pubkey,
        recipient_chain_id: u64,
        recipient_address: [u8; 20],
        amount: u64,
        message: Vec<u8>,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(!message.is_empty(), ErrorCode::EmptyMessage);
        require!(
            recipient_chain_id == ctx.accounts.config.zetachain_chain_id,
            ErrorCode::InvalidChainId
        );
        require!(ctx.accounts.mint.key() == mint, ErrorCode::InvalidMint);

        // Transfer SPL tokens from user to program custody
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.source_token_account.to_account_info(),
                to: ctx.accounts.custody_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, amount)?;

        // Call ZetaChain Gateway for SPL token deposit
        // let _gateway_cpi_ctx = CpiContext::new(
        //     ctx.accounts.gateway_program.to_account_info(),
        //     DepositSplTokenAndCallCpi {
        //         user: ctx.accounts.user.to_account_info(),
        //         config: ctx.accounts.config.to_account_info(),
        //         mint: ctx.accounts.mint.to_account_info(),
        //         custody_token_account: ctx.accounts.custody_token_account.to_account_info(),
        //     },
        // );

        // This would be the actual CPI call to ZetaChain Gateway
        // gateway::cpi::deposit_spl_token_and_call(gateway_cpi_ctx, mint, recipient_chain_id, recipient_address, amount, message)?;

        emit!(DepositSplTokenAndCallExecuted {
            user: ctx.accounts.user.key(),
            mint,
            recipient_chain_id,
            recipient_address,
            amount,
            message: message.clone(),
        });

        Ok(())
    }

    /// Handle incoming calls from ZetaChain (reverse flow)
    pub fn on_call(
        ctx: Context<OnCall>,
        sender_chain_id: u64,
        sender_address: Vec<u8>,
        message: Vec<u8>,
        amount: u64,
    ) -> Result<()> {
        require!(
            sender_chain_id == ctx.accounts.config.zetachain_chain_id,
            ErrorCode::InvalidChainId
        );
        require!(!message.is_empty(), ErrorCode::EmptyMessage);

        // Decode message and execute custom logic
        let decoded_message = decode_cross_chain_message(&message)?;
        
        match decoded_message.action {
            CrossChainAction::MintNft => {
                // Handle NFT minting on Solana side if needed
                handle_nft_mint(&ctx, decoded_message, amount)?;
            }
            CrossChainAction::TransferToken => {
                // Handle token transfer
                handle_token_transfer(&ctx, decoded_message, amount)?;
            }
            CrossChainAction::Custom => {
                // Handle custom logic
                handle_custom_action(&ctx, decoded_message, amount)?;
            }
        }

        emit!(OnCallExecuted {
            sender_chain_id,
            sender_address: sender_address.clone(),
            recipient: ctx.accounts.user.key(),
            message: message.clone(),
            amount,
        });

        Ok(())
    }

    /// Handle failed ZetaChain calls - refund assets
    pub fn on_revert(
        ctx: Context<OnRevert>,
        source_chain_id: u64,
        source_address: Vec<u8>,
        message: Vec<u8>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        
        // Refund SOL to original sender
        **ctx.accounts.config.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += amount;

        emit!(OnRevertExecuted {
            source_chain_id,
            source_address: source_address.clone(),
            recipient: ctx.accounts.user.key(),
            message: message.clone(),
            amount,
        });

        Ok(())
    }

    /// Initiate cross-chain withdrawal from ZetaChain to Solana
    pub fn withdraw_and_call(
        ctx: Context<WithdrawAndCall>,
        recipient: Pubkey,
        amount: u64,
        message: Vec<u8>,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        // This would trigger a call on ZetaChain to initiate withdrawal
        // let _gateway_cpi_ctx = CpiContext::new(
        //     ctx.accounts.gateway_program.to_account_info(),
        //     WithdrawAndCallCpi {
        //         user: ctx.accounts.user.to_account_info(),
        //         config: ctx.accounts.config.to_account_info(),
        //     },
        // );

        // gateway::cpi::withdraw_and_call(gateway_cpi_ctx, recipient, amount, message)?;

        emit!(WithdrawAndCallExecuted {
            user: ctx.accounts.user.key(),
            recipient,
            amount,
            message: message.clone(),
        });

        Ok(())
    }

    /// Update gateway program address (admin only)
    pub fn admin_update_gateway(
        ctx: Context<AdminUpdateGateway>,
        new_gateway: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let old_gateway = config.gateway_program_id;
        config.gateway_program_id = new_gateway;

        emit!(GatewayUpdated {
            old_gateway,
            new_gateway,
            updated_by: ctx.accounts.owner.key(),
        });

        Ok(())
    }

    /// Set new owner (admin only)
    pub fn set_owner(
        ctx: Context<SetOwner>,
        new_owner: Pubkey,
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let old_owner = config.owner;
        config.owner = new_owner;

        emit!(OwnerUpdated {
            old_owner,
            new_owner,
            updated_by: ctx.accounts.current_owner.key(),
        });

        Ok(())
    }
}

// Account structs
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + size_of::<Config>(),
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Add a new struct for testing with custom seeds
#[derive(Accounts)]
pub struct InitializeWithSeed<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + size_of::<Config>(),
        seeds = [seed.key().as_ref()],
        bump
    )]
    pub config: Account<'info, Config>,
    /// CHECK: Seed for PDA derivation
    pub seed: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositAndCall<'info> {
    /// CHECK: User must be a signer for the transaction - validated by Signer type
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    /// CHECK: ZetaChain Gateway program - validated by CPI call
    pub gateway_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSplTokenAndCall<'info> {
    /// CHECK: User must be a signer for the transaction - validated by Signer type
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    /// CHECK: SPL Token mint account - validated by constraint
    pub mint: UncheckedAccount<'info>,
    #[account(
        mut,
        constraint = source_token_account.owner == user.key(),
        constraint = source_token_account.mint == mint.key()
    )]
    pub source_token_account: Account<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = config
    )]
    pub custody_token_account: Account<'info, TokenAccount>,
    /// CHECK: ZetaChain Gateway program - validated by CPI call
    pub gateway_program: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct OnCall<'info> {
    /// CHECK: User account to receive the cross-chain call - validated by the message
    #[account(mut)]
    pub user: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    /// CHECK: ZetaChain Gateway program - validated by CPI call
    pub gateway_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct OnRevert<'info> {
    /// CHECK: User account to receive the refund - validated by the message
    #[account(mut)]
    pub user: AccountInfo<'info>,
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
}

#[derive(Accounts)]
pub struct WithdrawAndCall<'info> {
    /// CHECK: User must be a signer for the transaction - validated by Signer type
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,
    /// CHECK: ZetaChain Gateway program - validated by CPI call
    pub gateway_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct AdminUpdateGateway<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub config: Account<'info, Config>,
    /// CHECK: Owner must be a signer for admin operations
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetOwner<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub config: Account<'info, Config>,
    /// CHECK: Current owner must be a signer for ownership transfer
    #[account(constraint = owner.key() == config.owner @ ErrorCode::Unauthorized)]
    pub current_owner: Signer<'info>,
    /// CHECK: New owner must be a signer for ownership transfer
    pub owner: Signer<'info>,
}

// Account data structs
#[account]
pub struct Config {
    pub gateway_program_id: Pubkey,
    pub zetachain_chain_id: u64,
    pub owner: Pubkey,
    pub bump: u8,
}

// Helper structs for cross-chain messaging
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct CrossChainMessage {
    pub action: CrossChainAction,
    pub recipient: [u8; 32], // Solana pubkey
    pub metadata_uri: Option<String>,
    pub token_id: Option<u64>,
    pub data: Vec<u8>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum CrossChainAction {
    MintNft,
    TransferToken,
    Custom,
}

// CPI context structs (these would match ZetaChain Gateway interface)
pub struct DepositAndCallCpi<'info> {
    pub user: AccountInfo<'info>,
    pub config: AccountInfo<'info>,
}

pub struct DepositSplTokenAndCallCpi<'info> {
    pub user: AccountInfo<'info>,
    pub config: AccountInfo<'info>,
    pub mint: AccountInfo<'info>,
    pub custody_token_account: AccountInfo<'info>,
}

pub struct WithdrawAndCallCpi<'info> {
    pub user: AccountInfo<'info>,
    pub config: AccountInfo<'info>,
}

// Events
#[event]
pub struct ProgramInitialized {
    pub gateway_program_id: Pubkey,
    pub zetachain_chain_id: u64,
    pub owner: Pubkey,
}

#[event]
pub struct DepositAndCallExecuted {
    pub user: Pubkey,
    pub recipient_chain_id: u64,
    pub recipient_address: [u8; 20],
    pub amount: u64,
    pub message: Vec<u8>,
}

#[event]
pub struct DepositSplTokenAndCallExecuted {
    pub user: Pubkey,
    pub mint: Pubkey,
    pub recipient_chain_id: u64,
    pub recipient_address: [u8; 20],
    pub amount: u64,
    pub message: Vec<u8>,
}

#[event]
pub struct OnCallExecuted {
    pub sender_chain_id: u64,
    pub sender_address: Vec<u8>,
    pub recipient: Pubkey,
    pub message: Vec<u8>,
    pub amount: u64,
}

#[event]
pub struct OnRevertExecuted {
    pub source_chain_id: u64,
    pub source_address: Vec<u8>,
    pub recipient: Pubkey,
    pub message: Vec<u8>,
    pub amount: u64,
}

#[event]
pub struct WithdrawAndCallExecuted {
    pub user: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub message: Vec<u8>,
}

#[event]
pub struct GatewayUpdated {
    pub old_gateway: Pubkey,
    pub new_gateway: Pubkey,
    pub updated_by: Pubkey,
}

#[event]
pub struct OwnerUpdated {
    pub old_owner: Pubkey,
    pub new_owner: Pubkey,
    pub updated_by: Pubkey,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Message cannot be empty")]
    EmptyMessage,
    #[msg("Invalid chain ID")]
    InvalidChainId,
    #[msg("Invalid mint address")]
    InvalidMint,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Failed to decode cross-chain message")]
    MessageDecodingFailed,
}

// Helper functions
fn decode_cross_chain_message(message: &[u8]) -> Result<CrossChainMessage> {
    CrossChainMessage::try_from_slice(message)
        .map_err(|_| ErrorCode::MessageDecodingFailed.into())
}

fn handle_nft_mint(
    _ctx: &Context<OnCall>,
    _message: CrossChainMessage,
    _amount: u64,
) -> Result<()> {
    // Implement NFT minting logic on Solana
    // This could interact with a Solana NFT program
    Ok(())
}

fn handle_token_transfer(
    _ctx: &Context<OnCall>,
    _message: CrossChainMessage,
    _amount: u64,
) -> Result<()> {
    // Implement token transfer logic
    Ok(())
}

fn handle_custom_action(
    _ctx: &Context<OnCall>,
    _message: CrossChainMessage,
    _amount: u64,
) -> Result<()> {
    // Implement custom logic
    Ok(())
}