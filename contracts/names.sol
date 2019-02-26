pragma solidity ^ 0.5.4;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address payable private _owner;

  event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() internal {
    _owner = msg.sender;
    emit OwnershipTransferred(address(0), _owner);
  }

  /**
   * @return the address of the owner.
   */
  function owner() public view returns(address payable) {
    return _owner;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(isOwner());
    _;
  }

  /**
   * @return true if `msg.sender` is the owner of the contract.
   */
  function isOwner() public view returns(bool) {
    return msg.sender == _owner;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   * @notice Renouncing to ownership will leave the contract without an owner.
   * It will not be possible to call the functions with the `onlyOwner`
   * modifier anymore.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipTransferred(_owner, address(0));
    _owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function transferOwnership(address payable newOwner) public onlyOwner {
    _transferOwnership(newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address payable newOwner) internal {
    require(newOwner != address(0));
    emit OwnershipTransferred(_owner, newOwner);
    _owner = newOwner;
  }
}

contract Names is Ownable {

  mapping(string => address) private addresses;
  mapping(string => string) private names;
  mapping(string => bool) private used;

  event NameChanged(string _peerId, string _name);
  event PriceChanged(uint _price);

  uint public price = 10 finney;

  function getName(string memory _peerId) public view returns(string memory) {
    return names[_peerId];
  }

  function isUsed(string memory _name) public view returns(bool) {
    return used[_name];
  }

  function getOwner(string memory _peerId) public view returns(address) {
    return addresses[_peerId];
  }

  function _setName(string memory _peerId, string memory _name) private  {
    require(!used[_name]);              // Check the name is unused
    used[names[_peerId]] = false;       // Set old name as unused
    used[_name] = true;                 // Set new name as used
    names[_peerId] = _name;             // Set name of this _peerId
    addresses[_peerId] = msg.sender;    // Set owner of this _peerId
    emit NameChanged(_peerId, _name);   // Emit NameChanged event
  }

  function buyName(string memory _peerId, string memory _name) public payable {
    require(msg.value == price);                            // Check the price is correct
    address owner = addresses[_peerId];                     // Get the owner of this _peerId
    require(owner == address(0) || owner == msg.sender);    // Check the owner is not set, or the sender is the owner
    _setName(_peerId, _name);                               // Execute name change
  }

  function setName(string memory _peerId, string memory _name) public onlyOwner {
    _setName(_peerId, _name);
  }

  function setPrice(uint _price) public onlyOwner {
    price = _price;
    emit PriceChanged(_price);
  }

  function balance() public view returns(uint){
    return address(this).balance;
  }

  function withdraw(uint _amount) public onlyOwner {
    require(_amount <= address(this).balance);
    owner().transfer(_amount);
  }

  function withdrawAll() public onlyOwner {
    withdraw(address(this).balance);
  }

  function kill() public onlyOwner {
    selfdestruct(owner());
  }

}