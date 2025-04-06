// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

event RewardGiven(address indexed owner, address indexed rewardToken, uint256 amount, uint256 amountPerClaim, uint256 period);
event RewardClaimed(address indexed claimer, address indexed from, uint256 indexed amount);