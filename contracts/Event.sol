// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
* @notice Emitted when a profile add/ update reward.
* @param sender The address of the visitor.
* @param rewardTokenAddress The reward token.
* @param totalAmount The amount of tokens/LYX.
* @param rewardAmount The amount of tokens/LYX to reward visitors.
* @param claimInterval The interval between claims.
*/
event RewardGiven(address indexed sender, address indexed rewardTokenAddress, uint256 totalAmount, uint256 rewardAmount, uint256 claimInterval);

/**
* @notice Emitted when a visitor claims a reward.
* @param visitor The address of the visitor.
* @param from The address of profile/ host.
* @param amount The amount of tokens/LYX claimed.
*/
event RewardClaimed(address indexed visitor, address indexed from, uint256 indexed amount);

/**
* @notice Emitted when the claiming status is changed.
* @param profileOwner The owner of profile/ sender.
* @param enabled The new claiming status.
*/
event ClaimingStatusChanged(address profileOwner, bool enabled);
