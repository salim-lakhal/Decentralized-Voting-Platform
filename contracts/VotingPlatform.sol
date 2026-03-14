// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotingPlatform {
    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 candidateCount;
        bool exists;
    }

    address public admin;
    uint256 public electionCount;

    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => uint256)) public voterChoice;

    event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime);
    event CandidateAdded(uint256 indexed electionId, uint256 indexed candidateId, string name);
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createElection(
        string calldata _title,
        string calldata _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyAdmin returns (uint256) {
        require(_startTime < _endTime, "Start time must be before end time");
        require(_endTime > block.timestamp, "End time must be in the future");

        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            candidateCount: 0,
            exists: true
        });

        emit ElectionCreated(electionCount, _title, _startTime, _endTime);
        return electionCount;
    }

    function addCandidate(
        uint256 _electionId,
        string calldata _name,
        string calldata _description
    ) external onlyAdmin electionExists(_electionId) {
        require(block.timestamp < elections[_electionId].startTime, "Cannot add candidates after election starts");

        Election storage election = elections[_electionId];
        election.candidateCount++;

        candidates[_electionId][election.candidateCount] = Candidate({
            id: election.candidateCount,
            name: _name,
            description: _description,
            voteCount: 0
        });

        emit CandidateAdded(_electionId, election.candidateCount, _name);
    }

    function vote(uint256 _electionId, uint256 _candidateId) external electionExists(_electionId) {
        Election storage election = elections[_electionId];
        require(block.timestamp >= election.startTime, "Election has not started yet");
        require(block.timestamp <= election.endTime, "Election has ended");
        require(!hasVoted[_electionId][msg.sender], "Already voted in this election");
        require(_candidateId > 0 && _candidateId <= election.candidateCount, "Invalid candidate");

        hasVoted[_electionId][msg.sender] = true;
        voterChoice[_electionId][msg.sender] = _candidateId;
        candidates[_electionId][_candidateId].voteCount++;

        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    function getCandidates(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (Candidate[] memory)
    {
        uint256 count = elections[_electionId].candidateCount;
        Candidate[] memory result = new Candidate[](count);

        for (uint256 i = 1; i <= count; i++) {
            result[i - 1] = candidates[_electionId][i];
        }

        return result;
    }

    function getElection(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (Election memory)
    {
        return elections[_electionId];
    }

    function getResults(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (Candidate[] memory)
    {
        require(block.timestamp > elections[_electionId].endTime, "Election is still active");

        uint256 count = elections[_electionId].candidateCount;
        Candidate[] memory result = new Candidate[](count);

        for (uint256 i = 1; i <= count; i++) {
            result[i - 1] = candidates[_electionId][i];
        }

        return result;
    }

    function hasVotedInElection(uint256 _electionId, address _voter)
        external
        view
        returns (bool)
    {
        return hasVoted[_electionId][_voter];
    }
}
