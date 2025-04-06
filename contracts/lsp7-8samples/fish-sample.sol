// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol";
import {_LSP4_TOKEN_TYPE_TOKEN} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import "./_error.sol";

/// @title Fish
/// @author Aratta Labs
/// @notice Fish token
/// @dev You will find the deployed contract addresses on the official website
/// @custom:emoji 🦭
/// @custom:security-contact atenyun@gmail.com
contract Fish is LSP7Mintable {
    uint256 public constant tokenSupplyCap = 500_000_000 ether;

    constructor() LSP7Mintable("Fish", "FISH", msg.sender, _LSP4_TOKEN_TYPE_TOKEN, false) {
        mint(msg.sender, 500_000_000 * 10**decimals(), true, "");
    }

    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        if (totalSupply() + amount > tokenSupplyCap) revert SupplyLimitExceeded(totalSupply(), tokenSupplyCap);
        super._mint(to, amount, force, data);
    }
}
