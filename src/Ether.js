import Web3 from 'web3'
import Fortmatic from 'fortmatic';

import {Names} from './Contracts'

const Ether = {

  contracts: {},

  start: () => {
    window.ether = Ether;

    if(window.ethereum || window.web3){
      Ether.web3 = new Web3(window.ethereum || window.web3.currentProvider)
      console.log('Using provided web3')
    }
    else {
      Ether.web3 = new Web3(new Fortmatic("pk_live_58FBE3DFFA91CE74").getProvider())
      console.log('Using fortmatic web3')
    }

    const names = new Ether.web3.eth.Contract(Names, "0xf01b73d433870b5b99e786643d4e96219a585799")
    Ether.contracts = {names}
  },

  getPrice: () => Ether.execute('names', 'price')().call(),

  buyName: async (name) => {
    const id = window.data.id
    const price = await Ether.getPrice()
    const method = Ether.execute('names', 'buyName')(id, name)
    return Ether.send(method, price)
  },

  getName: (id) => Ether.execute('names', 'getName')(id).call(),

  isUsed: (name) => Ether.execute('names', 'isUsed')(name).call(),

  execute: (contract, name) => Ether.contracts[contract].methods[name],

  send: async (method, value) => {
    if(window.ethereum) await window.ethereum.enable()
    const accounts = await Ether.web3.eth.getAccounts()
    return await method.send({ from: accounts[0], value})
  }
}

export default Ether