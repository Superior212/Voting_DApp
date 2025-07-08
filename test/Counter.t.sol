// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/VotingContract.sol";

contract VotingContractBasicTest is Test {
    VotingContract public votingContract;
    address public owner;

    function setUp() public {
        owner = address(1);
        vm.startPrank(owner);
        votingContract = new VotingContract();
        vm.stopPrank();
    }

    function testContractDeployment() public {
        assertEq(votingContract.owner(), owner);
        assertEq(votingContract.getEventCount(), 0);
    }

    function testCreateVotingEvent() public {
        vm.startPrank(owner);

        uint256 eventId = votingContract.createVotingEvent(
            "Test Election",
            "A test voting event",
            60 // 60 minutes duration
        );

        assertEq(eventId, 1);
        assertEq(votingContract.getEventCount(), 1);

        vm.stopPrank();
    }
}
