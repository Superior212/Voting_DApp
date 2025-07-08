// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract VotingContract {
    struct Candidate {
        address candidateAddress;
        string name;
        uint256 voteCount;
    }

    struct VotingEvent {
        uint256 eventId;
        string eventName;
        string description;
        uint256 endDate;
        bool isActive;
        bool isCompleted;
        address winner;
        uint256 totalVotes;
        mapping(address => bool) hasVoted;
        mapping(uint256 => Candidate) candidates;
        uint256 candidateCount;
    }

    mapping(uint256 => VotingEvent) public votingEvents;
    uint256 public eventCount;
    address public owner;

    event VotingEventCreated(
        uint256 eventId,
        string eventName,
        uint256 endDate
    );
    event VoteCast(uint256 eventId, address voter, address candidate);
    event VotingEventCompleted(
        uint256 eventId,
        address winner,
        uint256 voteCount
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier eventExists(uint256 _eventId) {
        require(
            _eventId > 0 && _eventId <= eventCount,
            "Voting event does not exist"
        );
        _;
    }

    modifier eventActive(uint256 _eventId) {
        require(votingEvents[_eventId].isActive, "Voting event is not active");
        _;
    }

    modifier eventNotCompleted(uint256 _eventId) {
        require(
            !votingEvents[_eventId].isCompleted,
            "Voting event is already completed"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createVotingEvent(
        string memory _eventName,
        string memory _description,
        uint256 _durationInMinutes
    ) public onlyOwner returns (uint256) {
        require(_durationInMinutes > 0, "Duration must be greater than 0");

        eventCount++;
        uint256 eventId = eventCount;

        VotingEvent storage newEvent = votingEvents[eventId];
        newEvent.eventId = eventId;
        newEvent.eventName = _eventName;
        newEvent.description = _description;
        newEvent.endDate = block.timestamp + (_durationInMinutes * 1 minutes);
        newEvent.isActive = true;
        newEvent.isCompleted = false;
        newEvent.candidateCount = 0;
        newEvent.totalVotes = 0;

        emit VotingEventCreated(eventId, _eventName, newEvent.endDate);
        return eventId;
    }

    function addCandidate(
        uint256 _eventId,
        address _candidateAddress,
        string memory _candidateName
    )
        public
        onlyOwner
        eventExists(_eventId)
        eventActive(_eventId)
        eventNotCompleted(_eventId)
    {
        require(_candidateAddress != address(0), "Invalid candidate address");
        require(
            bytes(_candidateName).length > 0,
            "Candidate name cannot be empty"
        );

        VotingEvent storage event_ = votingEvents[_eventId];

        // Check if candidate already exists
        for (uint256 i = 0; i < event_.candidateCount; i++) {
            require(
                event_.candidates[i].candidateAddress != _candidateAddress,
                "Candidate already exists"
            );
        }

        event_.candidates[event_.candidateCount] = Candidate({
            candidateAddress: _candidateAddress,
            name: _candidateName,
            voteCount: 0
        });
        event_.candidateCount++;
    }

    function vote(
        uint256 _eventId,
        uint256 _candidateIndex
    )
        public
        eventExists(_eventId)
        eventActive(_eventId)
        eventNotCompleted(_eventId)
    {
        VotingEvent storage event_ = votingEvents[_eventId];

        require(block.timestamp < event_.endDate, "Voting period has ended");
        require(!event_.hasVoted[msg.sender], "You have already voted");
        require(
            _candidateIndex < event_.candidateCount,
            "Invalid candidate index"
        );

        event_.hasVoted[msg.sender] = true;
        event_.candidates[_candidateIndex].voteCount++;
        event_.totalVotes++;

        emit VoteCast(
            _eventId,
            msg.sender,
            event_.candidates[_candidateIndex].candidateAddress
        );
    }

    function completeVotingEvent(
        uint256 _eventId
    )
        public
        eventExists(_eventId)
        eventActive(_eventId)
        eventNotCompleted(_eventId)
    {
        VotingEvent storage event_ = votingEvents[_eventId];

        require(
            block.timestamp >= event_.endDate,
            "Voting period has not ended yet"
        );

        event_.isActive = false;
        event_.isCompleted = true;

        if (event_.candidateCount > 0) {
            uint256 winningVoteCount = 0;
            address winningCandidate = address(0);

            for (uint256 i = 0; i < event_.candidateCount; i++) {
                if (event_.candidates[i].voteCount > winningVoteCount) {
                    winningVoteCount = event_.candidates[i].voteCount;
                    winningCandidate = event_.candidates[i].candidateAddress;
                }
            }

            event_.winner = winningCandidate;
        }

        emit VotingEventCompleted(_eventId, event_.winner, event_.totalVotes);
    }

    function getVotingEvent(
        uint256 _eventId
    )
        public
        view
        eventExists(_eventId)
        returns (
            uint256 eventId,
            string memory eventName,
            string memory description,
            uint256 endDate,
            bool isActive,
            bool isCompleted,
            address winner,
            uint256 totalVotes,
            uint256 candidateCount
        )
    {
        VotingEvent storage event_ = votingEvents[_eventId];
        return (
            event_.eventId,
            event_.eventName,
            event_.description,
            event_.endDate,
            event_.isActive,
            event_.isCompleted,
            event_.winner,
            event_.totalVotes,
            event_.candidateCount
        );
    }

    function getCandidate(
        uint256 _eventId,
        uint256 _candidateIndex
    )
        public
        view
        eventExists(_eventId)
        returns (
            address candidateAddress,
            string memory name,
            uint256 voteCount
        )
    {
        VotingEvent storage event_ = votingEvents[_eventId];
        require(
            _candidateIndex < event_.candidateCount,
            "Invalid candidate index"
        );

        Candidate storage candidate = event_.candidates[_candidateIndex];
        return (
            candidate.candidateAddress,
            candidate.name,
            candidate.voteCount
        );
    }

    function hasVoted(
        uint256 _eventId,
        address _voter
    ) public view eventExists(_eventId) returns (bool) {
        return votingEvents[_eventId].hasVoted[_voter];
    }

    function getEventCount() public view returns (uint256) {
        return eventCount;
    }

    function getTimeRemaining(
        uint256 _eventId
    ) public view eventExists(_eventId) returns (uint256) {
        VotingEvent storage event_ = votingEvents[_eventId];
        if (block.timestamp >= event_.endDate) {
            return 0;
        }
        return event_.endDate - block.timestamp;
    }
}
