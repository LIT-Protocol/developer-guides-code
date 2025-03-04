// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/WhitelistEIP1271.sol";

contract DeployWhitelistEIP1271 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Sample whitelist addresses (replace with actual addresses if needed)
        address[] memory whitelistedAddresses = new address[](3);
        whitelistedAddresses[0] = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        whitelistedAddresses[1] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        whitelistedAddresses[2] = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;

        // Set the signature threshold
        uint256 signatureThreshold = 2;

        // Deploy the contract
        WhitelistEIP1271 whitelistContract = new WhitelistEIP1271(whitelistedAddresses, signatureThreshold);

        console.log("WhitelistEIP1271 deployed at:", address(whitelistContract));

        vm.stopBroadcast();
    }
}