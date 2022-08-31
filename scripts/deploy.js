// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const RewardToken = await hre.others.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy();

  await rewardToken.deployed();

  console.log('RewardToken address: ', rewardToken.address);

  const ETHPool = await hre.ethers.getContractFactory("ETHPool");
  const ethPool = await ETHPool.deploy();

  await ethPool.deployed();

  console.log('ETHPool address: ', ethPool.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
