import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import makeNode from './Node'

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

const getStorageHash = () => localStorage.getItem("hash") || "";

const saveHash = () => {
  const hash = window.location.hash
  localStorage.setItem("hash", hash);
  if (hash) {
    const hashes = json(localStorage.getItem("hashes")) || [];
    if (!hashes.includes(hash)) hashes.unshift(hash);
    localStorage.setItem("hashes", str(hashes));
  }
};

window.onhashchange = () => {
  const hash = window.location.hash
  const last = getStorageHash()
  window.updateTitle();
  saveHash();
  if(hash) {
    makeNode();
    const log = window.logger
    if(log) log.setState({ messages: log.getMessages() });
  }
  if (window.app) window.app.setState({ hash, lastHash: last.substr(1) });
};

(() => {
  const hash = window.location.hash
  const last = getStorageHash()
  if(hash !== last){
    if(hash === ''){
      window.location.hash = last;
      return;
    }
    saveHash();
  }
  makeNode();
})()

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
