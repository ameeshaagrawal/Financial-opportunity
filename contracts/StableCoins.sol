// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import { ERC20 } from "./ERC20.sol";
import { ERC20Mintable } from "./ERC20Mintable.sol";

contract Dai is ERC20, ERC20Mintable {
    function decimals() public pure returns (uint8) {
        return 18;
    }

    function rounding() public pure returns (uint8) {
        return 2;
    }

    function name() public pure returns (string memory) {
        return "Dai";
    }

    function symbol() public pure returns (string memory) {
        return "DAI";
    }
}

contract TrueUSD is ERC20, ERC20Mintable {
    function decimals() public pure returns (uint8) {
        return 18;
    }

    function rounding() public pure returns (uint8) {
        return 2;
    }

    function name() public pure returns (string memory) {
        return "TrueUSD";
    }

    function symbol() public pure returns (string memory) {
        return "TUSD";
    }
}