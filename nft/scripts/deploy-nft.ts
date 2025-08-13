import * as dotenv from "dotenv";
import { ethers, upgrades } from "hardhat";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    throw new Error("No deployer account found");
  }

  console.log("Deploying NFT contract with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Contract parameters
  const name = "ZetaChainUniversalNFT";
  const symbol = "UNFT";
  const gatewayAddress =
    process.env.GATEWAY_ADDRESS ||
    "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
  const gasLimit = "500000";
  const uniswapRouterAddress =
    process.env.UNISWAP_ROUTER ||
    "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
  const solanaChainId = process.env.SOLANA_CHAIN_ID || "101";

  console.log("Contract parameters:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Gateway:", gatewayAddress);
  console.log("- Gas Limit:", gasLimit);
  console.log("- Uniswap Router:", uniswapRouterAddress);
  console.log("- Solana Chain ID:", solanaChainId);

  // Get the contract factory for our local contract
  const NFTContract = await ethers.getContractFactory("ZetaChainUniversalNFT");

  // Deploy the contract with all required parameters
  const contract = await upgrades.deployProxy(NFTContract, [
    deployer.address, // initialOwner
    name, // name
    symbol, // symbol
    gatewayAddress, // gatewayAddress
    gasLimit, // gas
    uniswapRouterAddress, // uniswapRouterAddress
    solanaChainId, // _solanaChainId
  ]);

  await contract.deployed();

  console.log("🚀 NFT contract deployed successfully!");
  console.log("📜 Contract address:", contract.address);
  console.log("👤 Deployer:", deployer.address);
  console.log("🌐 Network:", (await ethers.provider.getNetwork()).name);

  // Output in JSON format for the script
  console.log(
    JSON.stringify({
      contractAddress: contract.address,
      deployer: deployer.address,
      gasUsed: "0", // We don't have the receipt yet
      network: (await ethers.provider.getNetwork()).name,
    })
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
