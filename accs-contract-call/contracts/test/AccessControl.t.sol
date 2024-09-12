// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {AccessControl} from "../src/AccessControl.sol";

contract AccessControlTest is Test {
    AccessControl public accessControl;

    function setUp() public {
        accessControl = new AccessControl();
    }

    function testGrantAccess() public {
        address user = address(0xBEEF);
        accessControl.grantAccess(user);
        assertFalse(accessControl.hasRevokedAccess(user));
    }

    function testRevokeAccess() public {
        address user = address(0xCAFE);
        accessControl.revokeAccess(user);
        assertTrue(accessControl.hasRevokedAccess(user));
    }

    function testHasRevokedAccess() public {
        address user1 = address(0xDEAD);
        address user2 = address(0xFEED);

        accessControl.revokeAccess(user1);
        accessControl.grantAccess(user2);

        assertTrue(accessControl.hasRevokedAccess(user1));
        assertFalse(accessControl.hasRevokedAccess(user2));
    }
}
