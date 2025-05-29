
require("dotenv").config();
const { ethers } = require("ethers");
const Multicall3ABI = require("./abis/Multicall3.json");
const ProviderPool = require("./helpers/ProviderPool");
const TokenRegistry = require("./helpers/TokenRegistry");
const { getNativeBalances, getTokenBalances } = require("./helpers/Balances");
const { trackTokenDeposits } = require("./helpers/TrackLogs");
const { getLastBlock, updateLastBlock } = require("./helpers/BlockTracker");
const allProviders = require("./config/providers");
const { manualAddresses, fetchFromAPI } = require("./config/addresses");
const fs = require("fs");
const path = require("path");

const registry = new TokenRegistry();
const BALANCE_FILE = path.join(__dirname, "./data/lastBalances.json");

function loadLastBalances() {
  try {
    return JSON.parse(fs.readFileSync(BALANCE_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveLastBalances(data) {
  fs.writeFileSync(BALANCE_FILE, JSON.stringify(data, null, 2));
}

async function getBalances() {
  const apiAddresses = await fetchFromAPI();
  const combined = [...manualAddresses, ...apiAddresses];
  const seen = new Set();
  const addresses = combined
    .map((a) => a.address.toLowerCase())
    .filter((addr) => {
      if (seen.has(addr)) return false;
      seen.add(addr);
      return true;
    });

  const allChains = Object.keys(allProviders);
  const lastBalances = loadLastBalances();

  for (const chain of allChains) {
    const chainConfig = allProviders[chain];
    const pool = new ProviderPool(chainConfig.freeRPCs, chainConfig.paidRPCs);

    await pool.call(async (provider) => {
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = getLastBlock(chain) || (currentBlock - 20);
      const multicallAddress = registry.getMulticall(chain);

      if (!multicallAddress || !ethers.isAddress(multicallAddress)) {
        throw new Error(`[${chain}] Invalid or missing Multicall address: ${multicallAddress}`);
      }

      let multicall;
      try {
        multicall = new ethers.Contract(multicallAddress, Multicall3ABI, provider);
      } catch (err) {
        throw new Error(`[${chain}] Failed to create Multicall contract: ${err.message}`);
      }

      console.log(`\n--- ${chain.toUpperCase()} TRANSFER EVENTS (${fromBlock} to ${currentBlock}) ---`);

      await getNativeBalances(chain, addresses, provider, multicall, fromBlock, currentBlock, lastBalances);
      await trackTokenDeposits(chain, addresses, provider, fromBlock, currentBlock);

      const tokens = registry.getTokensByChain(chain);
      await getTokenBalances(chain, addresses, tokens, provider, multicall, lastBalances);

      updateLastBlock(chain, currentBlock);
    });
  }

  saveLastBalances(lastBalances);
}

getBalances().catch(console.error);
