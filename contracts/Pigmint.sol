// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {LSP8IdentifiableDigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {LSP8NotTokenOperator} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8Errors.sol";
import {_LSP4_TOKEN_TYPE_TOKEN, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_METADATA_KEY} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import "./Event.sol";
import "./Error.sol";
import "./Pausable.sol";

/// @title Pigmint
/// @author Aratta Labs
/// @notice A smart contract enabling users to post daily updates and comments, leveraging LUKSO's Universal Profiles.
/// @dev Deployed contract addresses are available in the project repository.
/// @custom:emoji 🐷
/// @custom:security-contact atenyun@gmail.com
contract Pigmint is LSP8IdentifiableDigitalAsset("Pigmint", "PIG", msg.sender, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_TOKEN_TYPE_TOKEN), Pausable {
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;

    string public constant VERSION = "1.0.0";
    uint256 public mintPrice;
    uint8 public constant LIMIT = 1;
    string failedMessage = "Failed to send Ether!";

    mapping(address => uint8) public mintPool;

    function updateMintPrice(uint256 amount) public onlyOwner {
        mintPrice = amount;
        emit MintPriceUpdated(amount, _msgSender());
    }

    function getMetadata(string memory metadata) public pure returns (bytes memory) {
        bytes memory verfiableURI = bytes.concat(hex"00006f357c6a0020", keccak256(bytes(metadata)), abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(metadata))));
        return verfiableURI;
    }

    function burn(bytes32 tokenId, bytes memory data) public virtual {
        if (!_isOperatorOrOwner(msg.sender, tokenId)) {
            revert LSP8NotTokenOperator(tokenId, msg.sender);
        }
        _burn(tokenId, data);
    }

    function mintPigMood(string memory metadata) public payable whenNotPaused returns (bool) {
        if (_msgSender() != owner()) {
            require(LIMIT > mintPool[_msgSender()], "Limitation per wallet exceeded.");
        }

        if (mintPrice > 0) {
            if (msg.value < mintPrice) revert InsufficientBalance(msg.value);
            (bool success3, ) = owner().call{value: mintPrice}("");
            require(success3, failedMessage);
        }

        _tokenIdCounter.increment();
        bytes32 newTokenId = bytes32(_tokenIdCounter.current());
        _mint({to: _msgSender(), tokenId: newTokenId, force: true, data: ""});

        _setDataForTokenId(newTokenId, _LSP4_METADATA_KEY, getMetadata(metadata));

        mintPool[_msgSender()] = mintPool[_msgSender()] + 1;

        return true;
    }

    function updatePigMood(
        bytes32 tokenId,
        string memory metadata,
        string memory moodName
    ) public payable whenNotPaused returns (bool) {
        if (tokenOwnerOf(tokenId) != _msgSender()) revert Unauthorized();
        _setDataForTokenId(tokenId, _LSP4_METADATA_KEY, getMetadata(metadata));
        emit MoodUpdated(_msgSender(), tokenId, moodName, block.timestamp);
        return true;
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

    function getBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
