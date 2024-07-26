// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TokenAllowlist {
    // Mapping of token ID to a mapping of addresses to their allowlist status
    mapping(uint256 => mapping(address => bool)) private allowlists;

    // Event emitted when an address is added to an allowlist
    event AddedToAllowlist(uint256 indexed tokenId, address indexed account);

    // Event emitted when an address is removed from an allowlist
    event RemovedFromAllowlist(uint256 indexed tokenId, address indexed account);

    // Function to add an address to the allowlist for a specific token ID
    function addToAllowlist(uint256 tokenId, address account) public {
        allowlists[tokenId][account] = true;
        emit AddedToAllowlist(tokenId, account);
    }

    // Function to remove an address from the allowlist for a specific token ID
    function removeFromAllowlist(uint256 tokenId, address account) public {
        allowlists[tokenId][account] = false;
        emit RemovedFromAllowlist(tokenId, account);
    }

    // Function to check if an address is on the allowlist for a specific token ID
    function isOnAllowlist(address account, uint256 tokenId) public view returns (bool) {
        return allowlists[tokenId][account];
    }
}