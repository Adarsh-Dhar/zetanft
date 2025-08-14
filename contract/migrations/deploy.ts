// Deploy script for the ZetaChain Gateway program
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ZetachainGateway } from "../target/types/zetachain_gateway";

module.exports = async function (provider: anchor.AnchorProvider) {
  // Configure client to use the provider.
  anchor.setProvider(provider);

  console.log("🚀 Deploying ZetaChain Gateway program...");
  
  try {
    // Get the program instance
    const program = anchor.workspace.ZetachainGateway as Program<ZetachainGateway>;
    
    console.log("Program ID:", program.programId.toString());
    console.log("Provider wallet:", provider.wallet.publicKey.toString());
    
    // Check if the program is already deployed
    const connection = provider.connection;
    const programInfo = await connection.getAccountInfo(program.programId);
    
    if (programInfo) {
      console.log("✅ Program is already deployed!");
      return;
    }
    
    console.log("⚠️  Program not found on network. Please run 'anchor deploy' first.");
    console.log("💡 Make sure you have SOL in your wallet for deployment fees.");
    
  } catch (error) {
    console.error("❌ Deployment check failed:", error);
    throw error;
  }
};
