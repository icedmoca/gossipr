import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import logo from './favicon.ico'

import * as serviceWorker from "./serviceWorker";

import {startNode, subscribe} from './Node'

export const json = str => JSON.parse(str);
export const str = json => JSON.stringify(json);

export const dataURL = (blob, callback) => {
  var reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(blob);
};

export const upload = (blob, callback) => {
  const reader = new FileReader();
  reader.onloadend = async () => {
    const buffer = window.node.types.Buffer.from(reader.result);
    const res = await window.node.files.add(buffer);
    callback(res[0].hash);
  };
  reader.readAsArrayBuffer(blob);
};

export const getStorageHash = () => localStorage.getItem("hash") || "";
export const setStorageHash = (hash) => localStorage.setItem("hash", hash)

export const getStorageHashes = () => json(localStorage.getItem("hashes")) || []
export const setStorageHashes = (hashes) => localStorage.setItem("hashes", str(hashes));

export const getMessages = (hash) => window.data.messages[hash || window.location.hash] || (window.data.messages[hash || window.location.hash] = [])
export const setMessages = (hash, messages) => window.data.messages[hash || window.location.hash] = messages

export const notify = (hash, msg) => {
  if(Notification.permission === 'granted')
  new Notification(hash, {body: msg.data+'\n~'+msg.name, icon: logo})
}

export const saveCurrentHash = () => {
  const hash = window.location.hash
  setStorageHash(hash)
  if (hash) {
    const hashes = getStorageHashes();
    hashes.unshift(hash);
    setStorageHashes([...new Set(hashes)])
    console.log('Added', hash, 'to the list of hashes')
  }
};

const loadData = () => {
  window.data = {}
  window.data.messages = json(localStorage.getItem('messages')) || {}
  window.data.avatars = new Map(json(localStorage.getItem('avatars')))
  console.log('Loaded storage data')
}

const saveData = () => {
  localStorage.setItem('messages', str(window.data.messages))
  localStorage.setItem('avatars', str([...window.data.avatars]))
  console.log('Saved data to storage')
}

window.onhashchange = async () => {
  const hash = window.location.hash
  window.updateTitle();
  saveCurrentHash();

  if(!hash){
    console.log('Switched to home')
  }

  else {
    await subscribe(hash)
    console.log('Switched to', hash)
  }

  window.app.setState({});
};

(() => {
  Notification.requestPermission()
  startNode()
  const hash = window.location.hash
  const last = getStorageHash()
  loadData()
  setInterval(saveData, 5000)
  if(hash !== last){
    if(!hash){
      console.log('Redirecting to last hash', last)
      window.location.hash = last;
      return;
    }
    saveCurrentHash();
  }
})()

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
