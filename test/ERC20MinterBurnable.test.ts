import { ethers } from "hardhat";
import {solidity} from "ethereum-waffle";
import chai from "chai";
import {ERC20, ERC20MinterBurnable, ERC20Mock} from "../typechain-types"
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {ZERO_ADDRESS} from "./helpers/constants";

chai.use(solidity);
const { expect } = chai;

describe("ERC20MinterBurnable contract", () => {
    let accounts: SignerWithAddress[];

    let erc20MinterBurnableContract : ERC20MinterBurnable;

    const name : string = "MyToken";
    const symbol : string = "MT";
    const decimals : number = 18;

    beforeEach(async () => {

        accounts = await ethers.getSigners();

        const factory = await ethers.getContractFactory('ERC20MinterBurnable');
        erc20MinterBurnableContract = (await factory.deploy(name, symbol, decimals)) as ERC20MinterBurnable;
    });

    describe ("deployment", () => {
        it("Should set the right name", async () => {
            expect(await erc20MinterBurnableContract.name()).to.equal(name);
        });

        it("Should set the right symbol", async () => {
            expect(await erc20MinterBurnableContract.symbol()).to.equal(symbol);
        });

        it("Shoud set the right decimals", async () => {
            expect(await erc20MinterBurnableContract.decimals()).to.equal(decimals);
        });

        it("Shoud set zero total supply", async () => {
            expect(await erc20MinterBurnableContract.totalSupply()).to.equal(0);
        });
    });

    describe ("mint", () => {
        it("Shouldn't be possible mint to zero address", async () => {
            const mintAmount = 1;
            await expect(erc20MinterBurnableContract.mint(ZERO_ADDRESS, mintAmount))
                .to.be.revertedWith("account shouldn't be zero");
        });

        it("Shouldn't be possible mint zero amount", async () => {
            const mintAmount = 0;
            await expect(erc20MinterBurnableContract.mint(accounts[0].address, mintAmount))
                .to.be.revertedWith("amount shouldn't be zero");
        });

        it("Should be change balance", async () =>{
            const mintAmount = 10;
            await erc20MinterBurnableContract.mint(accounts[0].address, mintAmount);
            expect(await erc20MinterBurnableContract.balanceOf(accounts[0].address)).to.equal(mintAmount);
        });

        it("Should be change total supply", async () =>{
            const mintAmount1 = 1;
            const mintAmount2 = 2;
            await erc20MinterBurnableContract.mint(accounts[0].address, mintAmount1);
            await erc20MinterBurnableContract.mint(accounts[1].address, mintAmount2);
            expect(await erc20MinterBurnableContract.totalSupply()).to.equal(mintAmount1 + mintAmount2);
        });
    });

    describe("transfer", () => {
        it("Shouldn't be possible transfer to zero address", async () =>{
            const from : SignerWithAddress = accounts[0];
            const toAddress : string = ZERO_ADDRESS;
            const transferAmount : number = 1;
            await expect(erc20MinterBurnableContract.connect(from).transfer(toAddress, transferAmount))
                .to.be.revertedWith("to address shouldn't be zero");
        });

        it("Shouldn't be possible transfer zero amount", async () =>{
            const from : SignerWithAddress = accounts[0];
            const toAddress : string = accounts[1].address;
            const transferAmount : number = 0;
            await expect(erc20MinterBurnableContract.connect(from).transfer(toAddress, transferAmount))
                .to.be.revertedWith("amount shouldn't be zero");
        });

        it("Shouldn't be possible transfer more than account balance", async () =>{
            const from : SignerWithAddress = accounts[0];
            const toAddress: string = accounts[1].address;
            const mintAmount: number = 1;
            await erc20MinterBurnableContract.mint(from.address, mintAmount);

            await expect(erc20MinterBurnableContract.connect(from).transfer(toAddress, mintAmount + 1))
                .to.be.reverted;
        });

        it("Shouldn't change total supply", async () => {
            const from: SignerWithAddress = accounts[0];
            const toAddress: string = accounts[1].address;
            const mintAmount: number = 1;
            await erc20MinterBurnableContract.mint(from.address, mintAmount);
            await erc20MinterBurnableContract.connect(from).transfer(toAddress, mintAmount);
            expect(await erc20MinterBurnableContract.totalSupply()).to.equal(mintAmount);
        });

        it("Shoud increase balance", async () => {
            const from : SignerWithAddress = accounts[0];
            const toAddress: string = accounts[1].address;
            const mintAmount : number = 1;
            await erc20MinterBurnableContract.mint(from.address, mintAmount);
            await erc20MinterBurnableContract.connect(from).transfer(toAddress, mintAmount);
            expect(await erc20MinterBurnableContract.balanceOf(toAddress)).to.equal(mintAmount);
        });

        it("Shoud decrease balance", async () => {
            const from : SignerWithAddress = accounts[0];
            const toAddress : string = accounts[1].address;
            const mintAmount : number = 1;
            await erc20MinterBurnableContract.mint(from.address, mintAmount);
            await erc20MinterBurnableContract.connect(from).transfer(toAddress, mintAmount);
            expect(await erc20MinterBurnableContract.balanceOf(from.address)).to.equal(0);
        });
    });

    describe ("approve", () => {
        it("Shouldn't be possible to zero address", async () => {
            const amount = 1;
            await expect(erc20MinterBurnableContract.connect(accounts[0]).approve(ZERO_ADDRESS, amount))
                .to.be.revertedWith("spender address shouldn't be zero");
        });

        it("Shouldn't be possible zero amount", async () => {
            const amount = 0;
            await expect(erc20MinterBurnableContract.connect(accounts[0]).approve(accounts[1].address, amount))
                .to.be.revertedWith("amount shouldn't be zero");
        });

        it("Should be change allowance", async () =>{
            const amount = 1;
            await erc20MinterBurnableContract.connect(accounts[0]).approve(accounts[1].address, amount);
            expect(await erc20MinterBurnableContract.allowance(accounts[0].address, accounts[1].address)).to.equal(amount);
        });
    });

    describe("transferFrom", () => {
        it("Shouldn't be possible more than allowance", async () =>{
            const allowanceAmount : number = 1;
            const transferAmount : number = allowanceAmount + 1;
            await erc20MinterBurnableContract.connect(accounts[0]).approve(accounts[1].address, allowanceAmount);
            await expect(erc20MinterBurnableContract.connect(accounts[1]).transferFrom(accounts[0].address, accounts[2].address, transferAmount))
                .to.be.revertedWith("insufficient allowance funds");
        });

        it("Should spend allowance", async () =>{
            const allowanceAmount : number = 2;
            const transferAmount : number = allowanceAmount - 1;
            await erc20MinterBurnableContract.mint(accounts[0].address, allowanceAmount);
            await erc20MinterBurnableContract.connect(accounts[0]).approve(accounts[1].address, allowanceAmount);
            await erc20MinterBurnableContract.connect(accounts[1]).transferFrom(accounts[0].address, accounts[2].address, transferAmount);
            expect(await erc20MinterBurnableContract.allowance(accounts[0].address, accounts[1].address)).to.equal(allowanceAmount - transferAmount);
        });

        it("Should increase balance", async () =>{
            const allowanceAmount : number = 2;
            const transferAmount : number = allowanceAmount - 1;
            await erc20MinterBurnableContract.mint(accounts[0].address, allowanceAmount);
            await erc20MinterBurnableContract.connect(accounts[0]).approve(accounts[1].address, allowanceAmount);
            await erc20MinterBurnableContract.connect(accounts[1]).transferFrom(accounts[0].address, accounts[2].address, transferAmount);
            expect(await erc20MinterBurnableContract.balanceOf(accounts[2].address)).to.equal(transferAmount);
        });

        it("Should decrease balance", async () =>{
            const allowanceAmount : number = 2;
            const transferAmount : number = allowanceAmount - 1;
            await erc20MinterBurnableContract.mint(accounts[0].address, allowanceAmount);
            await erc20MinterBurnableContract.connect(accounts[0]).approve(accounts[1].address, allowanceAmount);
            await erc20MinterBurnableContract.connect(accounts[1]).transferFrom(accounts[0].address, accounts[2].address, transferAmount);
            expect(await erc20MinterBurnableContract.balanceOf(accounts[0].address)).to.equal(allowanceAmount - transferAmount);
        });
    });

    describe ("burn", () => {
        it("Shouldn't be possible burn from zero address", async () => {
            const amount = 1;
            await expect(erc20MinterBurnableContract.burn(ZERO_ADDRESS, amount))
                .to.be.revertedWith("account shouldn't be zero");
        });

        it("Shouldn't be possible burn zero amount", async () => {
            const amount = 0;
            await expect(erc20MinterBurnableContract.burn(accounts[0].address, amount))
                .to.be.revertedWith("amount shouldn't be zero");
        });

        it("Should be change balance", async () =>{
            const mintAmount : number = 2;
            const burnAmount : number = 1;
            await erc20MinterBurnableContract.mint(accounts[0].address, mintAmount);
            await erc20MinterBurnableContract.burn(accounts[0].address, burnAmount);
            expect(await erc20MinterBurnableContract.balanceOf(accounts[0].address)).to.equal(mintAmount - burnAmount);
        });

        it("Should be change total supply", async () =>{
            const mintAmount : number = 2;
            const burnAmount : number = 1;
            await erc20MinterBurnableContract.mint(accounts[0].address, mintAmount);
            await erc20MinterBurnableContract.burn(accounts[0].address, burnAmount);
            expect(await erc20MinterBurnableContract.totalSupply()).to.equal(mintAmount - burnAmount);
        });

        it("Should burn all balance", async () =>{
            const mintAmount : number = 2;
            const burnAmount : number = mintAmount + 1;
            await erc20MinterBurnableContract.mint(accounts[0].address, mintAmount);
            await erc20MinterBurnableContract.burn(accounts[0].address, burnAmount);
            expect(await erc20MinterBurnableContract.balanceOf(accounts[0].address)).to.equal(0);
        });
    });
});