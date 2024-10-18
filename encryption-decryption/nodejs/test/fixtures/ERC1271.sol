// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract ERC1271 {
    /**
     * @notice Verifies if a signature is valid for a given signer, hash, and signature.
     * @param _signer    Address of the signer to verify the signature against
     * @param _hash      Hash of the signed message
     * @param _signature Signature byte array associated with _hash
     * @return isValid   Boolean indicating whether the signature is valid
     */
    function isValidSignature(
        address _signer,
        bytes32 _hash,
        bytes memory _signature
    ) public pure returns (bool isValid) {
        // Return false is the signature length is invalid
        if (_signature.length != 65) {
            return false;
        }

        bytes32 r;
        bytes32 s;
        uint8 v;

        // Extract the r, s, and v values from the ECDSA signature
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }

        // Adjust the v value (0 or 1) to be what Ethereum expects (27 or 28)
        if (v < 27) {
            v += 27;
        }

        // Built-in solidity function for computing the public key from the signature,
        // and returning the address
        address recoveredAddress = ecrecover(_hash, v, r, s);

        // return a boolean to check our input against our computed address
        return (recoveredAddress == _signer);
    }
}
