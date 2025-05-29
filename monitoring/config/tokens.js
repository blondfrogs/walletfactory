module.exports = {
  CHAINS: {
    ethereum: {
      chainId: 1,
      name: "Ethereum Mainnet",
      nativeSymbol: "ETH",
      multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
    polygon: {
      chainId: 137,
      name: "Polygon",
      nativeSymbol: "MATIC",
      multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    },
    // Add more chains as needed
  },

  TOKENS: {
    USDT: {
      symbol: "USDT",
      decimals: 6,
      contracts: {
        ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        polygon: "0x3813e82e6f7098b9583FC0F33a962D02018B6803",
      },
    },
    USDC: {
      symbol: "USDC",
      decimals: 6,
      contracts: {
        ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        polygon: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      },
    },
  },
};
