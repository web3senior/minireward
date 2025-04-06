// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ILSP7DigitalAsset as ILSP7} from "@lukso/lsp7-contracts/contracts/ILSP7DigitalAsset.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./Event.sol";
import "./Error.sol";

/// @title MiniReward
/// @author Aratta Labs
/// @notice A smart contract enabling users to post daily updates and comments, leveraging LUKSO's Universal Profiles.
/// @dev Deployed contract addresses are available in the project repository.
/// @custom:emoji 💵
/// @custom:security-contact atenyun@gmail.com
contract MiniReward is Ownable, Pausable {
    string public constant VERSION = "1.0.0";
    string failedMessage = "Failed to send Ether!";

    struct rewardPoolStruct {
        address rewardToken;
        uint256 amount;
        uint256 amountPerClaim;
        uint256 period;
        bool isPaused;
    }

    struct ClaimedReward {
        uint256 claimedTime;
        uint256 counter;
    }

    mapping(address => rewardPoolStruct) public rewards;
    mapping(address => mapping(address => ClaimedReward)) public hasClaimed;

    constructor() {}

    function giveReward(
        address rewardToken,
        uint256 amount,
        uint256 amountPerClaim,
        uint256 period
    ) public whenNotPaused {
        // Assert that period is grather than zero
        assert(period > 0);
        assert(amount > 0);

        // Send the old token to the owner(refresh the poll)
        if (rewards[_msgSender()].amount > 0) withdrawLSP7(true, "");

        uint256 authorizedAmount = ILSP7(rewardToken).authorizedAmountFor(address(this), _msgSender());
        if (authorizedAmount < amount) revert NotAuthorizedAmount(amount, authorizedAmount);

        ILSP7(rewardToken).transfer(_msgSender(), address(this), amount, true, "");

        rewards[_msgSender()].rewardToken = rewardToken;
        rewards[_msgSender()].amount = rewards[_msgSender()].amount + amount;
        rewards[_msgSender()].amountPerClaim = amountPerClaim;
        rewards[_msgSender()].period = period * 1 minutes;
        rewards[_msgSender()].isPaused = false;

        emit RewardGiven(_msgSender(), rewardToken, amount, amountPerClaim, period);
    }

    function claimReward(
        address from,
        bool force,
        bytes memory data
    ) public {
        address rewardToken = rewards[from].rewardToken;
        uint256 amount = rewards[from].amount;
        uint256 amountPerClaim = rewards[from].amountPerClaim;
        uint256 period = rewards[from].period;
        bool isPaused = rewards[from].isPaused;

        require(isPaused == false, "The reward is paused");
        require(amount > 0, "No reward to claim");
        require(hasClaimed[_msgSender()][from].claimedTime < block.timestamp, "Reward already claimed");

        ILSP7(rewardToken).transfer(address(this), _msgSender(), amountPerClaim, force, data);
        rewards[from].amount -= amountPerClaim;

        hasClaimed[_msgSender()][from].claimedTime = block.timestamp + period;
        hasClaimed[_msgSender()][from].counter += 1;

        emit RewardClaimed(_msgSender(), from, amount);
    }

    function withdrawLSP7(bool force, bytes memory data) public {
        ILSP7(rewards[_msgSender()].rewardToken).transfer(address(this), _msgSender(), rewards[_msgSender()].amount, force, data);
        rewards[_msgSender()].rewardToken = address(0);
        rewards[_msgSender()].amount = 0;
        rewards[_msgSender()].amountPerClaim = 0;
        rewards[_msgSender()].period = 0;
        rewards[_msgSender()].isPaused = true;
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
