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
      
      // Get config account PDA
      const configPda = await this.getConfigAccount()
      
      // Step 1: Deposit SOL first
      console.log('Step 1: Depositing SOL...')
      const depositTx = await this.program.methods
        .depositAndCall(
          new BN(7001), // ZetaChain chain ID (from contract)
          recipientBytes,
          new BN(amount * LAMPORTS_PER_SOL), // Convert SOL to lamports
          metadataUri,
          this.generateUniqueIdBytes()
        )
        .accounts({
          user: this.provider.wallet.publicKey,
          config: configPda,
          gatewayProgram: new PublicKey('ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis'), // TODO: Replace with actual ZetaChain gateway program ID when known
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      console.log('SOL deposit successful:', depositTx)

      // Step 2: Actually mint the NFT on ZetaChain
      console.log('Step 2: Minting NFT on ZetaChain...')
      const mintTx = await this.program.methods
        .mintNftOnZetaChain(
          recipientBytes,
          metadataUri,
          this.generateUniqueIdBytes()
        )
        .accounts({
          user: this.provider.wallet.publicKey,
          config: configPda,
          gatewayProgram: new PublicKey('ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis'), // TODO: Replace with actual ZetaChain gateway program ID when known
        })
        .rpc()

      console.log('NFT minting successful:', mintTx)

      return { 
        success: true, 
        depositTx: depositTx,
        mintTx: mintTx,
        message: 'SOL deposited and NFT minted successfully on ZetaChain'
      }
    } catch (error) {
      console.error('Deposit and mint failed:', error)
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
      
      // Create message payload for SPL token deposit
      const message = this.createMessagePayload(metadataUri, this.generateUniqueIdBytes())
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
          sourceTokenAccount: userTokenAccount,
          custodyTokenAccount: custodyTokenAccount,
          gatewayProgram: new PublicKey('ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis'), // TODO: Replace with actual ZetaChain gateway program ID when known
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // SPL Token Program
          associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'), // Associated Token Program
          systemProgram: SystemProgram.programId,
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
          gatewayProgram: new PublicKey('ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis'), // TODO: Replace with actual ZetaChain gateway program ID when known
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

  private hexToBytes(hex: string): Uint8Array {
    try {
      if (hex.startsWith('0x')) {
        hex = hex.slice(2)
      }
      const bytes = new Uint8Array(20) // Fixed size 20 bytes
      for (let i = 0; i < hex.length && i < 40; i += 2) { // Max 40 hex chars = 20 bytes
        bytes[i/2] = parseInt(hex.substr(i, 2), 16)
      }
      return bytes
    } catch (error) {
      console.error('Failed to convert hex to bytes:', error)
      return new Uint8Array(20) // Return 20 zero bytes as fallback
    }
  }

  private serializeMessage(payload: any): Buffer {
    try {
      return Buffer.from(JSON.stringify(payload))
    } catch (error) {
      console.error('Failed to serialize message:', error)
      return Buffer.alloc(0)
    }
  }

  private createMessagePayload(metadataUri: string, uniqueId: Uint8Array): Uint8Array {
    try {
      // Create message payload that matches the Rust contract format
      const message = new Uint8Array(0)
      
      // Add magic number to identify this as an NFT mint message
      const magicNumber = new TextEncoder().encode('NFT_MINT')
      message.set(magicNumber, 0)
      
      // Add metadata URI length and content
      const uriBytes = new TextEncoder().encode(metadataUri)
      const uriLength = new Uint8Array(4)
      new DataView(uriLength.buffer).setUint32(0, uriBytes.length, true) // little-endian
      
      // Add unique ID
      const fullMessage = new Uint8Array(magicNumber.length + 4 + uriBytes.length + uniqueId.length)
      fullMessage.set(magicNumber, 0)
      fullMessage.set(uriLength, magicNumber.length)
      fullMessage.set(uriBytes, magicNumber.length + 4)
      fullMessage.set(uniqueId, magicNumber.length + 4 + uriBytes.length)
      
      return fullMessage
    } catch (error) {
      console.error('Failed to create message payload:', error)
      return new Uint8Array(0)
    }
  }

  private generateUniqueId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  private generateUniqueIdBytes(): Uint8Array {
    try {
      // Generate a 32-byte unique ID
      const uniqueId = new Uint8Array(32)
      const timestamp = Date.now()
      const random = Math.random()
      
      // Use timestamp and random values to create unique ID
      const dataView = new DataView(uniqueId.buffer)
      dataView.setBigUint64(0, BigInt(timestamp), true)
      dataView.setFloat64(8, random, true)
      
      // Fill remaining bytes with random values
      for (let i = 16; i < 32; i++) {
        uniqueId[i] = Math.floor(Math.random() * 256)
      }
      
      return uniqueId
    } catch (error) {
      console.error('Failed to generate unique ID:', error)
      return new Uint8Array(32)
    }
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

  /**
   * Mint NFT on ZetaChain via Solana program
   */
  async mintNftOnZetaChain(
    recipientAddress: string,
    metadataUri: string,
    uniqueId: string,
    amount: number = 0
  ): Promise<string> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      // Convert recipient address to bytes (assuming it's an Ethereum address)
      const recipientBytes = new Uint8Array(20);
      if (recipientAddress.startsWith('0x')) {
        const addressBytes = Buffer.from(recipientAddress.slice(2), 'hex');
        recipientBytes.set(addressBytes);
      }
      
      // Convert unique ID to bytes
      const uniqueIdBytes = new Uint8Array(32);
      const idBytes = Buffer.from(uniqueId, 'hex');
      uniqueIdBytes.set(idBytes);
      
      // Get the config PDA
      const configPda = await this.getConfigAccount();
      
      // Call the mint_nft_on_zetachain instruction (no system program needed)
      const tx = await this.program.methods
        .mintNftOnZetaChain(recipientBytes, metadataUri, uniqueIdBytes)
        .accounts({
          user: this.provider.wallet.publicKey,
          config: configPda,
          gatewayProgram: new PublicKey('11111111111111111111111111111111'), // Placeholder
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error minting NFT on ZetaChain:', error);
      throw error;
    }
  }

  /**
   * Deposit SOL and mint NFT on ZetaChain
   */
  async depositAndMintNFT(
    recipientAddress: string,
    metadataUri: string,
    amount: number = 0.01
  ): Promise<{ success: boolean, depositTx: string, mintTx: string }> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      // Deposit SOL
      const depositTx = await this.depositSolForNFT(recipientAddress, metadataUri, amount);

      // Mint NFT on ZetaChain
      const mintTx = await this.mintNftOnZetaChain(recipientAddress, metadataUri, this.generateUniqueId());

      return { success: true, depositTx: depositTx.depositTx, mintTx: mintTx };
    } catch (error) {
      console.error('Error depositing and minting NFT:', error);
      throw error;
    }
  }

  /**
   * Initialize the program with gateway configuration
   */
  async initializeProgramWithConfig(
    gatewayProgramId: PublicKey,
    zetaChainChainId: number = 7001,
    owner: PublicKey
  ): Promise<string> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      const tx = await this.program.methods
        .initialize(
          gatewayProgramId,
          new BN(zetaChainChainId),
          owner
        )
        .accounts({
          config: await this.getConfigAccount(),
          payer: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error initializing program:', error);
      throw error;
    }
  }

  /**
   * Handle incoming calls from ZetaChain (reverse flow)
   */
  async handleIncomingCall(
    senderChainId: number,
    senderAddress: Uint8Array,
    message: Uint8Array,
    amount: number
  ): Promise<string> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      const configPda = await this.getConfigAccount();
      
      const tx = await this.program.methods
        .onCall(
          new BN(senderChainId),
          senderAddress,
          message,
          new BN(amount * LAMPORTS_PER_SOL)
        )
        .accounts({
          user: this.provider.wallet.publicKey,
          config: configPda,
          gatewayProgram: new PublicKey('11111111111111111111111111111111'), // Placeholder
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error handling incoming call:', error);
      throw error;
    }
  }

  /**
   * Handle failed ZetaChain calls - refund assets
   */
  async handleFailedCall(
    sourceChainId: number,
    sourceAddress: Uint8Array,
    message: Uint8Array,
    amount: number
  ): Promise<string> {
    if (!this.program) {
      throw new Error('Program not initialized');
    }

    try {
      const configPda = await this.getConfigAccount();
      
      const tx = await this.program.methods
        .onRevert(
          new BN(sourceChainId),
          sourceAddress,
          message,
          new BN(amount * LAMPORTS_PER_SOL)
        )
        .accounts({
          user: this.provider.wallet.publicKey,
          config: configPda,
        })
        .rpc();
      
      return tx;
    } catch (error) {
      console.error('Error handling failed call:', error);
      throw error;
    }
  }
}