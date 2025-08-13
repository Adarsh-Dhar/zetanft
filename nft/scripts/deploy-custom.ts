import { ethers, upgrades } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();

  if (!signer) {
    throw new Error("No signer found. Please set PRIVATE_KEY in .env file");
  }

  console.log("Deploying with signer:", signer.address);

  // Contract parameters
  const initialOwner = signer.address;
  const name = "ZetaChain Universal NFT";
  const symbol = "ZUNFT";
  const gatewayAddress = "0x6c533f7fe93fae114d0954697069df33c9b74fd7";
  const gas = ethers.BigNumber.from("500000");
  const uniswapRouterAddress = "0x2ca7d64A7EFE2D62A725E2B35Cf7230D6677FfEe";
  const solanaChainId = ethers.BigNumber.from("901"); // Solana mainnet chain ID

  console.log("Deployment parameters:");
  console.log("- Initial Owner:", initialOwner);
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Gateway:", gatewayAddress);
  console.log("- Gas:", gas.toString());
  console.log("- Uniswap Router:", uniswapRouterAddress);
  console.log("- Solana Chain ID:", solanaChainId.toString());

  // Get contract factory
  const Factory = await ethers.getContractFactory("ZetaChainUniversalNFT");

  console.log("Deploying proxy...");

  // Deploy proxy with all 7 parameters
  const proxy = await upgrades.deployProxy(
    Factory,
    [
      initialOwner,
      name,
      symbol,
      gatewayAddress,
      gas,
      uniswapRouterAddress,
      solanaChainId,
    ],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );

  await proxy.deployed();
  const proxyAddress = proxy.address;

  console.log("✅ ZetaChainUniversalNFT proxy deployed successfully!");
  console.log("📜 Proxy address:", proxyAddress);

  // Get implementation address
  const implAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );
  console.log("🔧 Implementation address:", implAddress);

  // Return in JSON format for the shell script
  console.log(
    JSON.stringify({
      contractAddress: proxyAddress,
      deployer: signer.address,
      implementationAddress: implAddress,
      network: ethers.provider.network?.name || "unknown",
    })
  );
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
