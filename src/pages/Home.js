import { Link } from "react-router-dom";

const features = [
  {
    icon: "🔍",
    title: "Transparent",
    description:
      "Every vote is recorded on the Ethereum blockchain. Anyone can audit the results at any time, with full traceability.",
  },
  {
    icon: "🔒",
    title: "Secure",
    description:
      "Each wallet address can cast only one vote per election. Smart contract logic enforces this rule without exception.",
  },
  {
    icon: "⚡",
    title: "Trustless",
    description:
      "No central authority controls the outcome. The contract runs autonomously — the code is the law.",
  },
];

export default function Home() {
  return (
    <div>
      <div className="hero min-h-[70vh] bg-base-200">
        <div className="hero-content text-center flex-col max-w-3xl">
          <div className="text-6xl mb-4">🗳</div>
          <h1 className="text-5xl font-bold leading-tight">
            Decentralized Voting Platform
          </h1>
          <p className="py-6 text-lg text-base-content/70 max-w-xl">
            Run transparent, tamper-proof elections on the Ethereum blockchain.
            No trusted third party required — just deploy, vote, and verify.
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/elections" className="btn btn-primary btn-lg">
              View Elections
            </Link>
            <Link to="/admin" className="btn btn-outline btn-lg">
              Create Election
            </Link>
          </div>
        </div>
      </div>

      <div className="py-20 px-4 bg-base-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why VoteChain?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-2">{feature.icon}</div>
                  <h3 className="card-title text-xl">{feature.title}</h3>
                  <p className="text-base-content/70 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-primary text-primary-content text-center px-4">
        <h2 className="text-3xl font-bold mb-4">Ready to vote?</h2>
        <p className="mb-8 text-primary-content/80 max-w-md mx-auto">
          Connect your MetaMask wallet and participate in on-chain elections
          today.
        </p>
        <Link to="/elections" className="btn btn-lg bg-white text-primary hover:bg-white/90 border-none">
          Browse Elections
        </Link>
      </div>
    </div>
  );
}
