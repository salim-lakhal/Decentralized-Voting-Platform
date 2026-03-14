import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useVotingContract } from "../hooks/useVotingContract";

function getStatus(election) {
  const now = Math.floor(Date.now() / 1000);
  if (now < election.startTime) return "upcoming";
  if (now <= election.endTime) return "active";
  return "ended";
}

function formatDate(ts) {
  return new Date(ts * 1000).toLocaleString();
}

function formatCountdown(seconds) {
  if (seconds <= 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function StatusBadge({ status }) {
  const map = {
    active: { cls: "badge badge-success badge-lg", label: "Active" },
    upcoming: { cls: "badge badge-warning badge-lg", label: "Upcoming" },
    ended: { cls: "badge badge-ghost badge-lg", label: "Ended" },
  };
  const { cls, label } = map[status];
  return <span className={cls}>{label}</span>;
}

function TimeProgress({ election }) {
  const now = Math.floor(Date.now() / 1000);
  const total = election.endTime - election.startTime;
  const elapsed = now - election.startTime;
  const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));

  return (
    <div className="w-full">
      <progress className="progress progress-primary w-full" value={pct} max="100"></progress>
      <div className="flex justify-between text-xs text-base-content/50 mt-1">
        <span>{formatDate(election.startTime)}</span>
        <span>{formatDate(election.endTime)}</span>
      </div>
    </div>
  );
}

function ResultsChart({ candidates }) {
  const total = candidates.reduce((sum, c) => sum + c.voteCount, 0);
  const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="space-y-3 mt-4">
      {sorted.map((candidate, i) => {
        const pct = total === 0 ? 0 : Math.round((candidate.voteCount / total) * 100);
        const isWinner = i === 0 && candidate.voteCount > 0;
        return (
          <div key={candidate.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-sm flex items-center gap-1">
                {isWinner && <span title="Leading">🏆</span>}
                {candidate.name}
              </span>
              <span className="text-sm text-base-content/60">
                {candidate.voteCount} vote{candidate.voteCount !== 1 ? "s" : ""} ({pct}%)
              </span>
            </div>
            <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  isWinner ? "bg-primary" : "bg-base-content/30"
                }`}
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </div>
        );
      })}
      <p className="text-xs text-base-content/50 text-right mt-1">
        Total: {total} vote{total !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default function ElectionDetail() {
  const { id } = useParams();
  const { account } = useWeb3();
  const { getElection, getCandidates, getResults, checkHasVoted, vote, loading, error } =
    useVotingContract();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null);
  const [results, setResults] = useState([]);
  const [votingFor, setVotingFor] = useState(null);
  const [notification, setNotification] = useState(null);
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const el = await getElection(id);
      setElection(el);
      const status = getStatus(el);

      if (status === "ended") {
        const r = await getResults(id);
        setResults(r);
      } else {
        const c = await getCandidates(id);
        setCandidates(c);
      }

      if (account) {
        const voted = await checkHasVoted(id);
        setHasVoted(voted);
      }
    } catch (_) {}
  }, [id, account, getElection, getCandidates, getResults, checkHasVoted]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVote = async (candidateId) => {
    setVotingFor(candidateId);
    try {
      await vote(id, candidateId);
      setHasVoted(true);
      setVotedCandidateId(candidateId);
      setNotification({ type: "success", message: "Your vote has been recorded on-chain!" });
    } catch (err) {
      const msg = err.reason || err.message || "Failed to cast vote.";
      setNotification({ type: "error", message: msg });
    } finally {
      setVotingFor(null);
    }
  };

  if (!election && loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="skeleton h-8 w-1/2 rounded"></div>
        <div className="skeleton h-4 w-full rounded"></div>
        <div className="skeleton h-4 w-3/4 rounded"></div>
        <div className="skeleton h-40 w-full rounded mt-6"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        {error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : (
          <p>Election not found.</p>
        )}
        <Link to="/elections" className="btn btn-primary mt-4">
          Back to Elections
        </Link>
      </div>
    );
  }

  const status = getStatus(election);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-2">
        <Link to="/elections" className="text-sm text-base-content/50 hover:text-primary">
          ← Back to Elections
        </Link>
      </div>

      <div className="card bg-base-200 shadow-lg mb-6">
        <div className="card-body">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h1 className="text-3xl font-bold">{election.title}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-base-content/70 mt-1">{election.description}</p>
          <div className="mt-4">
            <TimeProgress election={election} />
          </div>

          {status === "upcoming" && (
            <div className="alert alert-warning mt-4">
              <span>
                This election starts in{" "}
                <strong>{formatCountdown(election.startTime - now)}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {notification && (
        <div
          className={`alert ${
            notification.type === "success" ? "alert-success" : "alert-error"
          } mb-6`}
        >
          <span>{notification.message}</span>
          <button
            className="btn btn-xs btn-ghost ml-auto"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {status === "ended" ? (
        <div>
          <h2 className="text-xl font-bold mb-4">Final Results</h2>
          {results.length === 0 ? (
            <p className="text-base-content/60">No votes were cast in this election.</p>
          ) : (
            <div className="card bg-base-200 shadow p-6">
              <ResultsChart candidates={results} />
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">
            {status === "active" ? "Cast Your Vote" : "Candidates"}
          </h2>

          {!account && (
            <div className="alert alert-info mb-4">
              <span>Connect your wallet to vote.</span>
            </div>
          )}

          {hasVoted && (
            <div className="alert alert-success mb-4">
              <span>
                You have already voted
                {votedCandidateId
                  ? ` for "${
                      candidates.find((c) => c.id === votedCandidateId)?.name || "your candidate"
                    }"`
                  : ""}
                . Results will be available when the election ends.
              </span>
            </div>
          )}

          {candidates.length === 0 && !loading ? (
            <p className="text-base-content/60">No candidates have been added yet.</p>
          ) : (
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="card bg-base-200 shadow hover:shadow-md transition-shadow"
                >
                  <div className="card-body flex-row items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{candidate.name}</h3>
                      {candidate.description && (
                        <p className="text-sm text-base-content/60">{candidate.description}</p>
                      )}
                    </div>
                    {status === "active" && account && !hasVoted && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleVote(candidate.id)}
                        disabled={votingFor !== null || loading}
                      >
                        {votingFor === candidate.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : null}
                        Vote
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
