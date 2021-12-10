//allow us to put new smart contracts on the blockchain.
const Migrations = artifacts.require("Migrations");
//At the beginning of the migration, we tell Truffle which contracts we'd
// like to interact with via the artifacts.require() method.
// This method is similar to Node's require,

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
