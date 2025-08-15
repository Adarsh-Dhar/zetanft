# Cross-Chain NFT Minting: Solana ↔ ZetaChain

This project demonstrates a complete cross-chain integration between Solana and ZetaChain for NFT minting. Users can trigger NFT minting on ZetaChain by calling a Solana program, showcasing true blockchain interoperability.

## 🏗️ Architecture Overview

```
┌─────────────┐    ┌─────────────────┐    ┌──────────────┐
│   Solana    │───▶│  ZetaChain      │───▶│   ZetaChain  │
│   Wallet    │    │   Gateway       │    │   NFT        │
│             │    │                 │    │   Contract   │
└─────────────┘    └─────────────────┘    └──────────────┘
```

## 🔧 How It Works

### 1. Solana Program (`lib.rs`)
The Solana program acts as the entry point for cross-chain NFT minting:

- **`deposit_and_call`**: Transfers SOL and triggers cross-chain call
- **`mint_nft_on_zetachain`**: Dedicated function for NFT minting
- **Message Encoding**: Creates properly formatted messages for ZetaChain

### 2. ZetaChain Contract (`ZetaChainUniversalNFT.sol`)
The ZetaChain contract receives cross-chain messages and mints NFTs:

- **`onMessageReceived`**: Handles incoming cross-chain messages
- **Message Decoding**: Parses Solana messages to extract NFT data
- **NFT Minting**: Creates new NFTs with provided metadata

### 3. Message Format
Messages follow a custom format for cross-chain communication:

```
[NFT_MINT][recipient:20bytes][uri_length:4bytes][uri][unique_id:32bytes]
```

## 🚀 Getting Started

### Prerequisites
- Solana CLI tools
- Node.js 18+
- Rust and Cargo
- Foundry (for ZetaChain contracts)

### 1. Deploy Solana Program
```bash
cd contract
anchor build
anchor deploy
```

### 2. Deploy ZetaChain Contract
```bash
cd nft
forge build
forge deploy --rpc-url <zetachain-rpc>
```

### 3. Initialize Solana Program
```typescript
const solanaClient = new SolanaClient(wallet)
await solanaClient.initialize()
```

## 📱 Usage Examples

### Mint NFT Only (No SOL Transfer)
```typescript
const txHash = await solanaClient.mintNftOnZetaChain(
  "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Ethereum address
  "https://example.com/metadata.json",               // Metadata URI
  "unique_nft_id_123"                               // Unique identifier
)
```

### Deposit SOL + Mint NFT
```typescript
const txHash = await solanaClient.depositAndMintNft(
  "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Ethereum address
  "https://example.com/metadata.json",               // Metadata URI
  "unique_nft_id_123",                              // Unique identifier
  0.01                                              // SOL amount
)
```

## 🔐 Security Features

- **Chain ID Validation**: Only accepts messages from configured ZetaChain
- **Unique ID Tracking**: Prevents duplicate NFT minting
- **Owner Controls**: Admin functions restricted to program owner
- **Message Validation**: Verifies message format and integrity

## 🌐 Cross-Chain Flow

1. **User Action**: User calls Solana program with NFT parameters
2. **SOL Transfer**: Program transfers SOL (if specified) to custody
3. **Message Creation**: Program encodes NFT minting data
4. **Gateway Call**: Program calls ZetaChain Gateway (placeholder)
5. **Cross-Chain**: Message travels to ZetaChain via gateway
6. **NFT Minting**: ZetaChain contract receives message and mints NFT
7. **Confirmation**: NFT is created with specified metadata

## 🧪 Testing

### Test Solana Program
```bash
cd contract
anchor test
```

### Test ZetaChain Contract
```bash
cd nft
forge test
```

### Integration Testing
```bash
# Test cross-chain flow end-to-end
npm run test:integration
```

## 🔧 Configuration

### Solana Program
- **Program ID**: `HmnB7toz4ckbzuTToptnXEf8LJ9PB8HVVsSFGZzybPet`
- **Config PDA**: `[b"config"]`
- **ZetaChain Chain ID**: Configurable via initialization

### ZetaChain Contract
- **Gateway Address**: Set during initialization
- **Solana Chain ID**: Must match Solana program configuration
- **Gas Limit**: Configurable for cross-chain calls

## 📊 Monitoring

### Events
- **`NftMintRequested`**: Emitted when Solana program receives mint request
- **`NFTMinted`**: Emitted when ZetaChain contract mints NFT
- **`DepositAndCallExecuted`**: Emitted when cross-chain call is initiated

### Transaction Tracking
- Monitor Solana transactions via Solana Explorer
- Track ZetaChain transactions via ZetaChain Explorer
- Cross-reference via unique message identifiers

## 🚨 Important Notes

1. **Gateway Integration**: Current implementation uses placeholder gateway calls
2. **Message Encoding**: Custom message format for demonstration purposes
3. **Error Handling**: Comprehensive error handling for cross-chain failures
4. **Gas Management**: ZetaChain gas costs for cross-chain operations

## 🔮 Future Enhancements

- [ ] Real ZetaChain Gateway integration
- [ ] ABI-compliant message encoding
- [ ] Cross-chain NFT transfers
- [ ] Multi-chain support (Ethereum, Polygon, etc.)
- [ ] Automated testing suite
- [ ] Gas optimization
- [ ] Batch operations

## 📚 Resources

- [Solana Documentation](https://docs.solana.com/)
- [ZetaChain Documentation](https://docs.zetachain.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Foundry Book](https://book.getfoundry.sh/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
