pragma solidity ^ 0.4.25;

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address private _owner;

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
  function owner() public view returns(address) {
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
  function transferOwnership(address newOwner) public onlyOwner {
    _transferOwnership(newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address newOwner) internal {
    require(newOwner != address(0));
    emit OwnershipTransferred(_owner, newOwner);
    _owner = newOwner;
  }
}

contract Names is Ownable {

  mapping(string => string) private names;
  mapping(string => bool) private used;

  event NameChanged(string _peerId, string _name);
  event PriceChanged(uint _price);

  uint public price = 10 finney;

  function getName(string memory _peerId) public view returns (string memory) {
    return names[_peerId];
  }
  
  function isUsed(string memory _name) public view returns (bool) {
    return used[_name];
  }

  function _setName(string memory _peerId, string memory _name) private  {
    require(!isUsed(_name));
    used[_name] = true;
    names[_peerId] = _name;
    emit NameChanged(_peerId, _name);
  }

  function buyName(string memory _peerId, string memory _name) public payable {
    require(msg.value == price);
    _setName(_peerId, _name);
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