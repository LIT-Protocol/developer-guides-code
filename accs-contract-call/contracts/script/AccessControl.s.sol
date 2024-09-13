// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {AccessControl} from "../src/AccessControl.sol";

contract DeployAccessControl is Script {
    AccessControl public accessControl;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        accessControl = new AccessControl();

        vm.stopBroadcast();
    }
}
