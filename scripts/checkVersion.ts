// scripts/checkVersion.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const factoryProxyAddress = process.env.FACTORY_ADDRESS;
  if (!factoryProxyAddress) throw new Error("FACTORY_ADDRESS not set in .env");

  const WalletFactory = await ethers.getContractAt("WalletFactoryV2", factoryProxyAddress);

  try {
    const version = await WalletFactory.version();
    console.log("Factory version:", version);
  } catch (e) {
    console.log("❌ version() function not found (as expected before upgrade)");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});