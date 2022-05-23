import {task} from "hardhat/config";
import {ethers} from "hardhat";

task("erc20.mint", "mint tokens")
    .addParam("contract", "contract address")
    .addParam("account", "mint to account")
    .addParam("amount", "mint tokens amount")
    .setAction(async (taskArgs, {ethers}) => {
        const [owner]  = await ethers.getSigners();
        const factory = await ethers.getContractFactory("ERC20MinterBurnable");
        const contract = await factory.attach(taskArgs.contract);
    
        const account: string = ethers.utils.getAddress(taskArgs.account);
        const amount: number = taskArgs.amount;
    
        await contract.connect(owner).mint(account, amount);
        console.log(`mint to ${account}, ${amount} tokens`);
        });