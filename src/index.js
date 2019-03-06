import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import "./index.css";
import App from "./App";

import Data from "./Data";
import Node from "./Node";
import * as Ether from './Ether';

export const dataURL = blob => new Promise(callback => {
  var reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(blob);
});

const sanitize = (channel) => {
  return unescape(channel).toLowerCase().replace(new RegExp(' ', 'g'), '-')
}

(async () => {

  serviceWorker.connect();

  Ether.init()

  window.data = { peers: {}, avatars: {}, names: [], id: null, node: null };
  console.log("Prepared storage data");

  const last = Data.channel;

  const hash = window.location.hash
  const channel = sanitize(window.location.hash);
  if(channel !== hash) window.location.hash = channel

  if (channel !== last) {
    if(channel) Data.channel = channel
    else {
      console.log("Redirecting to last channel", last);
      window.location.hash = last;
    }
  }

  if(!Array.isArray(Data.messages)) Data.messages = []

  console.log("Starting IPFS...");
  await Node.start();
  console.log("IPFS is ready!");

  console.log("Pins are", await Node.node.pin.ls());
  console.log("PeerID is", Node.id);

  console.log("Channels are", Data.channels);
  Data.channels.forEach(Node.subscribe);

  setInterval(Node.refreshPeers, 2000);
  console.log("Refreshing peers every 2 seconds");

  if (Data.avatar) Node.loadAvatar(Data.avatar);

  Node.refresh();

  const hashify = async msg => ({...msg, hash: await Node.hash(JSON.stringify(msg)) })
  const messages = Data.messages.map(async it => (it.hash)?it:(await hashify(it)))
  Data.messages = await Promise.all(messages)
})();

window.onhashchange = async () => {
  const hash = window.location.hash
  const channel = sanitize(window.location.hash);
  if(channel !== hash) return window.location.hash = channel
  if (channel) console.log("Switched to", channel);
  Data.channel = channel;
  window.app.setState({});
  if(Node.ready) Node.refresh();
};

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
