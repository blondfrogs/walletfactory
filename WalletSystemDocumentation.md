
# Smart Wallet Factory System Documentation

## Overview
This system provides a secure, upgradeable wallet factory that deterministically deploys lightweight smart contract wallets. It uses OpenZeppelin's `ClonesUpgradeable` for minimal proxies and `AccessControlUpgradeable` for role-based permissions.

## Components

### WalletFactory (Upgradeable)
- Deploys `UserWallet` instances via `CREATE2` and OpenZeppelin clones.
- Uses upgradeable proxy pattern via `UUPSUpgradeable`.
- Supports role-based permissions for deployers and upgraders.

#### Roles:
- `DEFAULT_ADMIN_ROLE`: Full control. Can grant/revoke other roles.
- `DEPLOYER_ROLE`: Can call `deployWallet()`.
- `UPGRADER_ROLE`: Can update the wallet logic implementation.

#### Key Functions:
- `initialize(admin, implementation)` – sets admin roles and wallet logic.
- `deployWallet(salt, owner, sweepRecipient, sweeper)` – creates a new wallet.
- `updateWalletImplementation(address)` – updates the wallet logic.
- `computeAddress(salt, owner)` – predict deterministic wallet address.

---

### UserWallet (Cloned)
- Lightweight wallet deployed via the factory.
- Upgradeable structure not required (uses shared logic).

#### Roles:
- `owner` – Has full administrative control. Can pause, update sweep recipient, or manage sweeper roles.
- `SWEEPER_ROLE` – Can call `sweepETH()` and `sweepToken()`.

#### Initialization Parameters:
- `owner`: Admin of this wallet.
- `sweepRecipient`: Address to receive ETH/tokens.
- `sweeper`: Optional address to grant `SWEEPER_ROLE`. Defaults to `owner` if set to `address(0)`.

#### Key Functions:
- `sweepETH()` – Transfers all ETH to the `sweepRecipient`. Only callable by `SWEEPER_ROLE`.
- `sweepToken(tokenAddress)` – Transfers all of a given ERC20 token to the `sweepRecipient`.
- `updateSweepRecipient(address)` – Changes sweep target. Only callable by `owner`.
- `pause()` / `unpause()` – Emergency control. Only callable by `owner`.

---

## Deployment Flow
1. Deploy `UserWallet` logic contract.
2. Deploy `WalletFactory` as a proxy using `deployProxy()` and call `initialize()`.
3. Call `deployWallet()` to deterministically deploy a new `UserWallet` clone:
    - `walletOwner` becomes the wallet's `Ownable` admin.
    - `sweepRecipient` is the address funds are sent to.
    - `sweeper` is granted `SWEEPER_ROLE`.

## Security Best Practices
- Assign `DEFAULT_ADMIN_ROLE` and `UPGRADER_ROLE` to a Gnosis Safe.
- Use low-privilege hot wallets for sweeping (via `SWEEPER_ROLE`).
- Never deploy wallets without setting a `sweepRecipient`.

## Testing Highlights
- Tests simulate full wallet lifecycle:
    - Deployment via `deployProxy()`
    - Funding and sweeping ETH and USDT
    - Role-restricted access
---

## Future Improvements
- Add support for ERC-721 or ERC-1155 sweeps
- Support multi-recipient routing or fee-splitting
- Gas refund mechanism to cover sweep costs from withdrawn balance
