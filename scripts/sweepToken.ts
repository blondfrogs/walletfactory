// scripts/sweepToken.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [caller] = await ethers.getSigners();

  const walletAddress = process.env.USER_WALLET_ADDRESS;
  const tokenAddress = process.env.TEST_TOKEN_ADDRESS;
  if (!walletAddress || !tokenAddress) {
    throw new Error("Missing USER_WALLET_ADDRESS or TEST_TOKEN_ADDRESS in .env");
  }

  const token = await ethers.getContractAt("MockUSDT", tokenAddress);
  const wallet = await ethers.getContractAt("UserWallet", walletAddress);

  // Send tokens to the wallet
  console.log(`Sending 100 tokens to ${walletAddress}...`);
  const tx1 = await token.transfer(walletAddress, ethers.parseUnits("100", 6));
  await tx1.wait();

  // Sweep tokens back to caller
  console.log("Sweeping tokens to:", process.env.SWEEP_ADDRESS);
  const tx2 = await wallet.sweepToken(tokenAddress, process.env.SWEEP_ADDRESS);
  await tx2.wait();

  console.log("✅ Tokens swept successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});