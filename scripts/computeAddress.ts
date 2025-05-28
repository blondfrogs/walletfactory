import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const factoryAddress =  process.env.FACTORY_ADDRESS
  if (!factoryAddress) throw new Error("FACTORY_ADDRESS not set in .env");
  const factory = await ethers.getContractAt("WalletFactory", factoryAddress);

  const userId = "user123";
  const salt = ethers.keccak256(ethers.toUtf8Bytes(userId));
  const walletOwner = (await ethers.getSigners())[0].address;

  const predicted = await factory.computeAddress(salt, walletOwner);
  console.log("Predicted address:", predicted);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
