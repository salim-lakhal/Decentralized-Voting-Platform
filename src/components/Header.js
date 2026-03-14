import { Link, NavLink } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

function truncateAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Header() {
  const { account, isConnecting, connectWallet, disconnectWallet } = useWeb3();

  return (
    <div className="navbar bg-base-200 shadow-md px-4 sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <NavLink to="/">Home</NavLink>
            </li>
            <li>
              <NavLink to="/elections">Elections</NavLink>
            </li>
            <li>
              <NavLink to="/admin">Admin</NavLink>
            </li>
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold tracking-tight">
          <span className="text-2xl">🗳</span>
          <span className="ml-1 text-primary">VoteChain</span>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "active font-semibold" : ""
              }
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/elections"
              className={({ isActive }) =>
                isActive ? "active font-semibold" : ""
              }
            >
              Elections
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "active font-semibold" : ""
              }
            >
              Admin
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {account ? (
          <div className="flex items-center gap-2">
            <div className="badge badge-success gap-1 py-3 px-3 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-success-content inline-block"></span>
              {truncateAddress(account)}
            </div>
            <button
              className="btn btn-sm btn-outline btn-error"
              onClick={disconnectWallet}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={connectWallet}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : null}
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </div>
  );
}
