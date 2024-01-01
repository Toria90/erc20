import { expect } from "chai";
import { ethers } from "hardhat";
import {HardhatEthersSigner, SignerWithAddress} from "@nomicfoundation/hardhat-ethers/signers";
import { ERC20 } from "../typechain-types";
import {ContractFactory} from "ethers";

const ZERO_ADDRESS : string = "0x0000000000000000000000000000000000000000";

describe("Erc20 contract", () => {
    let accounts : HardhatEthersSigner[];

    let erc20Contract : ERC20;

    const name : string = "MyToken";
    const symbol : string = "MT";
    const decimals : number = 18;

    beforeEach(async () =>{
        accounts = await ethers.getSigners();

        const erc20Factory: ContractFactory  = await ethers.getContractFactory('ERC20');
        erc20Contract = (await erc20Factory.deploy(name, symbol, decimals)) as ERC20;
    });

    describe ("deployment", () => {
        it("Should set the right name", async () => {
            expect(await erc20Contract.name()).to.equal(name);
        });

        it("Should set the right symbol", async () => {
            expect(await erc20Contract.symbol()).to.equal(symbol);
        });

        it("Should set the right decimals", async () => {
            expect(await erc20Contract.decimals()).to.equal(decimals);
        });

        it("Should set zero total supply", async () => {
            expect(await erc20Contract.totalSupply()).to.equal(0);
        });
    });

    describe ("mint", () => {
        it("Shouldn't be possible mint to zero address", async () => {
            const mintAmount = 1;
            await expect(erc20Contract.mint(ZERO_ADDRESS, mintAmount))
                .to.be.revertedWith("account shouldn't be zero");
        });

        it("Shouldn't be possible mint zero amount", async () => {
            const mintAmount = 0;
            await expect(erc20Contract.mint(accounts[0].address, mintAmount))
                .to.be.revertedWith("amount shouldn't be zero");
        });

        it("Should be change balance", async () =>{
            const mintAmount = 10;
            await erc20Contract.mint(accounts[0].address, mintAmount);
            expect(await erc20Contract.balanceOf(accounts[0].address)).to.equal(mintAmount);
        });

        it("Should be change total supply", async () =>{
            const mintAmount1 = 1;
            const mintAmount2 = 2;
            await erc20Contract.mint(accounts[0].address, mintAmount1);
            await erc20Contract.mint(accounts[1].address, mintAmount2);
            expect(await erc20Contract.totalSupply()).to.equal(mintAmount1 + mintAmount2);
        });
    });

    describe("transfer", () => {
        it("Shouldn't be possible transfer to zero address", async () =>{
            const from : SignerWithAddress = accounts[0];
            const toAddress : string = ZERO_ADDRESS;
            const transferAmount : number = 1;
            await expect(erc20Contract.connect(from).transfer(toAddress, transferAmount))
                .to.be.revertedWith("to address shouldn't be zero");
        });

        it("Shouldn't be possible transfer zero amount", async () =>{
            const from : SignerWithAddress = accounts[0];
            const toAddress : string = accounts[1].address;
            const transferAmount : number = 0;
            await expect(erc20Contract.connect(from).transfer(toAddress, transferAmount))
                .to.be.revertedWith("amount shouldn't be zero");
        });

        it("Shouldn't be possible transfer more than account balance", async () =>{
            const from : SignerWithAddress = accounts[0];
            const toAddress: string = accounts[1].address;
            const mintAmount: number = 1;
            await erc20Contract.mint(from.address, mintAmount);

            await expect(erc20Contract.connect(from).transfer(toAddress, mintAmount + 1))
                .to.be.reverted;
        });

        it("Shouldn't change total supply", async () => {
            const from: SignerWithAddress = accounts[0];
            const toAddress: string = accounts[1].address;
            const mintAmount: number = 1;
            await erc20Contract.mint(from.address, mintAmount);
            await erc20Contract.connect(from).transfer(toAddress, mintAmount);
            expect(await erc20Contract.totalSupply()).to.equal(mintAmount);
        });

        it("Should increase balance", async () => {
            const from : SignerWithAddress = accounts[0];
            const toAddress: string = accounts[1].address;
            const mintAmount : number = 1;
            await erc20Contract.mint(from.address, mintAmount);
            await erc20Contract.connect(from).transfer(toAddress, mintAmount);
            expect(await erc20Contract.balanceOf(toAddress)).to.equal(mintAmount);
        });

        it("Should decrease balance", async () => {
            const from : SignerWithAddress = accounts[0];
            const toAddress : string = accounts[1].address;
            const mintAmount : number = 1;
            await erc20Contract.mint(from.address, mintAmount);
            await erc20Contract.connect(from).transfer(toAddress, mintAmount);
            expect(await erc20Contract.balanceOf(from.address)).to.equal(0);
        });
    });

    describe ("approve", () => {
        it("Shouldn't be possible to zero address", async () => {
            const amount = 1;
            await expect(erc20Contract.connect(accounts[0]).approve(ZERO_ADDRESS, amount))
                .to.be.revertedWith("spender address shouldn't be zero");
        });

        it("Shouldn't be possible zero amount", async () => {
            const amount = 0;
            await expect(erc20Contract.connect(accounts[0]).approve(accounts[1].address, amount))
                .to.be.revertedWith("amount shouldn't be zero");
        });

        it("Should be change allowance", async () =>{
            const amount = 1;
            await erc20Contract.connect(accounts[0]).approve(accounts[1].address, amount);
            expect(await erc20Contract.allowance(accounts[0].address, accounts[1].address)).to.equal(amount);
        });
    });

    describe("transferFrom", () => {
        it("Shouldn't be possible more than allowance", async () =>{
            const allowanceAmount : number = 1;
            const transferAmount : number = allowanceAmount + 1;
            await erc20Contract.connect(accounts[0]).approve(accounts[1].address, allowanceAmount);
            await expect(erc20Contract.connect(accounts[1]).transferFrom(accounts[0].address, accounts[2].address, transferAmount))
                .to.be.revertedWith("insufficient allowance funds");
        });

        it("Should spend allowance", async () =>{
            const allowanceAmount : number = 2;
            const transferAmount : number = allowanceAmount - 1;
            await erc20Contract.mint(accounts[0].address, allowanceAmount);
            await erc20Contract.connect(accounts[0]).approve(accounts[1].address, allowanceAmount);
            await erc20Contract.connect(accounts[1]).transferFrom(accounts[0].address, accounts[2].address, transferAmount);
            expect(await erc20Contract.allowance(accounts[0].address, accounts[1].address)).to.equal(allowanceAmount - transferAmount);
        });

        it("Should increase balance", async () =>{
            const allowanceAmount : number = 2;
            const transferAmount : number = allowanceAmount - 1;
            await erc20Contract.mint(accounts[0].address, allowanceAmount);
            await erc20Contract.connect(accounts[0]).approve(accounts[1].address, allowanceAmount);
            await erc20Contract.connect(accounts[1]).transferFrom(accounts[0].address, accounts[2].address, transferAmount);
            expect(await erc20Contract.balanceOf(accounts[2].address)).to.equal(transferAmount);
        });

        it("Should decrease balance", async () =>{
            const allowanceAmount : number = 2;
            const transferAmount : number = allowanceAmount - 1;
            await erc20Contract.mint(accounts[0].address, allowanceAmount);
            await erc20Contract.connect(accounts[0]).approve(accounts[1].address, allowanceAmount);
            await erc20Contract.connect(accounts[1]).transferFrom(accounts[0].address, accounts[2].address, transferAmount);
            expect(await erc20Contract.balanceOf(accounts[0].address)).to.equal(allowanceAmount - transferAmount);
        });
    });

    describe ("burn", () => {
        it("Shouldn't be possible burn from zero address", async () => {
            const amount = 1;
            await expect(erc20Contract.burn(ZERO_ADDRESS, amount))
                .to.be.revertedWith("account shouldn't be zero");
        });

        it("Shouldn't be possible burn zero amount", async () => {
            const amount = 0;
            await expect(erc20Contract.burn(accounts[0].address, amount))
                .to.be.revertedWith("amount shouldn't be zero");
        });

        it("Should be change balance", async () =>{
            const mintAmount : number = 2;
            const burnAmount : number = 1;
            await erc20Contract.mint(accounts[0].address, mintAmount);
            await erc20Contract.burn(accounts[0].address, burnAmount);
            expect(await erc20Contract.balanceOf(accounts[0].address)).to.equal(mintAmount - burnAmount);
        });

        it("Should be change total supply", async () =>{
            const mintAmount : number = 2;
            const burnAmount : number = 1;
            await erc20Contract.mint(accounts[0].address, mintAmount);
            await erc20Contract.burn(accounts[0].address, burnAmount);
            expect(await erc20Contract.totalSupply()).to.equal(mintAmount - burnAmount);
        });

        it("Should burn all balance", async () =>{
            const mintAmount : number = 2;
            const burnAmount : number = mintAmount + 1;
            await erc20Contract.mint(accounts[0].address, mintAmount);
            await erc20Contract.burn(accounts[0].address, burnAmount);
            expect(await erc20Contract.balanceOf(accounts[0].address)).to.equal(0);
        });
    });
});