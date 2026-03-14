export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer footer-center p-6 bg-base-200 text-base-content border-t border-base-300 mt-auto">
      <div className="flex flex-col sm:flex-row items-center gap-3 text-sm">
        <span>Built with Ethereum &amp; React</span>
        <span className="hidden sm:inline text-base-300">|</span>
        <a
          href="https://github.com/salim-lakhal/Decentralized-Voting-Platform"
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover link-primary"
        >
          GitHub
        </a>
        <span className="hidden sm:inline text-base-300">|</span>
        <span>&copy; {year} VoteChain</span>
      </div>
    </footer>
  );
}
