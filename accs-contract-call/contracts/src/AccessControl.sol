// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract AccessControl {
    mapping(address => bool) public revokedAccess;

    function grantAccess(address user) public {
        revokedAccess[user] = false;
    }

    function revokeAccess(address user) public {
        revokedAccess[user] = true;
    }

    function hasRevokedAccess(address user) public view returns (bool) {
        return revokedAccess[user];
    }
}
