pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Tether USD", "USDT") {
        _mint(msg.sender, 1000000 * 10 ** decimals()); // 1,000,000 USDT
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}