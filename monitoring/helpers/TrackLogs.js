const { ethers } = require("ethers");
const ERC20_ABI = require("../abis/ERC20_ABI.json");
const registry = new (require("./TokenRegistry"))();
const erc20Interface = new ethers.Interface(ERC20_ABI);

async function trackTokenDeposits(chain, addresses, provider, fromBlock, toBlock) {
  const tokens = registry.getTokensByChain(chain);
  const lowercaseSet = new Set(addresses.map((a) => a.toLowerCase()));

  for (const symbol of tokens) {
    const tokenAddress = registry.getAddress(symbol, chain);
    const logs = await provider.getLogs({
      address: tokenAddress,
      fromBlock,
      toBlock,
      topics: [ethers.id("Transfer(address,address,uint256)")]
    });

    for (const log of logs) {
      const to = "0x" + log.topics[2].slice(26).toLowerCase();
      if (!lowercaseSet.has(to)) continue;

      const parsed = erc20Interface.parseLog(log);
      console.log({
        chain,
        token: symbol,
        to,
        from: parsed.args.from,
        amount: parsed.args.value.toString(),
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
      });
    }
  }
}

async function trackNativeDeposits(chain, addresses, provider, fromBlock, toBlock) {
  const nativeSymbol = registry.getNativeSymbol(chain);
  const lowercaseSet = new Set(addresses.map((a) => a.toLowerCase()));

  for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
    let block;
    try {
      const hexBlockNumber = ethers.toQuantity(blockNumber);
      block = await provider.send("eth_getBlockByNumber", [hexBlockNumber, true]);
    } catch (err) {
      console.warn(`[${chain}] Failed to fetch block ${blockNumber}:`, err.message);
      continue;
    }


    for (const tx of block.transactions) {
      const to = tx.to?.toLowerCase();
      if (!to || !lowercaseSet.has(to)) continue;
      if (tx.value === undefined || tx.value === null || tx.value === 0n) continue;

      console.log({
        chain,
        token: nativeSymbol,
        to,
        from: tx.from,
        amount: ethers.formatEther(tx.value),
        txHash: tx.hash,
        blockNumber: blockNumber,
      });
    }
  }
}

module.exports = {
  trackTokenDeposits,
  trackNativeDeposits
};
