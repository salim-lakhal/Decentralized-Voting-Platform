const hre = require("hardhat");

async function main() {
  const VotingPlatform = await hre.ethers.getContractFactory("VotingPlatform");
  const voting = await VotingPlatform.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("VotingPlatform deployed to:", address);

  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 60;
  const endTime = now + 86460; // ~24h from now

  const tx = await voting.createElection(
    "Community Board Election 2024",
    "Annual community board election to select new leadership.",
    startTime,
    endTime
  );
  await tx.wait();
  console.log("Election created: Community Board Election 2024");
  console.log(`  Start: ${new Date(startTime * 1000).toISOString()}`);
  console.log(`  End:   ${new Date(endTime * 1000).toISOString()}`);

  const tx1 = await voting.addCandidate(
    1,
    "Alex Morgan",
    "Software engineer with 10 years of experience in building scalable systems and open-source contributions."
  );
  await tx1.wait();
  console.log("Candidate added: Alex Morgan");

  const tx2 = await voting.addCandidate(
    1,
    "Sam Rivera",
    "Community organizer with a track record of grassroots initiatives and neighborhood development programs."
  );
  await tx2.wait();
  console.log("Candidate added: Sam Rivera");

  console.log("\nDeployment complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
