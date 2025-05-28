// scripts/upgradeFactory.ts
import { ethers, upgrades } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const factoryProxyAddress = process.env.FACTORY_ADDRESS;
  if (!factoryProxyAddress) throw new Error("FACTORY_ADDRESS not set in .env");

  const WalletFactoryV2 = await ethers.getContractFactory("WalletFactoryV2");
  const upgraded = await upgrades.upgradeProxy(factoryProxyAddress, WalletFactoryV2);
  await upgraded.waitForDeployment();

  console.log("✅ WalletFactory upgraded at:", await upgraded.getAddress());
  console.log("Version:", await upgraded.version());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
