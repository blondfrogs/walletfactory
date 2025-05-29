const { ethers } = require("ethers");
const Multicall3ABI = require("../abis/Multicall3.json");
const ERC20_ABI = require("../abis/ERC20_ABI.json");
const registry = new (require("./TokenRegistry"))();
const erc20Interface = new ethers.Interface(ERC20_ABI);
const { trackNativeDeposits } = require("./TrackLogs");

async function getNativeBalances(chain, addresses, provider, multicall, fromBlock, toBlock, lastBalances) {
  const nativeSymbol = registry.getNativeSymbol(chain);
  const multicallInterface = new ethers.Interface(Multicall3ABI);

  const calls = addresses.map((addr) => ({
    target: multicall.target,
    callData: multicallInterface.encodeFunctionData("getEthBalance", [addr]),
  }));

  let result;
  try {
    const tryAggregateData = multicallInterface.encodeFunctionData("tryAggregate", [false, calls]);
    const response = await provider.call({
      to: multicall.target,
      data: tryAggregateData
    });
    result = multicallInterface.decodeFunctionResult("tryAggregate", response);
  } catch (err) {
    console.warn(`[${chain}] Native multicall failed:`, err.message);
    return;
  }

  const newChainBalances = lastBalances[chain] || {};
  
  // Track if any changes occurred
  let balanceChanged = false;

  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i];
    const { success, returnData } = result[0][i];
    const newBal = success && returnData !== "0x" ? ethers.toBigInt(returnData) : 0n;
    const prevBal = BigInt(newChainBalances[addr]?.[nativeSymbol] || 0);

    console.log(`${addr}, ${newBal} ${chain}`);
    if (newBal !== prevBal) {
      const delta = newBal - prevBal;
      const action = delta > 0n ? "deposit" : "sweep";
      console.log(`[${chain}] Native ${action} for ${addr}: ${ethers.formatEther(delta)} ${nativeSymbol}`);
      balanceChanged = true;
    }

    if (!newChainBalances[addr]) newChainBalances[addr] = {};
    newChainBalances[addr][nativeSymbol] = newBal.toString();
  }

  if (balanceChanged) {
    await trackNativeDeposits(chain, addresses, provider, fromBlock, toBlock);
  }

  lastBalances[chain] = newChainBalances;
}

async function getTokenBalances(chain, addresses, tokens, provider, multicall, lastBalances) {
  const newChainBalances = lastBalances[chain] || {};
  const multicallInterface = new ethers.Interface(Multicall3ABI);

  for (const symbol of tokens) {
    const tokenAddress = registry.getAddress(symbol, chain);
    const calls = addresses.map((addr) => ({
      target: tokenAddress,
      callData: erc20Interface.encodeFunctionData("balanceOf", [addr]),
    }));

    let result;
    try {
      const tryAggregateData = multicallInterface.encodeFunctionData("tryAggregate", [false, calls]);
      const response = await provider.call({
        to: multicall.target,
        data: tryAggregateData,
      });
      result = multicallInterface.decodeFunctionResult("tryAggregate", response);
    } catch (err) {
      console.warn(`[${chain}] Token multicall failed for ${symbol}:`, err.message);
      continue;
    }

    for (let i = 0; i < addresses.length; i++) {
      const addr = addresses[i];
      const { success, returnData } = result[0][i]; // result[0] is the array of Result structs
      const balance = success && returnData !== "0x" ? ethers.toBigInt(returnData) : 0n;

      console.log(`${addr}, ${balance}, ${symbol}`);
      const prevTokenBal = BigInt(newChainBalances[addr]?.[symbol] || 0);
      if (balance !== prevTokenBal) {
        const delta = balance - prevTokenBal;
        const tokenAction = delta > 0n ? "deposit" : "sweep";
        console.log(`[${chain}] ${symbol} ${tokenAction} for ${addr}: ${delta.toString()}`);
      }

      if (!newChainBalances[addr]) newChainBalances[addr] = {};
      newChainBalances[addr][symbol] = balance.toString();
    }
  }

  lastBalances[chain] = newChainBalances;
}

module.exports = {
  getNativeBalances,
  getTokenBalances
};
