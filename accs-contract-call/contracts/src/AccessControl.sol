// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract AccessControl {
    mapping(address => bool) public revokedAccess;

    function grantAccess() public {
        revokedAccess[msg.sender] = false;
    }

    function revokeAccess() public {
        revokedAccess[msg.sender] = true;
    }

    function hasRevokedAccess(address user) public view returns (bool) {
        return revokedAccess[user];
    }
}
