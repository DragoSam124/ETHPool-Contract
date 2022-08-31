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

    const RewardToken = await ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy();
    await rewardToken.deployed();
    console.log("This is RewardToken address: ", rewardToken.address);

    const ETHPool = await ethers.getContractFactory("ETHPool")
    const ethPool = await ETHPool.deploy(rewardToken.address);

    await ethPool.deployed();
    console.log("This is EthPool address: ", ethPool.address);

    return {ethPool, rewardToken, owner, addr1, addr2}
  }

  describe("ETHPool", async function () {
    it("ETHPool", async function(){
      const {ethPool,rewardToken, owner, addr1, addr2} = await deploy()

      await rewardToken.mint(addr1.address, ethers.utils.parseEther("1000"));
      console.log("Team Member Reward Token: ", await rewardToken.balanceOf(addr1.address))

      console.log("Before Deposit: ",await addr2.getBalance(), await rewardToken.balanceOf(addr2.address));
      
      await ethPool.addTeamMember(addr1.address);
  
      await ethPool.connect(addr2).depositFund({value: ethers.utils.parseEther("1.0")});
      console.log("After Deposit: ", await addr2.getBalance(), await rewardToken.balanceOf(addr2.address));
  
      expect(await ethPool.getDepositedFund(addr2.address)).to.equal(ethers.utils.parseEther("1.0"));
  
      await rewardToken.connect(addr1).approve(ethPool.address, await rewardToken.balanceOf(addr1.address))
      await ethPool.connect(addr1).depositRewards();
  
      const reward = await ethPool.getReward(addr2.address);
      console.log("Rewad Amount: ", reward, await rewardToken.balanceOf(ethPool.address));
  
      await ethPool.connect(addr2).withdraw();
      console.log("After withdraw: ", await addr2.getBalance(), await rewardToken.balanceOf(addr2.address));
    });

  });
});
