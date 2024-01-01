import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import 'hardhat-gas-reporter';

require('dotenv').config();

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    gasReporter: {
        enabled: true,
    },
    networks: {
        sepolia: {
            url: process.env.INFURA_URL,
            accounts: [`0x${process.env.PRIVATE_KEY}`]
        }
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    }
};

export default config;