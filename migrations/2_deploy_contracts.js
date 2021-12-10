//here we deployed our smart contract on blockchain
const SocialNetwork = artifacts.require("SocialNetwork");
//At the beginning of the migration, we tell Truffle which contracts we'd
// like to interact with via the artifacts.require() method.
// This method is similar to Node's require,

module.exports = function(deployer) {
  deployer.deploy(SocialNetwork);
};
