import Web3 from 'web3'

import {Names} from './Contracts'

const Ether = {

  addresses: {
    Names: "0xe6d819633998d87927c7310f7f7154c6e3a1a00f"
  },

  start: () => {
    window.ether = Ether;

    if(window.ethereum){
      Ether.web3 = new Web3(window.ethereum)
      console.log('Using provided web3')
    }
    else {
      Ether.web3 = new Web3("https://ropsten.infura.io/v3/1dc73859cf9b46398409a2cbe1c5af4b")
      console.log('Using embedded web3')
    }

    const names = new Ether.web3.eth.Contract(Names, Ether.addresses.Names)
    Ether.contracts = {names}


  },

  buyName: (name) => {
    const id = window.data.id
    const method = Ether.execute('names', 'buyName')(id, name)
    return Ether.send(method, "20")
  },

  getName: (id) => Ether.execute('names', 'getName')(id).call(),

  execute: (contract, name) => Ether.contracts[contract].methods[name],

  send: async (method, price) => {
    await window.ethereum.enable()
    const accounts = await Ether.web3.eth.getAccounts()
    const value = Ether.web3.utils.toWei(price, "finney")
    return await method.send({ from: accounts[0], value})
  }
}

export default Ether