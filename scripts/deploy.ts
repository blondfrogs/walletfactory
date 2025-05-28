// scripts/deploy.ts
import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // 1. Deploy the logic contract (UserWallet)
  const UserWallet = await ethers.getContractFactory("UserWallet");
  const userWalletLogic = await UserWallet.deploy();
  await userWalletLogic.waitForDeployment();
  console.log("UserWallet logic deployed at:", await userWalletLogic.getAddress());

  // 2. Deploy the WalletFactory as an upgradeable proxy
  const WalletFactory = await ethers.getContractFactory("WalletFactory");
  const walletFactory = await upgrades.deployProxy(WalletFactory, [deployer.address, await userWalletLogic.getAddress()], {
    initializer: "initialize"
  });
  await walletFactory.waitForDeployment();
  console.log("WalletFactory proxy deployed at:", await walletFactory.getAddress());

  // 3. Log initial version
  try {
    const version = await walletFactory.version?.();
    if (version) console.log("Initial version:", version);
  } catch (e) {
    console.log("Initial WalletFactory has no version() method");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});