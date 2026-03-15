const hre = require('hardhat');

async function main() {
  const SecureCommunication = await hre.ethers.getContractFactory('SecureCommunication');
  const contract = await SecureCommunication.deploy();
  await contract.waitForDeployment();

  console.log('SecureCommunication deployed to:', await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
