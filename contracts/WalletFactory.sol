// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "./UserWallet.sol";

contract WalletFactory is Initializable, AccessControlUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    address public walletImplementation;

    event WalletDeployed(address wallet, address owner, bytes32 salt);
    event WalletImplementationUpdated(address newImplementation);

    function initialize(address admin, address implementation) public virtual initializer {
        __AccessControl_init();
        __Pausable_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(DEPLOYER_ROLE, admin);
        _grantRole(UPGRADER_ROLE, admin);

        walletImplementation = implementation;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

     function updateWalletImplementation(address newImplementation) external onlyRole(UPGRADER_ROLE) {
        walletImplementation = newImplementation;
        emit WalletImplementationUpdated(newImplementation);
    }

    function deployWallet(bytes32 salt, address walletOwner, address sweepRecipient, address sweeper) external whenNotPaused onlyRole(DEPLOYER_ROLE) returns (address) {
        bytes32 finalSalt = keccak256(abi.encodePacked(salt, walletOwner));
        address clone = ClonesUpgradeable.cloneDeterministic(walletImplementation, finalSalt);
        UserWallet(payable(clone)).initialize(walletOwner, sweepRecipient, sweeper);
        emit WalletDeployed(clone, walletOwner, salt);
        return clone;
    }

    function computeAddress(bytes32 salt, address walletOwner) external view returns (address) {
        bytes32 finalSalt = keccak256(abi.encodePacked(salt, walletOwner));
        return ClonesUpgradeable.predictDeterministicAddress(walletImplementation, finalSalt, address(this));
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}
}
