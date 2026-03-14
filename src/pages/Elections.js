import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { useVotingContract } from "../hooks/useVotingContract";

function getElectionStatus(election) {
  const now = Math.floor(Date.now() / 1000);
  if (now < election.startTime) return "upcoming";
  if (now >= election.startTime && now <= election.endTime) return "active";
  return "ended";
}

function formatTimeRemaining(seconds) {
  if (seconds <= 0) return null;
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

function formatTimeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  if (d > 0) return `Ended ${d}d ago`;
  if (h > 0) return `Ended ${h}h ago`;
  return "Ended recently";
}

function StatusBadge({ status }) {
  const styles = {
    active: "badge badge-success",
    upcoming: "badge badge-warning",
    ended: "badge badge-ghost",
  };
  const labels = { active: "Active", upcoming: "Upcoming", ended: "Ended" };
  return <span className={styles[status]}>{labels[status]}</span>;
}

function ElectionCard({ election }) {
  const status = getElectionStatus(election);
  const now = Math.floor(Date.now() / 1000);

  let timeLabel = null;
  if (status === "active") {
    timeLabel = formatTimeRemaining(election.endTime - now);
  } else if (status === "upcoming") {
    timeLabel = `Starts in ${formatTimeRemaining(election.startTime - now) || "soon"}`;
  } else {
    timeLabel = formatTimeAgo(election.endTime);
  }

  return (
    <Link to={`/elections/${election.id}`} className="block group">
      <div className="card bg-base-200 shadow hover:shadow-lg transition-shadow duration-200 h-full">
        <div className="card-body">
          <div className="flex items-start justify-between gap-2">
            <h2 className="card-title text-lg group-hover:text-primary transition-colors">
              {election.title}
            </h2>
            <StatusBadge status={status} />
          </div>
          <p className="text-base-content/60 text-sm line-clamp-2">
            {election.description}
          </p>
          <div className="card-actions justify-between items-center mt-2">
            <span className="text-xs text-base-content/50">{timeLabel}</span>
            <span className="text-xs text-base-content/50">
              {election.candidateCount} candidate
              {election.candidateCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="card bg-base-200 shadow">
      <div className="card-body gap-3">
        <div className="skeleton h-5 w-3/4 rounded"></div>
        <div className="skeleton h-4 w-full rounded"></div>
        <div className="skeleton h-4 w-2/3 rounded"></div>
        <div className="flex justify-between mt-2">
          <div className="skeleton h-3 w-24 rounded"></div>
          <div className="skeleton h-3 w-16 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function Elections() {
  const { account } = useWeb3();
  const { getElections, loading, error } = useVotingContract();
  const [elections, setElections] = useState([]);

  useEffect(() => {
    getElections()
      .then(setElections)
      .catch(() => {});
  }, [getElections]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Elections</h1>
          <p className="text-base-content/60 mt-1">
            All on-chain elections, powered by Ethereum.
          </p>
        </div>
        <Link to="/admin" className="btn btn-primary btn-sm">
          + Create
        </Link>
      </div>

      {!account && (
        <div className="alert alert-info mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Connect your wallet to participate in elections.</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : elections.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">No elections yet</h3>
          <p className="text-base-content/60 mb-6">
            Be the first to create an election on VoteChain.
          </p>
          <Link to="/admin" className="btn btn-primary">
            Create an Election
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {elections.map((election) => (
            <ElectionCard key={election.id} election={election} />
          ))}
        </div>
      )}
    </div>
  );
}
