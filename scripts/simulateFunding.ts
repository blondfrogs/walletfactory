import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const ERC20_ABI = [
  "function transfer(address to, uint amount) returns (bool)",
  "function balanceOf(address) view returns (uint)"
];

async function main() {
  const [sender] = await ethers.getSigners();
  const to = process.env.USER_WALLET_ADDRESS;
  const amount = ethers.parseEther("0.1");

  const tx = await sender.sendTransaction({
    to,
    value: amount,
  });

  await tx.wait();
  console.log(`Sent ${ethers.formatEther(amount)} ETH to ${to}`);


  const tokenAddress = process.env.TEST_TOKEN_ADDRESS;
  if (!tokenAddress) throw new Error("TEST_TOKEN_ADDRESS not set in .env");

  const amountUSDT = ethers.parseUnits("10.0", 6); // USDT uses 6 decimals
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, sender);

  const txUSDT = await token.transfer(to, amountUSDT);
  
  await txUSDT.wait();
  console.log(`Sent ${amountUSDT} tokens to ${to}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
