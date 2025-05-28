// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract UserWallet is Initializable, OwnableUpgradeable, AccessControlUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    bytes32 public constant SWEEPER_ROLE = keccak256("SWEEPER_ROLE");

    address public sweepRecipient;

    event Received(address indexed from, uint256 value);
    event ETHSwept(address indexed to, uint256 amount);
    event TokenSwept(address indexed token, address indexed to, uint256 amount);
    event RecipientUpdated(address indexed newRecipient);

    function initialize(address _owner, address _recipient, address _sweeper) external initializer {
        require(_owner != address(0), "Invalid owner address");
        require(_recipient != address(0), "Invalid recipient address");
        require(_sweeper != address(0), "Invalid sweeper address");
        __Ownable_init();
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();

        transferOwnership(_owner);
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
        _grantRole(SWEEPER_ROLE, _owner);
        _grantRole(SWEEPER_ROLE, _sweeper);
        sweepRecipient = _recipient;
        emit RecipientUpdated(_recipient);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function updateSweepRecipient(address newRecipient) external onlyOwner {
        sweepRecipient = newRecipient;
        emit RecipientUpdated(newRecipient);
    }

    function sweepETH() external onlyRole(SWEEPER_ROLE) whenNotPaused nonReentrant {
        uint256 bal = address(this).balance;
        require(bal > 0, "No ETH balance");
        payable(sweepRecipient).transfer(bal);
        emit ETHSwept(sweepRecipient, bal);
    }

    function sweepToken(address token) external onlyRole(SWEEPER_ROLE) whenNotPaused nonReentrant {
        uint256 bal = IERC20(token).balanceOf(address(this));
        require(bal > 0, "No token balance");
        require(IERC20(token).transfer(sweepRecipient, bal), "Token transfer failed");
        emit TokenSwept(token, sweepRecipient, bal);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
