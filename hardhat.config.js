require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

// Config from environment
const mnemonicPhrase = process.env.MNEMONIC || 'test test test test test test test test test test test junk';
const mnemonicPassword = process.env.MNEMONIC_PASSWORD;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.5.16',
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 999999,
          },
        },
      },
      {
        version: '0.8.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.8.17',
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000000 ,
            details: {
              yulDetails: {
                optimizerSteps: "u",
              },
            },
          },
        },
      },
      {
        version: '0.8.20',
      },
    ]
  },
  defaultNetwork: "goerli",
  networks: {
    goerli: {
      url: 'https://eth-goerli.public.blastapi.io',
      accounts: {
        mnemonic: mnemonicPhrase,
        path: 'm/44\'/60\'/0\'/0',
        initialIndex: 0,
        count: 1,
        passphrase: mnemonicPassword,
      },
      gasPrice: 100000000,
    },
    evt: {
      url: 'http://158.69.35.30:8545',
      accounts: {
        mnemonic: mnemonicPhrase,
        path: 'm/44\'/60\'/0\'/0',
        initialIndex: 0,
        count: 1,
        passphrase: mnemonicPassword,
      },
      gasPrice: 1500000000,
    },
    seitestnet: {
      url: 'https://evm-rpc.arctic-1.seinetwork.io',
      accounts: {
        mnemonic: mnemonicPhrase,
        path: 'm/44\'/60\'/0\'/0',
        initialIndex: 0,
        count: 1,
        passphrase: mnemonicPassword,
      },
      gasPrice: 1200000000,
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  mocha: {
    timeout: 0,
  },
  etherscan: {
    apiKey: {
      goerli: "3TEWVV2EK19S1Y6SV8EECZAGQ7W3362RCN",
      evt: "0000000000000000000000000000000000",
      seitestnet: "0000000000000000000000000000000000",
    },
    customChains: [
      {
        network: "goerli",
        chainId: 5,
        urls: {
          apiURL: "https://api-goerli.etherscan.io/api",
          browserURL: "https://goerli.etherscan.io/"
        }
      },
      {
        network: "evt",
        chainId: 8848,
        urls: {
          apiURL: "https://evtscan.com/api/",
          browserURL: "https://evtscan.com/"
        }
      },
      {
        network: "seitestnet",
        chainId: 713715,
        urls: {
          apiURL: "https://seitrace.com/api/",
          browserURL: "https://seitrace.com/"
        }
      },
    ]
  },
};
