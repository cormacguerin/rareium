require("dotenv").config();
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('hardhat-contract-sizer');

const {config} =  require("dotenv");
const {resolve} =  require("path");
config({path: resolve(__dirname, "./.env")});

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
});

//console.log("process.env.PRIVATE_KEY")
//console.log(process.env.PRIVATE_KEY)
// Test hardhat config for invoke.

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
console.log("process.env.BACKEND_MATIC_PROVIDER")
console.log(process.env.BACKEND_MATIC_PROVIDER)
console.log(process.env)
module.exports = {
  solidity: "0.8.19",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    polygon: {
      // url: "https://polygon-rpc.com",
      url: process.env.BACKEND_MATIC_PROVIDER,
      chainId: 137,
      gasPrice: 200000000000,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ethereum: {
      url: process.env.BACKEND_ETH_PROVIDER,
      chainId: 1,
      gasPrice: 200000000000,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mumbai: {
      url: process.env.BACKEND_MATIC_PROVIDER,
      chainId: 80001,
      gasPrice: 200000000000,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia: {
      url: process.env.BACKEND_ETH_PROVIDER,
      chainId: 11155111,
      gasPrice: 200000000000,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    //apiKey: {
    //  polygonMumbai: 'process.env.ETHERSCAN_APY_KEY'
    //}
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ['equityDAOMarketplace','equityDAOPlatform','equityDAOMultiNFT','equityDAONFT'],
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
  }

};

