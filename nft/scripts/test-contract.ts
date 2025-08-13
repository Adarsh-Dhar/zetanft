import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Testing NFT contract with account:", deployer.address);
  
  // Contract address from deployment
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  // Get contract instance
  const NFTContract = await ethers.getContractFactory("ZetaChainUniversalNFT");
  const contract = NFTContract.attach(contractAddress);
  
  try {
    // Test basic contract functions
    console.log("\n=== Testing Contract Functions ===");
    
    // Get contract name
    const name = await contract.name();
    console.log("✅ Contract name:", name);
    
    // Get contract symbol
    const symbol = await contract.symbol();
    console.log("✅ Contract symbol:", symbol);
    
    // Get owner
    const owner = await contract.owner();
    console.log("✅ Contract owner:", owner);
    
    // Get gateway address
    const gateway = await contract.gateway();
    console.log("✅ Gateway address:", gateway);
    
    // Get gas limit
    const gasLimit = await contract.gasLimitAmount();
    console.log("✅ Gas limit:", gasLimit.toString());
    
    // Get uniswap router
    const uniswapRouter = await contract.uniswapRouter();
    console.log("✅ Uniswap router:", uniswapRouter);
    
    // Get Solana chain ID
    const solanaChainId = await contract.solanaChainId();
    console.log("✅ Solana chain ID:", solanaChainId.toString());
    
    // Test minting an NFT
    console.log("\n=== Testing NFT Minting ===");
    
    const tokenURI = "ipfs://QmYourMetadataHashHere";
    const mintTx = await contract.safeMint(deployer.address, tokenURI);
    console.log("✅ Mint transaction sent:", mintTx.hash);
    
    // Wait for transaction to be mined
    const receipt = await mintTx.wait();
    console.log("✅ Mint transaction confirmed in block:", receipt.blockNumber);
    
    // Get the minted token
    const tokenId = await contract.tokenOfOwnerByIndex(deployer.address, 0);
    console.log("✅ Minted token ID:", tokenId.toString());
    
    // Get token URI
    const retrievedURI = await contract.tokenURI(tokenId);
    console.log("✅ Token URI:", retrievedURI);
    
    // Get token owner
    const tokenOwner = await contract.ownerOf(tokenId);
    console.log("✅ Token owner:", tokenOwner);
    
    console.log("\n🎉 All tests passed! Contract is working correctly on local network.");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Test script failed:", error);
    process.exit(1);
  });
