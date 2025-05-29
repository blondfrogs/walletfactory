// helpers/TokenRegistry.js
const { CHAINS, TOKENS } = require("../config/tokens");

class TokenRegistry {
  constructor() {
    this.chains = CHAINS;
    this.tokens = TOKENS;
  }

  getAddress(symbol, chain) {
    const token = this.tokens[symbol];
    if (!token) throw new Error(`Token ${symbol} not found.`);
    const address = token.contracts[chain];
    if (!address) throw new Error(`Token ${symbol} not deployed on chain ${chain}.`);
    return address;
  }

  getDecimals(symbol) {
    const token = this.tokens[symbol];
    if (!token) throw new Error(`Token ${symbol} not found.`);
    return token.decimals;
  }

  getMulticall(chain) {
    const chainInfo = this.chains[chain];
    if (!chainInfo) throw new Error(`Chain ${chain} not supported.`);
    return chainInfo.multicallAddress;
  }

  getNativeSymbol(chain) {
    const chainInfo = this.chains[chain];
    if (!chainInfo) throw new Error(`Chain ${chain} not supported.`);
    return chainInfo.nativeSymbol;
  }

  getTokensByChain(chain) {
    return Object.entries(this.tokens)
      .filter(([_, token]) => token.contracts[chain])
      .map(([symbol]) => symbol);
  }
}

module.exports = TokenRegistry;
