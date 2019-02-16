import React, { useState } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";

import "./index.css";
import App from "./App";

import * as Messenger from "./Messenger";
import Data from "./Data";
import Node from "./Node";

export const dataURL = blob =>
  new Promise(callback => {
    var reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(blob);
  });

(async () => {
  window.data = { peers: {}, avatars: {}, id: null, node: null };
  console.log("Prepared storage data");

  Messenger.register();

  if (window.Notification) window.Notification.requestPermission();

  const channel = window.location.hash;
  const last = Data.channel;

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
})();

window.onhashchange = async () => {
  const channel = window.location.hash;
  if (channel) console.log("Switched to", channel);
  Data.channel = channel;
  window.app.setState({});
  Node.refresh();
};

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
