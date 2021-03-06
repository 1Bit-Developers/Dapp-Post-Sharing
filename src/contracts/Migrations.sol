/*Truffle requires you to have a Migrations contract in
order to use the Migrations feature. This contract must
contain a specific interface, but you're free to edit this contract at will.
For most projects, this contract will be deployed
initially as the first migration and won't be updated again.
You will also receive this
contract by default when creating a new project with truffle init.
*/
pragma solidity >=0.4.21 <0.6.0;

contract Migrations {
  address public owner;
  uint public last_completed_migration;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    if (msg.sender == owner) _;
  }

  function setCompleted(uint completed) public restricted {
    last_completed_migration = completed;
  }

  function upgrade(address new_address) public restricted {
    Migrations upgraded = Migrations(new_address);
    upgraded.setCompleted(last_completed_migration);
  }
}
