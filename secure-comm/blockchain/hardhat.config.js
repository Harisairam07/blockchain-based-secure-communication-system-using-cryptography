require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: '0.8.24',
  networks: {
    localhost: {
      url: 'http://ganache:7545'
    }
  }
};
