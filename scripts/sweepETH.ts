// scripts/sweepETH.ts
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const [caller] = await ethers.getSigners();

  const walletAddress = process.env.USER_WALLET_ADDRESS;
  if (!walletAddress) throw new Error("USER_WALLET_ADDRESS not set in .env");

  const recipient = process.env.SWEEP_ADDRESS; // where ETH will be swept to
  const UserWallet = await ethers.getContractAt("UserWallet", walletAddress);

  console.log("Sending 1 ETH to wallet at", walletAddress);
  const sendTx = await caller.sendTransaction({
    to: walletAddress,
    value: ethers.parseEther("1.0")
  });
  await sendTx.wait();

  console.log("Sweeping ETH to:", recipient);
  const sweepTx = await UserWallet.sweepETH();
  await sweepTx.wait();

  console.log("✅ ETH swept successfully");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});