// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import {ILSP7DigitalAsset as ILSP7} from "@lukso/lsp7-contracts/contracts/ILSP7DigitalAsset.sol";
import {ILSP26FollowerSystem as LSP26FollowerSystem} from "@lukso/lsp26-contracts/contracts/ILSP26FollowerSystem.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./Event.sol";
import "./Error.sol";

/// @title MiniReward
/// @author Aratta Labs
/// @notice A smart contract to reward visitors of a LUKSO profile with LSP7 tokens or LYX.
/// @dev Deployed contract addresses are available in the project repository.
/// @custom:emoji 💵
/// @custom:security-contact atenyun@gmail.com
contract MiniReward is Ownable, Pausable, ReentrancyGuard {
    string public constant VERSION = "2.0.0";
    string failedMessage = "Failed to send Ether!";
    uint8 public fee;
    LSP26FollowerSystem public immutable followerSystem;

    struct rewardPoolStruct {
        address rewardTokenAddress; // The address of the LSP7 token.
        uint256 totalAmount; // The amount of tokens to reward profiles.
        uint256 remainderAmount; // The amount of tokens left.
        uint256 rewardAmount; // The amount of tokens/LYX to reward per claim.
        uint256 claimInterval; // The interval between claims
        bool isClaimingEnabled; // Flag to enable/disable claiming.
    }

    struct ClaimedReward {
        uint256 nextClaim;
        uint256 counter;
    }

    mapping(address => rewardPoolStruct) public rewards;
    mapping(address => mapping(address => ClaimedReward)) public hasClaimed;

    constructor(address _followerSystemAddress) {
        followerSystem = LSP26FollowerSystem(_followerSystemAddress);
    }

    function updateFee(uint8 _fee) public onlyOwner {
        fee = _fee;
        emit FeeUpdated(_fee);
    }

    function setClaimingStatus(bool _enabled) external {
        rewards[_msgSender()].isClaimingEnabled = _enabled;
        emit ClaimingStatusChanged(_msgSender(), _enabled);
    }

    function giveReward(
        address _rewardTokenAddress,
        uint256 _totalAmount,
        uint256 _rewardAmount,
        uint256 _interval
    ) external payable whenNotPaused nonReentrant {
        require(_rewardTokenAddress != address(0), "Token address cannot be zero");
        require(_totalAmount > 0, "Total amount must be greater than zero");
        require(_rewardAmount > 0, "Reward amount must be greater than zero");
        require(_rewardAmount <= _totalAmount, "Reward amount can't be greater than total amount");
        require(_interval > 0, "Claim interval must be greater than zero");

        // Chk fee
        if (fee > 0) {
            if (msg.value < fee) revert InsufficientBalance(msg.value);
            (bool success, ) = owner().call{value: msg.value}("");
            require(success, failedMessage);
        }

        // Send the old token to the owner(refresh the poll)
        if (rewards[_msgSender()].rewardAmount > 0) transferLSP7("");

        ILSP7(_rewardTokenAddress).transfer(_msgSender(), address(this), _totalAmount, true, "");

        rewards[_msgSender()].rewardTokenAddress = _rewardTokenAddress;
        rewards[_msgSender()].totalAmount = _totalAmount;
        rewards[_msgSender()].remainderAmount = _totalAmount;
        rewards[_msgSender()].rewardAmount = _rewardAmount;
        rewards[_msgSender()].claimInterval = _interval * 1 hours;
        rewards[_msgSender()].isClaimingEnabled = true;

        emit RewardGiven(_msgSender(), _rewardTokenAddress, _totalAmount, _rewardAmount, _interval);
    }

    function claimReward(address from, bytes memory data) public whenNotPaused nonReentrant {
        address rewardTokenAddress = rewards[from].rewardTokenAddress;
        uint256 remainderAmount = rewards[from].remainderAmount;
        uint256 rewardAmount = rewards[from].rewardAmount;
        uint256 claimInterval = rewards[from].claimInterval;
        bool isClaimingEnabled = rewards[from].isClaimingEnabled;

        // Chk if sender is following the profile
        require(followerSystem.isFollowing(_msgSender(), from), "You aren't following the profile");

        require(isClaimingEnabled, "Claiming is currently disabled");
        require(remainderAmount >= rewardAmount, InsufficientBalance(remainderAmount)); // Check if reward amount is greater than total amount.

        require(hasClaimed[_msgSender()][from].nextClaim < block.timestamp, "Reward already claimed");

        ILSP7(rewardTokenAddress).transfer(address(this), _msgSender(), rewardAmount, false, data);
        rewards[from].remainderAmount -= rewardAmount;

        hasClaimed[_msgSender()][from].nextClaim = block.timestamp + claimInterval;
        hasClaimed[_msgSender()][from].counter += 1;

        emit RewardClaimed(_msgSender(), from, rewardTokenAddress, remainderAmount);
    }

    function transferLSP7(bytes memory data) public {
        ILSP7(rewards[_msgSender()].rewardTokenAddress).transfer(address(this), _msgSender(), rewards[_msgSender()].remainderAmount, false, data); // The address must be a profile (ERC725Account)
        rewards[_msgSender()].rewardTokenAddress = address(0);
        rewards[_msgSender()].totalAmount = 0;
        rewards[_msgSender()].remainderAmount = 0;
        rewards[_msgSender()].rewardAmount = 0;
        rewards[_msgSender()].claimInterval = 0;
        rewards[_msgSender()].isClaimingEnabled = true;

        emit Withdrawn(_msgSender(), rewards[_msgSender()].rewardTokenAddress, rewards[_msgSender()].remainderAmount);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Failed");
    }

    function transferBalance(address payable _to, uint256 _amount) public onlyOwner {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
