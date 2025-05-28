import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { keccak256, toUtf8Bytes, parseEther, parseUnits } from "ethers";

describe("WalletFactory", () => {
  it("should handle native and ERC20 tokens and allow sweeping", async () => {
    const [deployer, recipient, sweeper_address, sweeper_role] = await ethers.getSigners();

    // Deploy WalletFactory
    const Factory = await ethers.getContractFactory("WalletFactory");
    const Logic = await ethers.getContractFactory("UserWallet");
    const walletLogic = await Logic.deploy();
    await walletLogic.waitForDeployment();

    const factory = await upgrades.deployProxy(Factory, [deployer.address, await walletLogic.getAddress()], {
      initializer: "initialize",
    });
    await factory.waitForDeployment();

    // Deploy MockUSDT
    const USDT = await ethers.getContractFactory("MockUSDT");
    const usdt = await USDT.deploy();
    await usdt.waitForDeployment();
    const usdtAddress = await usdt.getAddress();

    const salt = keccak256(toUtf8Bytes("testuser"));
    const predictedWallet = await factory.computeAddress(salt, deployer.address);

    // Deploy user wallet
    const tx = await factory.deployWallet(salt, deployer.address, sweeper_address.address, sweeper_role.address);
    await tx.wait();

    const wallet = await ethers.getContractAt("UserWallet", predictedWallet);

    // Fund wallet with ETH
    await deployer.sendTransaction({ to: predictedWallet, value: parseEther("1.0") });

    // Transfer 100 USDT to wallet
    await usdt.transfer(predictedWallet, parseUnits("100", 6));

    // Check balances before sweep
    const ethBalanceBefore = await ethers.provider.getBalance(predictedWallet);
    const tokenBalanceBefore = await usdt.balanceOf(predictedWallet);
    expect(ethBalanceBefore).to.equal(parseEther("1.0"));
    expect(tokenBalanceBefore).to.equal(parseUnits("100", 6));

    const receiveSweeperBalanceBefore = await ethers.provider.getBalance(sweeper_address.address);

    // Sweep ETH
    await (await wallet.connect(sweeper_role).sweepETH()).wait();

    const ethBalanceAfter = await ethers.provider.getBalance(predictedWallet);
    expect(ethBalanceAfter).to.equal(0n);

    // Check sweeper address is the old blance + the new swept balance. 
    const receiveSweeperBalance = await ethers.provider.getBalance(sweeper_address.address);
    expect(receiveSweeperBalance).to.equal(receiveSweeperBalanceBefore + parseEther("1.0"));

    // Sweep USDT
    await (await wallet.connect(sweeper_role).sweepToken(usdtAddress)).wait();

    const tokenBalanceAfter = await usdt.balanceOf(predictedWallet);
    expect(tokenBalanceAfter).to.equal(0n);

    const receiveSweeperUSDT = await usdt.balanceOf(sweeper_address.address);
    expect(receiveSweeperUSDT).to.equal(parseUnits("100", 6));
  });
});