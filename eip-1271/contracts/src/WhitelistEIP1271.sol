// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract WhitelistEIP1271 {
    mapping(address => bool) public whitelist;
    address[] public whitelistedAddresses;
    mapping(bytes32 => bytes) public signatures;
    uint256 public immutable SIGNATURE_THRESHOLD;

    constructor(address[] memory _addresses, uint256 _threshold) {
        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = true;
            whitelistedAddresses.push(_addresses[i]);
        }
        SIGNATURE_THRESHOLD = _threshold;
    }

    function isWhitelisted(address _address) public view returns (bool) {
        return whitelist[_address];
    }

    function getWhitelistedAddresses() public view returns (address[] memory) {
        return whitelistedAddresses;
    }

    function signTx(bytes32 _txHash, bytes memory _signature) public returns (bool) {
        require(_signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        address signer = ecrecover(_txHash, v, r, s);
        require(signer != address(0), "ECDSA: invalid signature");
        require(whitelist[signer], "Signer not whitelisted");

        if (signatures[_txHash].length == 0) {
            signatures[_txHash] = _signature;
        } else {
            signatures[_txHash] = abi.encodePacked(signatures[_txHash], _signature);
        }
        
        return true;
    }

    function isValidSignature(bytes32 _hash, bytes memory _signatures) public view returns (bytes4) {
        if (_signatures.length == 0) {
            return 0xffffffff; // No signatures provided
        }

        if (_signatures.length % 65 != 0) {
            return 0xffffffff; // Invalid signatures length
        }

        uint256 signatureCount = _signatures.length / 65;
        uint256 whitelistedSignerCount = 0;
        
        for (uint256 i = 0; i < signatureCount; i++) {
            bytes32 r;
            bytes32 s;
            uint8 v;

            assembly {
                r := mload(add(_signatures, add(32, mul(i, 65))))
                s := mload(add(_signatures, add(64, mul(i, 65))))
                v := byte(0, mload(add(_signatures, add(96, mul(i, 65)))))
            }

            if (v < 27) {
                v += 27;
            }

            address signer = ecrecover(_hash, v, r, s);
            if (signer != address(0) && whitelist[signer]) {
                whitelistedSignerCount++;
            }
        }

        if (whitelistedSignerCount >= SIGNATURE_THRESHOLD) {
            return 0x1626ba7e; // bytes4(keccak256("isValidSignature(bytes32,bytes)")
        } else {
            return 0xffffffff; // Not enough valid signatures
        }
    }
}