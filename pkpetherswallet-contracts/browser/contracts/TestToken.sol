// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TestToken {
    // Storage
    mapping(address => string) private messages;
    
    // Write function
    function writeMessage(string memory newMessage) public {
        messages[msg.sender] = newMessage;
    }
    
    // Read function
    function readMessage(address user) public view returns (string memory) {
        return messages[user];
    }
    
    // Read your own message
    function readMyMessage() public view returns (string memory) {
        return messages[msg.sender];
    }
} 