// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./WalletFactory.sol";

contract WalletFactoryV2 is WalletFactory {
    function initialize(address admin, address implementation) public override initializer {
        WalletFactory.initialize(admin, implementation); // direct base call
    }


    function version() public pure returns (string memory) {
        return "v2";
    }
}
