// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {AccessControl} from "../src/AccessControl.sol";

contract AccessControlTest is Test {
    AccessControl public accessControl;

    function setUp() public {
        accessControl = new AccessControl();
    }
    
    function testGrantedByDefault() public {
        address user = address(this);
        assertFalse(accessControl.hasRevokedAccess(user));
    }

    function testGrantAccess() public {
        address user = address(this);
        accessControl.grantAccess();
        assertFalse(accessControl.hasRevokedAccess(user));
    }

    function testRevokeAccess() public {
        address user = address(this);
        accessControl.revokeAccess();
        assertTrue(accessControl.hasRevokedAccess(user));
    }

    function testHasRevokedAccess() public {
        address user1 = address(this);
        address user2 = address(0xFEED);

        vm.prank(user1);
        accessControl.revokeAccess();

        vm.prank(user2);
        accessControl.grantAccess();

        assertTrue(accessControl.hasRevokedAccess(user1));
        assertFalse(accessControl.hasRevokedAccess(user2));
    }
}
