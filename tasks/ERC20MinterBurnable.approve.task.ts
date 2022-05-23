import {task} from "hardhat/config";
import {ethers} from "hardhat";
import {BigNumber} from "ethers";

task("erc20.approve", "approve to send tokens")
    .addParam("contract", "contract address")
    .addParam("spender", "spender address")
    .addParam("amount", "approve tokens amount")
    .setAction(async (taskArgs, {ethers}) => {
        const [owner]  = await ethers.getSigners();
        const factory = await ethers.getContractFactory("ERC20MinterBurnable");
        const contract = await factory.attach(taskArgs.contract);

        const spender: string = ethers.utils.getAddress(taskArgs.spender);
        const amount: number = taskArgs.amount;

        await contract.connect(owner).approve(spender, amount);
        console.log(`approve to ${spender}, ${amount} tokens`);
    });