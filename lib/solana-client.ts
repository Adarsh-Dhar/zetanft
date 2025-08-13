import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import IDL from '../contract/target/idl/zetachain_gateway.json'

export class SolanaClient {
  private connection: Connection
  private provider: AnchorProvider
  private program: Program | null
  private programId: PublicKey

  constructor(wallet: any, network: 'devnet' | 'mainnet-beta' = 'devnet') {
    try {
      this.connection = new Connection(
        network === 'devnet' 
          ? 'https://api.devnet.solana.com' 
          : 'https://api.mainnet-beta.solana.com'
      )
      
      this.provider = new AnchorProvider(
        this.connection,
        wallet,
        { commitment: 'confirmed' }
      )
      
      // Store the program ID from the IDL
      this.programId = new PublicKey(IDL.address)
      
      // Initialize program as null initially
      this.program = null
      
      console.log('SolanaClient initialized successfully')
    } catch (error) {
      console.error('Failed to create SolanaClient:', error)
      throw new Error(`Failed to initialize Solana client: ${error}`)
    }
  }

  // Method to initialize the program after client creation
  async initializeProgram() {
    try {
      // Create the program instance with correct constructor signature for Anchor 0.31.1
      // Using the correct pattern: new Program(idl, programId, provider)
      this.program = new Program(IDL as Idl, this.provider)
      
      console.log('Program initialized successfully:', this.programId.toString())
      return true
    } catch (error) {
      console.error('Failed to initialize program:', error)
      return false
    }
  }

  async depositSolForNFT(
    recipientAddress: string, // ZetaChain address (20 bytes)
    metadataUri: string,
    amount: number = 0.01 // SOL amount
  ) {
    try {
      // Check if program is initialized
      if (!this.program) {
        throw new Error('Program not initialized. Please call initializeProgram() first.')
      }

      // Convert recipient address to bytes array (20 bytes)
      const recipientBytes = this.hexToBytes(recipientAddress)
      
      // Create the message payload that matches your ZetaChain contract
      const messagePayload = {
        recipient: recipientBytes,
        metadata_uri: metadataUri,
        unique_id: this.generateUniqueId()
      }
      
      // Serialize the message payload
      const message = this.serializeMessage(messagePayload)
      
      // Get config account PDA
      const configPda = await this.getConfigAccount()
      
      // Call your existing deposit_and_call function
      const tx = await this.program.methods
        .depositAndCall(
          new BN(7001), // ZetaChain chain ID (from contract)
          recipientBytes,
          new BN(amount * LAMPORTS_PER_SOL), // Convert SOL to lamports
          message
        )
        .accounts({
          user: this.provider.wallet.publicKey,
          config: configPda,
          gateway_program: new PublicKey('11111111111111111111111111111111'), // TODO: Replace with actual ZetaChain gateway program ID when known
          system_program: SystemProgram.programId,
        })
        .rpc()

      return { success: true, txHash: tx }
    } catch (error) {
      console.error('Deposit failed:', error)
      throw error
    }
  }

  async depositSplTokenForNFT(
    mint: PublicKey,
    recipientAddress: string,
    metadataUri: string,
    amount: number
  ) {
    try {
      if (!this.program) {
        throw new Error('Program not initialized. Please call initializeProgram() first.')
      }

      const recipientBytes = this.hexToBytes(recipientAddress)
      
      const messagePayload = {
        recipient: recipientBytes,
        metadata_uri: metadataUri,
        unique_id: this.generateUniqueId()
      }
      
      const message = this.serializeMessage(messagePayload)
      const configPda = await this.getConfigAccount()
      
      // Get the user's token account
      const userTokenAccount = await this.getAssociatedTokenAccount(mint, this.provider.wallet.publicKey)
      
      // Get or create custody token account
      const custodyTokenAccount = await this.getCustodyTokenAccount(mint, configPda)
      
      const tx = await this.program.methods
        .depositSplTokenAndCall(
          mint,
          new BN(7001), // ZetaChain chain ID (from contract)
          recipientBytes,
          new BN(amount),
          message
        )
        .accounts({
          user: this.provider.wallet.publicKey,
          config: configPda,
          mint: mint,
          source_token_account: userTokenAccount,
          custody_token_account: custodyTokenAccount,
          gateway_program: new PublicKey('11111111111111111111111111111111'), // TODO: Replace with actual ZetaChain gateway program ID when known
          token_program: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // SPL Token Program
          associated_token_program: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'), // Associated Token Program
          system_program: SystemProgram.programId,
        })
        .rpc()

      return { success: true, txHash: tx }
    } catch (error) {
      console.error('SPL Token deposit failed:', error)
      throw error
    }
  }

  async withdrawFromZetaChain(
    recipient: PublicKey,
    amount: number,
    message: string
  ) {
    try {
      if (!this.program) {
        throw new Error('Program not initialized. Please call initializeProgram() first.')
      }

      const configPda = await this.getConfigAccount()
      
      const tx = await this.program.methods
        .withdrawAndCall(
          recipient,
          new BN(amount * LAMPORTS_PER_SOL),
          new TextEncoder().encode(message)
        )
        .accounts({
          user: this.provider.wallet.publicKey,
          config: configPda,
          gateway_program: new PublicKey('11111111111111111111111111111111'), // TODO: Replace with actual ZetaChain gateway program ID when known
        })
        .rpc()

      return { success: true, txHash: tx }
    } catch (error) {
      console.error('Withdrawal failed:', error)
      throw error
    }
  }

  async getConfigAccount(): Promise<PublicKey> {
    if (!this.program) {
      throw new Error('Program not initialized')
    }
    
    // Get config account PDA - matches your lib.rs seeds
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      this.program.programId
    )
    return configPda
  }

  async getAssociatedTokenAccount(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    const [ata] = PublicKey.findProgramAddressSync(
      [
        owner.toBuffer(),
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(),
        mint.toBuffer(),
      ],
      new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    )
    return ata
  }

  async getCustodyTokenAccount(mint: PublicKey, config: PublicKey): Promise<PublicKey> {
    // This should match the PDA seeds from your IDL
    const [custodyAccount] = PublicKey.findProgramAddressSync(
      [
        config.toBuffer(),
        Buffer.from([
          6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206, 235, 121, 172,
          28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245, 133, 126, 255, 0, 169
        ]),
        mint.toBuffer(),
      ],
      new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    )
    return custodyAccount
  }

  async getBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.provider.wallet.publicKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Failed to get balance:', error)
      return 0
    }
  }

  private hexToBytes(hex: string): number[] {
    try {
      if (hex.startsWith('0x')) {
        hex = hex.slice(2)
      }
      const bytes = []
      for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16))
      }
      return bytes
    } catch (error) {
      console.error('Failed to convert hex to bytes:', error)
      return new Array(20).fill(0) // Return 20 zero bytes as fallback
    }
  }

  private serializeMessage(payload: any): Uint8Array {
    try {
      return new TextEncoder().encode(JSON.stringify(payload))
    } catch (error) {
      console.error('Failed to serialize message:', error)
      return new Uint8Array()
    }
  }

  private generateUniqueId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // Get program info
  getProgramId(): PublicKey {
    return this.programId
  }

  // Get provider
  getProvider(): AnchorProvider {
    return this.provider
  }

  // Get connection
  getConnection(): Connection {
    return this.connection
  }

  // Check if program is initialized
  isProgramInitialized(): boolean {
    return this.program !== null
  }
}