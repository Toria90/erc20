import {task} from "hardhat/config";
import {ethers} from "hardhat";
import {BigNumber} from "ethers";

task("erc20.transfer", "transfer tokens")
    .addParam("contract", "contract address")
    .addParam("to", "to address")
    .addParam("amount", "transfer tokens amount")
    .setAction(async (taskArgs, {ethers}) => {
            const [owner]  = await ethers.getSigners();
            const factory = await ethers.getContractFactory("ERC20MinterBurnable");
            const contract = await factory.attach(taskArgs.contract);

            const to: string = ethers.utils.getAddress(taskArgs.to);
            const amount: number = taskArgs.amount;

            await contract.connect(owner).transfer(to, amount);
            console.log(`transfer to ${to}, ${amount} tokens`);
    });