module.exports = {
  manualAddresses: [
    {
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
    },
    {
        address: "0xa83114A443dA1CecEFC50368531cACE9F37fCCcb"
    },
    {
        address: "0x9FC3da866e7DF3a1c57adE1a97c9f00a70f010c8"
    },
    {
        address: "0x388C818CA8B9251b393131C08a736A67ccB19297"
    },
  ],

  // Simulate API pull
  fetchFromAPI: async () => {
    // TODO: replace with real HTTP request
    return [
      {
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
      },
      {
        address: "0xa83114A443dA1CecEFC50368531cACE9F37fCCcb"
      },
    ];
  },
};
