module.exports = {

  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
  },
  // Set default mocha options here, use special reporters etc.
  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      noColors: true,
      outputFile: "./gas-report",
    },
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.6.0",
      docker: false,
      settings: {
        optimizer: {
          enabled: false,
          runs: 200,
        },
      },
    },
  }
};
