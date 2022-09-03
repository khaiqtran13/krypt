// https://eth-goerli.g.alchemy.com/v2/5j1bSWKl2YSb4luC8tkb4PURhhd2YlCg

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    georli: {
      url: "https://eth-goerli.g.alchemy.com/v2/5j1bSWKl2YSb4luC8tkb4PURhhd2YlCg",
      accounts: [
        // TODO: DELETE THIS? its from alchemy
        "751767831dd795ceed38112eba359a5c21b2fd5ee24c5d38fc9a1a934a865ac1",
      ],
    },
  },
};
