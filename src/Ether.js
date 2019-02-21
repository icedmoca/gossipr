import Data from './Data'

import {Names} from './Contracts'

const Ether = {

  start: () => {
    window.ether = Ether;

    //const web3 = Ether.web3 = new Web3("wss://kovan.infura.io/ws")
    //const account = Ether.account = Ether.createAccount()
   // Data.wallet = account.privateKey

    //const names = new web3.eth.Contract(Names, "0xfc6ac09156617f612aa0505801890309a552f449")
    //Ether.contracts = {names}
  },

  buyName: (name) => {
    const id = window.data.id
    const method = Ether.execute('names', 'buyName')(id, name)
    Ether.send(method, "20")
  },

  execute: (contract, name) => Ether.contracts[contract].methods[name],

  send: (method, price) => {
    const from = Ether.account.address
    const value = Ether.web3.utils.toWei(price, "finney")
    method.send({from, value})
  }
}

export default Ether