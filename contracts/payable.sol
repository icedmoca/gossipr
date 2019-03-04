pragma solidity ^0.5.4;

import "./ownable.sol";

contract Payable is Ownable {
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