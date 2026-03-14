import { useState, useCallback } from "react";
import { Contract } from "ethers";
import { useWeb3 } from "../context/Web3Context";

const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function electionCount() view returns (uint256)",
  "function createElection(string calldata, string calldata, uint256, uint256) returns (uint256)",
  "function addCandidate(uint256, string calldata, string calldata)",
  "function vote(uint256, uint256)",
  "function getCandidates(uint256) view returns (tuple(uint256 id, string name, string description, uint256 voteCount)[])",
  "function getElection(uint256) view returns (tuple(uint256 id, string title, string description, uint256 startTime, uint256 endTime, uint256 candidateCount, bool exists))",
  "function getResults(uint256) view returns (tuple(uint256 id, string name, string description, uint256 voteCount)[])",
  "function hasVotedInElection(uint256, address) view returns (bool)",
  "event ElectionCreated(uint256 indexed electionId, string title, uint256 startTime, uint256 endTime)",
  "event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter)",
];

const CONTRACT_ADDRESS =
  process.env.REACT_APP_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export function useVotingContract() {
  const { provider, signer, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getReadContract = useCallback(() => {
    if (!provider) throw new Error("Provider not available. Connect your wallet.");
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, [provider]);

  const getWriteContract = useCallback(() => {
    if (!signer) throw new Error("Signer not available. Connect your wallet.");
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, [signer]);

  const withLoading = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const message = err.reason || err.message || "An unknown error occurred.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getElections = useCallback(async () => {
    return withLoading(async () => {
      const contract = getReadContract();
      const count = await contract.electionCount();
      const elections = [];
      for (let i = 1; i <= Number(count); i++) {
        const election = await contract.getElection(i);
        elections.push({
          id: Number(election.id),
          title: election.title,
          description: election.description,
          startTime: Number(election.startTime),
          endTime: Number(election.endTime),
          candidateCount: Number(election.candidateCount),
          exists: election.exists,
        });
      }
      return elections;
    });
  }, [getReadContract, withLoading]);

  const getElection = useCallback(
    async (id) => {
      return withLoading(async () => {
        const contract = getReadContract();
        const election = await contract.getElection(id);
        return {
          id: Number(election.id),
          title: election.title,
          description: election.description,
          startTime: Number(election.startTime),
          endTime: Number(election.endTime),
          candidateCount: Number(election.candidateCount),
          exists: election.exists,
        };
      });
    },
    [getReadContract, withLoading]
  );

  const getCandidates = useCallback(
    async (id) => {
      return withLoading(async () => {
        const contract = getReadContract();
        const candidates = await contract.getCandidates(id);
        return candidates.map((c) => ({
          id: Number(c.id),
          name: c.name,
          description: c.description,
          voteCount: Number(c.voteCount),
        }));
      });
    },
    [getReadContract, withLoading]
  );

  const getResults = useCallback(
    async (id) => {
      return withLoading(async () => {
        const contract = getReadContract();
        const results = await contract.getResults(id);
        return results.map((c) => ({
          id: Number(c.id),
          name: c.name,
          description: c.description,
          voteCount: Number(c.voteCount),
        }));
      });
    },
    [getReadContract, withLoading]
  );

  const checkHasVoted = useCallback(
    async (electionId) => {
      if (!account) return false;
      return withLoading(async () => {
        const contract = getReadContract();
        return await contract.hasVotedInElection(electionId, account);
      });
    },
    [account, getReadContract, withLoading]
  );

  const vote = useCallback(
    async (electionId, candidateId) => {
      return withLoading(async () => {
        const contract = getWriteContract();
        const tx = await contract.vote(electionId, candidateId);
        await tx.wait();
        return tx;
      });
    },
    [getWriteContract, withLoading]
  );

  const createElection = useCallback(
    async (title, description, startTime, endTime) => {
      return withLoading(async () => {
        const contract = getWriteContract();
        const tx = await contract.createElection(title, description, startTime, endTime);
        const receipt = await tx.wait();
        return receipt;
      });
    },
    [getWriteContract, withLoading]
  );

  const addCandidate = useCallback(
    async (electionId, name, description) => {
      return withLoading(async () => {
        const contract = getWriteContract();
        const tx = await contract.addCandidate(electionId, name, description);
        await tx.wait();
        return tx;
      });
    },
    [getWriteContract, withLoading]
  );

  const getAdmin = useCallback(async () => {
    return withLoading(async () => {
      const contract = getReadContract();
      return await contract.admin();
    });
  }, [getReadContract, withLoading]);

  return {
    loading,
    error,
    getElections,
    getElection,
    getCandidates,
    getResults,
    checkHasVoted,
    vote,
    createElection,
    addCandidate,
    getAdmin,
  };
}
