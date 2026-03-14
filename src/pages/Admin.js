import { useEffect, useState, useCallback } from "react";
import { useWeb3 } from "../context/Web3Context";
import { useVotingContract } from "../hooks/useVotingContract";

const DEFAULT_ELECTION_FORM = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
};

const DEFAULT_CANDIDATE_FORM = {
  name: "",
  description: "",
};

function toUnixTimestamp(datetimeLocal) {
  return Math.floor(new Date(datetimeLocal).getTime() / 1000);
}

function toDatetimeLocalMin() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function Admin() {
  const { account, connectWallet } = useWeb3();
  const {
    getAdmin,
    getElections,
    createElection,
    addCandidate,
    loading,
    error,
  } = useVotingContract();

  const [adminAddress, setAdminAddress] = useState(null);
  const [elections, setElections] = useState([]);
  const [electionForm, setElectionForm] = useState(DEFAULT_ELECTION_FORM);
  const [candidateForm, setCandidateForm] = useState(DEFAULT_CANDIDATE_FORM);
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin =
    adminAddress && account && adminAddress.toLowerCase() === account.toLowerCase();

  const notify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadAdminAndElections = useCallback(async () => {
    try {
      const addr = await getAdmin();
      setAdminAddress(addr);
      const list = await getElections();
      setElections(list);
    } catch (_) {}
  }, [getAdmin, getElections]);

  useEffect(() => {
    if (account) {
      loadAdminAndElections();
    }
  }, [account, loadAdminAndElections]);

  const handleCreateElection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const start = toUnixTimestamp(electionForm.startTime);
      const end = toUnixTimestamp(electionForm.endTime);
      if (end <= start) {
        notify("error", "End time must be after start time.");
        return;
      }
      await createElection(electionForm.title, electionForm.description, start, end);
      notify("success", "Election created successfully!");
      setElectionForm(DEFAULT_ELECTION_FORM);
      await loadAdminAndElections();
    } catch (err) {
      notify("error", err.reason || err.message || "Failed to create election.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!selectedElectionId) {
      notify("error", "Please select an election.");
      return;
    }
    setSubmitting(true);
    try {
      await addCandidate(selectedElectionId, candidateForm.name, candidateForm.description);
      notify("success", `Candidate "${candidateForm.name}" added!`);
      setCandidateForm(DEFAULT_CANDIDATE_FORM);
      await loadAdminAndElections();
    } catch (err) {
      notify("error", err.reason || err.message || "Failed to add candidate.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!account) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
        <p className="text-base-content/60 mb-6">
          Connect your wallet to access the admin panel.
        </p>
        <button className="btn btn-primary" onClick={connectWallet}>
          Connect Wallet
        </button>
      </div>
    );
  }

  if (adminAddress && !isAdmin) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-base-content/60">
          Your wallet is not the contract admin. This panel is restricted to the
          deployer address.
        </p>
        <p className="text-xs font-mono mt-4 text-base-content/40 break-all">
          Admin: {adminAddress}
        </p>
      </div>
    );
  }

  if (!adminAddress && loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <div className="skeleton h-8 w-1/3 rounded"></div>
        <div className="skeleton h-64 w-full rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
      <p className="text-base-content/60 mb-8">
        Manage elections and candidates on-chain.
      </p>

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

      <div className="card bg-base-200 shadow mb-8">
        <div className="card-body">
          <h2 className="card-title text-xl">Create Election</h2>
          <form onSubmit={handleCreateElection} className="space-y-4 mt-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Board Member Election 2025"
                value={electionForm.title}
                onChange={(e) =>
                  setElectionForm({ ...electionForm, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={3}
                placeholder="Describe the purpose of this election..."
                value={electionForm.description}
                onChange={(e) =>
                  setElectionForm({ ...electionForm, description: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Start Time</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  min={toDatetimeLocalMin()}
                  value={electionForm.startTime}
                  onChange={(e) =>
                    setElectionForm({ ...electionForm, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">End Time</span>
                </label>
                <input
                  type="datetime-local"
                  className="input input-bordered w-full"
                  min={toDatetimeLocalMin()}
                  value={electionForm.endTime}
                  onChange={(e) =>
                    setElectionForm({ ...electionForm, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting || loading}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : null}
              Create Election
            </button>
          </form>
        </div>
      </div>

      <div className="card bg-base-200 shadow mb-8">
        <div className="card-body">
          <h2 className="card-title text-xl">Add Candidate</h2>
          <form onSubmit={handleAddCandidate} className="space-y-4 mt-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Election</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                required
              >
                <option value="">Select an election...</option>
                {elections.map((el) => (
                  <option key={el.id} value={el.id}>
                    #{el.id} — {el.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Candidate Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Alice Johnson"
                value={candidateForm.name}
                onChange={(e) =>
                  setCandidateForm({ ...candidateForm, name: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Candidate Description
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={2}
                placeholder="Brief bio or platform statement..."
                value={candidateForm.description}
                onChange={(e) =>
                  setCandidateForm({ ...candidateForm, description: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary w-full"
              disabled={submitting || loading}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : null}
              Add Candidate
            </button>
          </form>
        </div>
      </div>

      {elections.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Existing Elections</h2>
          <div className="space-y-2">
            {elections.map((el) => (
              <div
                key={el.id}
                className="flex items-center justify-between bg-base-200 rounded-box px-4 py-3 shadow"
              >
                <div>
                  <span className="font-medium">#{el.id} — {el.title}</span>
                  <span className="text-xs text-base-content/50 ml-2">
                    {el.candidateCount} candidate{el.candidateCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  className="btn btn-xs btn-outline"
                  onClick={() => setSelectedElectionId(String(el.id))}
                >
                  Add Candidate
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
