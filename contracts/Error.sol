// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

error Unauthorized();
error InsufficientBalance(uint256);
error SupplyLimitExceededAccount(address sender);
error PriceNotMet(uint256, address);