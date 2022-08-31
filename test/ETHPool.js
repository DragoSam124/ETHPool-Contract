const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const {BigNumber} = require('ethers');
const { ethers } = require("hardhat");

describe("EthPool", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const ETHPool = await ethers.getContractFactory("ETHPool")
    const ethPool = await ETHPool.deploy();

    await ethPool.deployed();
    console.log("This is EthPool address: ", ethPool.address);

    return {ethPool, owner, addr1, addr2}
  }

  describe("ETHPool", async function () {
    it("ETHPool", async function(){
      const {ethPool, owner, addr1, addr2} = await deploy()

      await owner.sendTransaction({ to: ethPool.address, value: ethers.utils.parseEther("1")});

      console.log("Before Deposit: ",await addr2.getBalance());
      
      await ethPool.addTeamMember(addr1.address);
  
      await ethPool.connect(addr2).depositFund({value: ethers.utils.parseEther("1.0")});
      console.log("After Deposit: ", await addr2.getBalance());
  
      expect(await ethPool.getDepositedFund(addr2.address)).to.equal(ethers.utils.parseEther("1.0"));
  
      await ethPool.depositRewards();
  
      const reward = await ethPool.getReward(addr2.address);
      console.log("Rewad Amount: ", reward);
  
      await ethPool.connect(addr2).withdraw();
      console.log("After withdraw: ", await addr2.getBalance());
    });

  });
});
