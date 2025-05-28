// scripts/deployWallet.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const factoryAddress = process.env.FACTORY_ADDRESS;
  const sweepRecipient = process.env.SWEEP_ADDRESS;
  const sweepRoleOwner = process.env.SWEEP_ROLE_OWNER;

  if (!factoryAddress || !sweepRecipient || !sweepRoleOwner) {
    throw new Error("FACTORY_ADDRESS and SWEEP_RECIPIENT and SWEEP_ROLE_OWNER must be set in .env");
  }

  const WalletFactory = await ethers.getContractAt("WalletFactory", factoryAddress);

  const userId = "testuser1";
  const walletOwner = deployer.address;
  const salt = ethers.keccak256(ethers.toUtf8Bytes(userId));

  // Compute the wallet address first
  const predictedAddress = await WalletFactory.computeAddress(salt, walletOwner);
  console.log("Predicted Wallet Address:", predictedAddress);

  // Deploy the wallet via the factory
  const tx = await WalletFactory.deployWallet(salt, walletOwner, sweepRecipient, process.env.SWEEP_ROLE_OWNER);
  await tx.wait();

  console.log("Wallet deployed to:", predictedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
