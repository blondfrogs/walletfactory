import { ethers } from "hardhat";

async function main() {
  const USDT = await ethers.getContractFactory("MockUSDT");
  const usdt = await USDT.deploy();
  await usdt.waitForDeployment();

  const address = await usdt.getAddress();
  console.log("Mock USDT deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});