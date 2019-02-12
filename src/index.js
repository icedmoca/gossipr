import React,  { useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import * as Messenger from '/src/Messenger'
import Data from '/src/Data'

export const dataURL = (blob) => new Promise(callback => {
  var reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(blob);
});

const updateTitle = () => {
  if(!window.location.hash) document.title = "Gossipr"
  else document.title = window.location.hash+" - Gossipr" 
}

(() => {
  window.data = { messages: [], channels: {} }
  console.log('Prepared storage data')

  Messenger.register()

  if(window.Notification) Notification.requestPermission()

  updateTitle()

  const channel = window.location.hash
  const last = Data.channel

  if(channel !== last){
    if(channel) return Data.channel = channel
    console.log('Redirecting to last hash', last)
    window.location.hash = last;
  }
})()

window.onhashchange = async () => {
  const channel = window.location.hash
  Data.channel = channel
  updateTitle();

  if(!channel){
    console.log('Switched to home')
  } else {
    Messenger.sendSubscribe(channel)
    console.log('Switched to', channel)
  }

  window.app.setState({});
  Messenger.sendReady()
};

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
//serviceWorkers.register();
