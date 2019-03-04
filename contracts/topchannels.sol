pragma solidity ^ 0.5.4;

import "./payable.sol";

contract TopChannels is Payable {
  mapping (string => uint)  _values;
  string[] _channels;
  
  uint public minimum = 10 finney;
  
  event ChannelAdded(string channel, uint value, uint total);
  
  function size() public view returns (uint) {
    return _channels.length;
  }
  
  function getChannel(uint index) public view returns (string memory) {
    return _channels[index];
  }
  
  function getValue(string memory channel) public view returns (uint) {
    return _values[channel];
  }
  
  function _add(string memory channel, uint value) private {
    require(value + _values[channel] >= _values[channel]);
    if(_values[channel] == 0) _channels.push(channel);
    _values[channel] += value;
    emit ChannelAdded(channel, value, _values[channel]);
  }
  
  function add(string memory channel) public payable {
    require(msg.value >= minimum);
    _add(channel, msg.value);
  }
  
  function suadd(string memory channel, uint value) public onlyOwner {
    _add(channel, value);
  }
  
  function setMinimum(uint _minimum) public onlyOwner {
    minimum = _minimum;
  }
}