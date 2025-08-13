import "@nomicfoundation/hardhat-toolbox";
import "@zetachain/standard-contracts/tasks/nft";
import "@zetachain/toolkit/tasks";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";

import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 20,
      },
    },
    athens_testnet: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 7001,
      gasPrice: 20000000000,
      url:
        process.env.RPC_URL ||
        "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
    },
    base_sepolia: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
      gasPrice: 1000000000,
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    },
    bsc_testnet: {
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 97,
      gasPrice: 1000000000,
      url:
        process.env.BSC_TESTNET_RPC_URL ||
        "https://data-seed-prebsc-1-s1.binance.org:8545",
    },
  },
  solidity: {
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
    version: "0.8.26",
  },
};

export default config;
