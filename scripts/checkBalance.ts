import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

async function main() {
  const walletAddress = process.env.USER_WALLET_ADDRESS;
  const sweepAddress = process.env.SWEEP_ADDRESS;

  if (!walletAddress) throw new Error("USER_WALLET_ADDRESS not set in .env");
  if (!sweepAddress) throw new Error("SWEEP_ADDRESS not set in .env");

  const ethBalance1 = await ethers.provider.getBalance(walletAddress);
  const ethBalance2 = await ethers.provider.getBalance(sweepAddress);

  console.log(`ETH Balance of ${walletAddress}:`, ethers.formatEther(ethBalance1), "ETH");
  console.log(`ETH Balance of ${sweepAddress}:`, ethers.formatEther(ethBalance2), "ETH");

  const tokenAddress = process.env.TEST_TOKEN_ADDRESS;
  if (!tokenAddress) throw new Error("TEST_TOKEN_ADDRESS not set in .env");
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, ethers.provider);

  const [decimals, symbol] = await Promise.all([
    token.decimals(),
    token.symbol()
  ]);

  const tokenBalance1 = await token.balanceOf(walletAddress);
  const tokenBalance2 = await token.balanceOf(sweepAddress);

  console.log(`${symbol} Balance of ${walletAddress}:`, ethers.formatUnits(tokenBalance1, decimals), symbol);
  console.log(`${symbol} Balance of ${sweepAddress}:`, ethers.formatUnits(tokenBalance2, decimals), symbol);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});