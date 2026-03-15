const hre = require('hardhat');

async function main() {
  const Factory = await hre.ethers.getContractFactory('SecureMessageLedger');
  const contract = await Factory.deploy();
  await contract.waitForDeployment();
  console.log('SecureMessageLedger:', await contract.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
