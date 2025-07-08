// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/VotingContract.sol";

contract VotingContractTest is Test {
    VotingContract public votingContract;
    address public owner;
    address public voter1;
    address public voter2;
    address public candidate1;
    address public candidate2;

    function setUp() public {
        owner = address(1);
        voter1 = address(2);
        voter2 = address(3);
        candidate1 = address(4);
        candidate2 = address(5);

        vm.startPrank(owner);
        votingContract = new VotingContract();
        vm.stopPrank();
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

        (
            uint256 id,
            string memory name,
            string memory description,
            uint256 endDate,
            bool isActive,
            bool isCompleted,
            address winner,
            uint256 totalVotes,
            uint256 candidateCount
        ) = votingContract.getVotingEvent(1);

        assertEq(id, 1);
        assertEq(name, "Test Election");
        assertEq(description, "A test voting event");
        assertTrue(isActive);
        assertFalse(isCompleted);
        assertEq(winner, address(0));
        assertEq(totalVotes, 0);
        assertEq(candidateCount, 0);

        vm.stopPrank();
    }

    function testAddCandidate() public {
        vm.startPrank(owner);

        uint256 eventId = votingContract.createVotingEvent(
            "Test Election",
            "A test voting event",
            60
        );

        votingContract.addCandidate(eventId, candidate1, "Candidate 1");
        votingContract.addCandidate(eventId, candidate2, "Candidate 2");

        (, , , , , , , , uint256 candidateCount) = votingContract
            .getVotingEvent(eventId);

        assertEq(candidateCount, 2);

        (address addr1, string memory name1, uint256 votes1) = votingContract
            .getCandidate(eventId, 0);
        assertEq(addr1, candidate1);
        assertEq(name1, "Candidate 1");
        assertEq(votes1, 0);

        (address addr2, string memory name2, uint256 votes2) = votingContract
            .getCandidate(eventId, 1);
        assertEq(addr2, candidate2);
        assertEq(name2, "Candidate 2");
        assertEq(votes2, 0);

        vm.stopPrank();
    }

    function testVote() public {
        vm.startPrank(owner);

        uint256 eventId = votingContract.createVotingEvent(
            "Test Election",
            "A test voting event",
            60
        );

        votingContract.addCandidate(eventId, candidate1, "Candidate 1");
        votingContract.addCandidate(eventId, candidate2, "Candidate 2");

        vm.stopPrank();

        // Voter 1 votes for candidate 1
        vm.startPrank(voter1);
        votingContract.vote(eventId, 0);
        vm.stopPrank();

        // Voter 2 votes for candidate 2
        vm.startPrank(voter2);
        votingContract.vote(eventId, 1);
        vm.stopPrank();

        (address addr1, , uint256 votes1) = votingContract.getCandidate(
            eventId,
            0
        );
        (address addr2, , uint256 votes2) = votingContract.getCandidate(
            eventId,
            1
        );

        assertEq(votes1, 1);
        assertEq(votes2, 1);

        assertTrue(votingContract.hasVoted(eventId, voter1));
        assertTrue(votingContract.hasVoted(eventId, voter2));
    }

    function testCompleteVotingEvent() public {
        vm.startPrank(owner);

        uint256 eventId = votingContract.createVotingEvent(
            "Test Election",
            "A test voting event",
            1 // 1 minute duration
        );

        votingContract.addCandidate(eventId, candidate1, "Candidate 1");
        votingContract.addCandidate(eventId, candidate2, "Candidate 2");

        vm.stopPrank();

        // Vote for candidate 1
        vm.startPrank(voter1);
        votingContract.vote(eventId, 0);
        vm.stopPrank();

        // Vote for candidate 2
        vm.startPrank(voter2);
        votingContract.vote(eventId, 1);
        vm.stopPrank();

        // Fast forward time
        vm.warp(block.timestamp + 61);

        // Complete the voting event
        votingContract.completeVotingEvent(eventId);

        (
            uint256 eventIdRet,
            string memory eventName,
            string memory description,
            uint256 endDate,
            bool isActive,
            bool isCompleted,
            address winner,
            uint256 totalVotes,
            uint256 candidateCount
        ) = votingContract.getVotingEvent(eventId);

        assertFalse(isActive);
        assertTrue(isCompleted);
        assertEq(totalVotes, 2);
        // Winner should be candidate 2 (index 1) since both got 1 vote but candidate 2 was added later
    }

    function testCannotVoteTwice() public {
        vm.startPrank(owner);

        uint256 eventId = votingContract.createVotingEvent(
            "Test Election",
            "A test voting event",
            60
        );

        votingContract.addCandidate(eventId, candidate1, "Candidate 1");

        vm.stopPrank();

        vm.startPrank(voter1);
        votingContract.vote(eventId, 0);

        // Try to vote again
        vm.expectRevert("You have already voted");
        votingContract.vote(eventId, 0);

        vm.stopPrank();
    }

    function testCannotVoteAfterEndDate() public {
        vm.startPrank(owner);

        uint256 eventId = votingContract.createVotingEvent(
            "Test Election",
            "A test voting event",
            1 // 1 minute duration
        );

        votingContract.addCandidate(eventId, candidate1, "Candidate 1");

        vm.stopPrank();

        // Fast forward time
        vm.warp(block.timestamp + 61);

        vm.startPrank(voter1);
        vm.expectRevert("Voting period has ended");
        votingContract.vote(eventId, 0);

        vm.stopPrank();
    }

    function testOnlyOwnerCanCreateEvent() public {
        vm.startPrank(voter1);

        vm.expectRevert("Only owner can perform this action");
        votingContract.createVotingEvent(
            "Test Election",
            "A test voting event",
            60
        );

        vm.stopPrank();
    }

    function testOnlyOwnerCanAddCandidates() public {
        vm.startPrank(owner);

        uint256 eventId = votingContract.createVotingEvent(
            "Test Election",
            "A test voting event",
            60
        );

        vm.stopPrank();

        vm.startPrank(voter1);

        vm.expectRevert("Only owner can perform this action");
        votingContract.addCandidate(eventId, candidate1, "Candidate 1");

        vm.stopPrank();
    }
}
