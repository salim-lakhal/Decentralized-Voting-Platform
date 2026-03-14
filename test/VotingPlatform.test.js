const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("VotingPlatform", function () {
  let voting, admin, voter1, voter2, nonAdmin;
  let startTime, endTime;

  beforeEach(async function () {
    [admin, voter1, voter2, nonAdmin] = await ethers.getSigners();

    const VotingPlatform = await ethers.getContractFactory("VotingPlatform");
    voting = await VotingPlatform.deploy();

    const latest = await time.latest();
    startTime = latest + 3600;
    endTime = latest + 86400;
  });

  describe("Deployment", function () {
    it("sets the deployer as admin", async function () {
      expect(await voting.admin()).to.equal(admin.address);
    });
  });

  describe("Election Creation", function () {
    it("allows admin to create an election", async function () {
      await voting.createElection("Test Election", "A test.", startTime, endTime);
      const election = await voting.getElection(1);

      expect(election.title).to.equal("Test Election");
      expect(election.description).to.equal("A test.");
      expect(election.startTime).to.equal(startTime);
      expect(election.endTime).to.equal(endTime);
      expect(election.exists).to.be.true;
    });

    it("returns the correct election id", async function () {
      await voting.createElection("First", "Desc", startTime, endTime);
      await voting.createElection("Second", "Desc", startTime, endTime);
      expect(await voting.electionCount()).to.equal(2);
    });

    it("reverts when non-admin tries to create", async function () {
      await expect(
        voting.connect(nonAdmin).createElection("Nope", "Desc", startTime, endTime)
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("reverts when start time is after end time", async function () {
      await expect(
        voting.createElection("Bad", "Desc", endTime, startTime)
      ).to.be.revertedWith("Start time must be before end time");
    });

    it("emits ElectionCreated event", async function () {
      await expect(voting.createElection("Event Test", "Desc", startTime, endTime))
        .to.emit(voting, "ElectionCreated")
        .withArgs(1, "Event Test", startTime, endTime);
    });
  });

  describe("Candidate Management", function () {
    beforeEach(async function () {
      await voting.createElection("Test Election", "Desc", startTime, endTime);
    });

    it("allows admin to add candidates before election starts", async function () {
      await voting.addCandidate(1, "Alice", "Engineer");
      await voting.addCandidate(1, "Bob", "Designer");

      const candidates = await voting.getCandidates(1);
      expect(candidates.length).to.equal(2);
      expect(candidates[0].name).to.equal("Alice");
      expect(candidates[1].name).to.equal("Bob");
    });

    it("reverts when non-admin adds a candidate", async function () {
      await expect(
        voting.connect(nonAdmin).addCandidate(1, "Alice", "Desc")
      ).to.be.revertedWith("Only admin can perform this action");
    });

    it("reverts when adding candidate after election starts", async function () {
      await time.increaseTo(startTime);

      await expect(
        voting.addCandidate(1, "Late", "Too late")
      ).to.be.revertedWith("Cannot add candidates after election starts");
    });

    it("emits CandidateAdded event", async function () {
      await expect(voting.addCandidate(1, "Alice", "Engineer"))
        .to.emit(voting, "CandidateAdded")
        .withArgs(1, 1, "Alice");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await voting.createElection("Test Election", "Desc", startTime, endTime);
      await voting.addCandidate(1, "Alice", "Engineer");
      await voting.addCandidate(1, "Bob", "Designer");
    });

    it("allows a voter to cast a vote during the election", async function () {
      await time.increaseTo(startTime);
      await voting.connect(voter1).vote(1, 1);

      expect(await voting.hasVotedInElection(1, voter1.address)).to.be.true;
      expect(await voting.voterChoice(1, voter1.address)).to.equal(1);
    });

    it("prevents double voting", async function () {
      await time.increaseTo(startTime);
      await voting.connect(voter1).vote(1, 1);

      await expect(
        voting.connect(voter1).vote(1, 2)
      ).to.be.revertedWith("Already voted in this election");
    });

    it("rejects vote before election starts", async function () {
      await expect(
        voting.connect(voter1).vote(1, 1)
      ).to.be.revertedWith("Election has not started yet");
    });

    it("rejects vote after election ends", async function () {
      await time.increaseTo(endTime + 1);

      await expect(
        voting.connect(voter1).vote(1, 1)
      ).to.be.revertedWith("Election has ended");
    });

    it("rejects vote for invalid candidate", async function () {
      await time.increaseTo(startTime);

      await expect(
        voting.connect(voter1).vote(1, 0)
      ).to.be.revertedWith("Invalid candidate");

      await expect(
        voting.connect(voter1).vote(1, 99)
      ).to.be.revertedWith("Invalid candidate");
    });

    it("emits VoteCast event", async function () {
      await time.increaseTo(startTime);

      await expect(voting.connect(voter1).vote(1, 1))
        .to.emit(voting, "VoteCast")
        .withArgs(1, 1, voter1.address);
    });

    it("correctly increments vote count", async function () {
      await time.increaseTo(startTime);
      await voting.connect(voter1).vote(1, 1);
      await voting.connect(voter2).vote(1, 1);

      const candidates = await voting.getCandidates(1);
      expect(candidates[0].voteCount).to.equal(2);
      expect(candidates[1].voteCount).to.equal(0);
    });
  });

  describe("Results", function () {
    beforeEach(async function () {
      await voting.createElection("Test Election", "Desc", startTime, endTime);
      await voting.addCandidate(1, "Alice", "Engineer");
      await voting.addCandidate(1, "Bob", "Designer");

      await time.increaseTo(startTime);
      await voting.connect(voter1).vote(1, 1);
      await voting.connect(voter2).vote(1, 2);
    });

    it("returns results after election ends", async function () {
      await time.increaseTo(endTime + 1);

      const results = await voting.getResults(1);
      expect(results.length).to.equal(2);
      expect(results[0].voteCount).to.equal(1);
      expect(results[1].voteCount).to.equal(1);
    });

    it("reverts when election is still active", async function () {
      await expect(
        voting.getResults(1)
      ).to.be.revertedWith("Election is still active");
    });
  });

  describe("getCandidates", function () {
    it("returns all candidates with correct data", async function () {
      await voting.createElection("Test", "Desc", startTime, endTime);
      await voting.addCandidate(1, "Alice", "Engineer");
      await voting.addCandidate(1, "Bob", "Designer");

      const candidates = await voting.getCandidates(1);

      expect(candidates[0].id).to.equal(1);
      expect(candidates[0].name).to.equal("Alice");
      expect(candidates[0].description).to.equal("Engineer");
      expect(candidates[0].voteCount).to.equal(0);

      expect(candidates[1].id).to.equal(2);
      expect(candidates[1].name).to.equal("Bob");
      expect(candidates[1].description).to.equal("Designer");
    });

    it("reverts for non-existent election", async function () {
      await expect(voting.getCandidates(999)).to.be.revertedWith("Election does not exist");
    });
  });
});
