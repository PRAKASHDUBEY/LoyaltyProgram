const hre = require("hardhat");

async function main() {

  const Token = await hre.ethers.getContractFactory("LoyaltyProgram");
  const token = await Token.deploy()

  console.log("CONTRACT_ADDRESS: ", token.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// npx hardhat compile 
// npx hardhat run scripts/deploy.js --network mumbai