pragma solidity ^0.5.0;//Solidity programming language version that we'll use

contract SocialNetwork {
  //a state variable that will represent the name of our smart contract. This state
  //variable's value will "get stored directly to the blockchain" itself,
  //unlike a local variable which will not.
    string public name;//state variable
    /*Then we declare the state variable public with a modifier.
     This tells Solidity that we want to read this variable value from outside the
    smart contract. Because we have done this, Solidity will automatically create a name()
     function behind the scenes that
     will return this variable's value (we won't have to code it ourselves).
    */
    uint public postCount = 0;//a counter cache to generate post ids
    //We will increment this value whenever new posts are created to generate post ids

    /*This mapping will uses key-value pairs to store posts,
    where the key is an id, and the value is a post struct.
    These mappings are a lot like associative arrays or hashes in other programming languages.*/
    mapping(uint => Post) public posts;

/*Solidity allows us to define our own data structures with Structs
This struct particularly stores all the details required for a specific Post */
    struct Post {
        uint id;//unique id of the post
        string content;//content of the post
        uint tipAmount;//the tipAmount currently the post has gained
        address payable author;//who is the author of the post in the form a public key
    }


/*A BLOCKCHAIN event
An event is emitted, it stores the arguments passed in transaction logs.
These logs are stored on blockchain
and are accessible using address of the contract till
 the contract is present on the blockchain*/
    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    //constructor function
    constructor() public {
        name = "Dapp for Post Sharing";
    }

/*Function to create new Posts which takes a string as input
i.e what the user wants too share with the world in the form of a text

->public modifier to ensure that we can call the function
outside the smart contract, i.e., from our tests or the client side website.

Why the memory keyword?
->If you declare variables in functions without the memory keyword,
then solidity will try to use the storage structure, which currently compiles,
 but can produce unexpected results. memory tells solidity to create a chunk of
 space for the variable at method runtime, guaranteeing its size and structure
  for future use in that method.
*/
    function createPost(string memory _content) public {
        //a validation to ensure that users can't post blank content.
        //If the expression inside require evaluates to true,
        //the function will continue execution. If not, it will halt.
        require(bytes(_content).length > 0);

        // Increment the post count
        postCount ++;

        // Create the post and store it in the map
        posts[postCount] = Post(postCount, _content, 0, msg.sender);

        // Trigger event
        emit PostCreated(postCount, _content, 0, msg.sender);

        //msg.sender-> This is a special variable value provided by Solidity that tells
        //us the user who called the function.

        //intitialy the tipAmount is 0 when someone creats the post
    }

    /*Any time we store data on the Ethereum blockchain, we must pay a gas fee with Ether
    (Ethereum's cryptocurrency). This is used to pay the miners who maintain the network.

    Since we stored a new post on the blockchain, a small fee was debited from our account.
    You can see that your account balance has gone down in Ganache.

    While storing data on the blockchain costs money, fetching does not. In summary,
    reads are free, but writes cost gas.*/



/*What does payable keyword means?
The presence of the payable modifier means that the function can process transactions
with non-zero Ether value. If a transaction that transfers Ether comes to the contract and calls some function X,
then if this function X does not have the payable modifier, then the transaction will be rejected
*/
    function tipPost(uint _id) public payable {
        // Make sure the id is valid
        require(_id > 0 && _id <= postCount);
        // Fetch the post
        Post memory _post = posts[_id];
        // Fetch the author
        address payable _author = _post.author;
        // Pay the author by sending them Ether
        address(_author).transfer(msg.value);//Solidity allows us to read the cryptocurrency
        // value with the special msg.value variable

        // Incremet the tip amount
        _post.tipAmount = _post.tipAmount + msg.value;
        // Update the post
        posts[_id] = _post;
        // Trigger an event
        emit PostTipped(postCount, _post.content, _post.tipAmount, _author);
    }
}
