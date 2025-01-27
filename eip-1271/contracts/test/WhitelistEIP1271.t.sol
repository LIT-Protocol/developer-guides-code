// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/WhitelistEIP1271.sol";

contract WhitelistEIP1271Test is Test {
    WhitelistEIP1271 public whitelistContract;
    uint256 constant SIGNATURE_THRESHOLD = 2;
    address[] whitelistedAddresses;
    uint256[] privateKeys;

    function setUp() public {
        // Generate some test addresses and their private keys
        for (uint i = 0; i < 3; i++) {
            uint256 privateKey = uint256(keccak256(abi.encodePacked("test key", i)));
            address addr = vm.addr(privateKey);
            whitelistedAddresses.push(addr);
            privateKeys.push(privateKey);
        }

        whitelistContract = new WhitelistEIP1271(whitelistedAddresses, SIGNATURE_THRESHOLD);
    }

    function testWhitelisting() public {
        for (uint i = 0; i < whitelistedAddresses.length; i++) {
            assertTrue(whitelistContract.isWhitelisted(whitelistedAddresses[i]));
        }
        assertFalse(whitelistContract.isWhitelisted(address(0xdead)));
    }

    function testGetWhitelistedAddresses() public {
        address[] memory returnedAddresses = whitelistContract.getWhitelistedAddresses();
        assertEq(returnedAddresses.length, whitelistedAddresses.length);
        for (uint i = 0; i < whitelistedAddresses.length; i++) {
            assertEq(returnedAddresses[i], whitelistedAddresses[i]);
        }
    }

    function testIsValidSignature() public {
        // Create a sample transaction
        address to = address(0x1234567890123456789012345678901234567890);
        uint256 value = 1 ether;
        bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", address(0xdead), 100);
        uint256 nonce = 1;
        uint256 gasPrice = 20 gwei;
        uint256 gasLimit = 21000;
        uint256 chainId = 1;

        // Serialize the transaction
        bytes memory serializedTx = abi.encode(
            to,
            value,
            data,
            nonce,
            gasPrice,
            gasLimit,
            chainId
        );

        // Hash the serialized transaction
        bytes32 txHash = keccak256(serializedTx);

        bytes memory signatures = new bytes(0);

        // Test with no signatures
        assertEq(whitelistContract.isValidSignature(txHash, signatures), bytes4(0xffffffff));

        // Test with one signature (below threshold)
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKeys[0], txHash);
        signatures = abi.encodePacked(r, s, v);
        assertEq(whitelistContract.isValidSignature(txHash, signatures), bytes4(0xffffffff));

        // Test with two signatures (at threshold)
        (v, r, s) = vm.sign(privateKeys[1], txHash);
        signatures = abi.encodePacked(signatures, r, s, v);
        assertEq(whitelistContract.isValidSignature(txHash, signatures), bytes4(0x1626ba7e));

        // Test with three signatures (above threshold)
        (v, r, s) = vm.sign(privateKeys[2], txHash);
        signatures = abi.encodePacked(signatures, r, s, v);
        assertEq(whitelistContract.isValidSignature(txHash, signatures), bytes4(0x1626ba7e));
    }

    function testInvalidSignature() public {
        bytes32 messageHash = keccak256("Hello, World!");
        uint256 nonWhitelistedPrivateKey = uint256(keccak256(abi.encodePacked("non-whitelisted key")));
        
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(nonWhitelistedPrivateKey, messageHash);
        bytes memory signatures = abi.encodePacked(r, s, v);

        assertEq(whitelistContract.isValidSignature(messageHash, signatures), bytes4(0xffffffff));
    }
}