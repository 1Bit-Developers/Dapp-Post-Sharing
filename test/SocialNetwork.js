/*PUPOSE OF THIS FILE
->It will save us time. Any time we make changes to the smart contract, we can ensure that all
of the code we wrote before still works. Imagine having to hand-check this in the console every time!

->It is vital to ensure that our smart contracts work properly before putting them on the blockchain.
Remember, all the smart contract code is immutable. Once it's deployed to the blockchain,
we cannot change it. Our tests will ensure that the code is bug free before deployment
*/


/*we can scaffold a test for the smart contract with the help of the Mocha testing framework and the
 Chai assertion library that comes bundled with the Truffle framework.
*/

//require the smart contract for which the testing has to be done
const SocialNetwork = artifacts.require('./SocialNetwork.sol')


/*What is chai assertion library?
Chai is an assertion(true/false checker) library for node and the browser
that can be delightfully paired with any javascript testing framework.
*/
require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('SocialNetwork', ([deployer, author, tipper]) => {
  let socialNetwork
  /*this variable is an object and using this we can use all the variables
  and methods we have specified in the smart contract in this JS file for testing*/

//before is provided by mocha library
//the code enclosed inside before runs before all tests in this file regardless
//where this line is defined.
  before(async () => {
    socialNetwork = await SocialNetwork.deployed()
  })


/*describe function encloses all the tests that we want to perform
and determines what kind of tests we are performing.
It uses it() function to do the testing
*/


/*
->Async functions always return a promise.
->Await waits for the response of the function and does not let proceed further until
something has been returned
*/
  describe('deployment', async () => {

    /*test if the smart contract has been deployed successfully*/
    it('deploys successfully', async () => {
      const address = await socialNetwork.address
      //checks if the address of the smart contract is valid or not
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    //check if the smart contract's name is valid(as specified in the contract)
    it('has a name', async () => {
      const name = await socialNetwork.name()
      assert.equal(name, 'Dapp for Post Sharing')
    })
  })

//from here onwards we have begun testing for the posts functions->like create,tip etc..
  describe('posts', async () => {
    let result, postCount

    before(async () => {
      result = await socialNetwork.createPost('This is my first post', { from: author })//CALLS THE createPost method
      postCount = await socialNetwork.postCount()//GETS POST COUNT
    })

//testing for createPost
    it('creates posts', async () => {
      // SUCCESS
      assert.equal(postCount, 1);
      //check all the values within the Post struct
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.tipAmount, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // FAILURE: Post must have content i.e should not be empty post
      await socialNetwork.createPost('', { from: author }).should.be.rejected;
    })

    it('lists posts', async () => {
      const post = await socialNetwork.posts(postCount)
      assert.equal(post.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(post.content, 'This is my first post', 'content is correct')
      assert.equal(post.tipAmount, '0', 'tip amount is correct')
      assert.equal(post.author, author, 'author is correct')
    })

    it('allows users to tip posts', async () => {
      // Track the author balance before tipping
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)//use web3 to get Balance
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)//use web3 to convert balance amount to BIG NUMBER

      //here we talk about transactions in Wei
      //1 ETH=10^18 Wei
      //We must use the wei value because Solidity smart contracts do not support fractional cryptocurency
      result = await socialNetwork.tipPost(postCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

      // SUCCESS- if the tip was made successfully
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), postCount.toNumber(), 'id is correct')
      assert.equal(event.content, 'This is my first post', 'content is correct')
      assert.equal(event.tipAmount, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct')

      // Check that author received funds
      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipAmount
      tipAmount = web3.utils.toWei('1', 'Ether')
      tipAmount = new web3.utils.BN(tipAmount)

      const exepectedBalance = oldAuthorBalance.add(tipAmount)

      //now we check if the expected current balance is equal to the actual balance
      assert.equal(newAuthorBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to tip a post that does not exist
      await socialNetwork.tipPost(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })

  })
})
