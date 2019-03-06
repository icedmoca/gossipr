import Web3 from 'web3'
import Fortmatic from 'fortmatic';

import * as Names from './contracts/Names'
import * as TopChannels from './contracts/TopChannels'

export const init = async () => {
  const ether = window.ether = { contracts: {} }

  if(window.ethereum || window.web3){
    ether.web3 = new Web3(window.ethereum || window.web3.currentProvider)
    console.log('Using provided web3')
  }
  else {
    ether.web3 = new Web3(new Fortmatic("pk_live_58FBE3DFFA91CE74").getProvider())
    console.log('Using fortmatic web3')
  }

  loadContracts(Names, TopChannels)
}

export const $ = (name) => (method, amount) => (...args) => {
  const transaction = getContract(name).methods[method](...args)
  return amount ? send(transaction, amount) : transaction.call()
}

export const getWeb3 = () => window.ether.web3

const getContracts = () => window.ether.contracts
const getContract = (name) => getContracts()[name]

const loadContract = (contract) => getContracts()[contract.name] = new (getWeb3().eth.Contract)(contract.ABI, contract.address)
const loadContracts = (...contracts) => contracts.forEach(loadContract)

const send = async (method, value) => {
  if(window.ethereum) await window.ethereum.enable()
  const accounts = await (getWeb3().eth.getAccounts())
  return await method.send({ from: accounts[0], value})
}