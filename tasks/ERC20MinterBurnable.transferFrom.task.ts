import {task} from "hardhat/config";
import {ethers} from "hardhat";

task("erc20.transferFrom", "transfer from account tokens")
    .addParam("contract", "contract address")
    .addParam("from", "from address")
    .addParam("to", "to address")
    .addParam("amount", "transfer tokens amount")
    .setAction(async (taskArgs, {ethers}) => {
        const [owner]  = await ethers.getSigners();
        const factory = await ethers.getContractFactory("ERC20MinterBurnable");
        const contract = await factory.attach(taskArgs.contract);

        const from: string = ethers.utils.getAddress(taskArgs.from);
        const to: string = ethers.utils.getAddress(taskArgs.to);
        const amount: number = taskArgs.amount;

        await contract.connect(owner).transferFrom(from, to, amount);
        console.log(`transfer from ${from} to ${to}, ${amount} tokens`);
    });