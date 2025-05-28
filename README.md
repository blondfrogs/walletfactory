
# WalletFactory Project

This Hardhat project implements a secure, upgradeable smart wallet system using the OpenZeppelin upgradeable suite.

## Features

- 🧱 Deterministic wallet creation using `CREATE2` and `ClonesUpgradeable`
- 🔐 Role-based security with `AccessControlUpgradeable`
- 🪙 Supports ETH and ERC-20 sweeps to pre-approved recipient addresses
- 🔁 Upgradeable factory logic using `UUPSUpgradeable`

---

## Structure

### Contracts

- **WalletFactory**: Upgradeable factory with deploy and admin roles
- **UserWallet**: Cloned wallet holding ETH and ERC-20 tokens, secured by `SWEEPER_ROLE`

### Roles

- `DEFAULT_ADMIN_ROLE` – manages all other roles
- `DEPLOYER_ROLE` – deploys wallets via factory
- `UPGRADER_ROLE` – upgrades factory logic
- `SWEEPER_ROLE` – calls `sweepETH()` and `sweepToken()` on UserWallets

---

## Scripts

All scripts are located in `scripts/`:

- `deploy.ts` – Deploys logic and proxy for factory
- `deployWallet.ts` – Deploys a user wallet with sweep recipient and sweeper
- `deployMockUSDT.ts` – Deploys the MockUSDT token contract
- `simulateFunding.ts` – Sends ETH and USDT to an address
- `sweepETH.ts` – Sends ETH from a UserWallet to recipient
- `sweepToken.ts` – Sends tokens from a UserWallet to recipient
- `upgradeFactory.ts` – Upgrades factory proxy to a new version
- `checkVersion.ts` – Verifies version post-upgrade
- `checkBalance.ts` – Checks the balances of address ETH and MockUSDT
- `computeAddress.ts` – Computes the deterministic address given the salt

---

## Environment Variables

Ensure you define the following in a `.env` file:

```
FACTORY_ADDRESS=0x...        # Factory proxy address
USER_WALLET_ADDRESS=0x...    # Address of deployed user wallet
SWEEP_RECIPIENT=0x...        # Where ETH/tokens will be sent
TEST_TOKEN_ADDRESS=0x...     # MockUSDT or other ERC20 used in tests
```

---

## Testing

```bash
npx hardhat test
```

Tests include:

- Wallet deployment
- ETH and token funding
- Sweeping logic via authorized roles
- Role access control validation

---

## Usage
### Deploying, Sweeping, with Balances Checks
```bash 
npx hardhat node
```
In another window
```bash
npx hardhat run scripts/deploy.ts --network localhost
npx hardhat run scripts/deployMockUSDT.ts --network localhost
npx hardhat run scripts/deployWallet.ts --network localhost
npx hardhat run scripts/checkBalance.ts --network localhost
npx hardhat run scripts/sweepETH.ts --network localhost
npx hardhat run scripts/sweepToken.ts --network localhost
npx hardhat run scripts/checkBalance.ts  --network localhost
```

1. Deploy contracts with `deploy.ts`
2. Deploy wallets with `deployWallet.ts`
3. Run `sweepETH.ts` or `sweepToken.ts` as needed

---

## Future Improvements

See `Wallet System Documentation.md` for full design docs and roadmap.
