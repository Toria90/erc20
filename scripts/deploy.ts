import { ethers } from "hardhat";
import {BigNumber} from "ethers";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contract with the account: ${deployer.address}`);
    
    const balance : BigNumber = await deployer.getBalance();
    console.log(`Account balance: ${balance.toString()}`);
    
    const factory = await ethers.getContractFactory("ERC20MinterBurnable");
    let contract = await factory.deploy("My Token", "MT", 6);
    console.log(`contract address: ${contract.address}`);
    console.log(`transaction Id: ${contract.deployTransaction.hash}`);
}

main()
.then(() => process.exit(0))
.catch((error) =>{
    console.error(error);
    process.exit(1);
});