import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

window.onhashchange = () => {
  if(window.app) window.app.setState({hash: window.location.hash})
  localStorage.setItem('hash', window.location.hash)
  window.updateTitle()
  makeNode()
}

if(window.location.hash){
  localStorage.setItem('hash', window.location.hash)
} else {
  const hash = localStorage.getItem('hash')
  if(hash) window.location.hash = hash
}

export const json = str => JSON.parse(str);
export const str = json => JSON.stringify(json);

const makeNode = () => {
  if(window.node) window.node.shutdown()
  if(window.form) window.form.setState({ready: false})
  if(window.logger) window.logger.setState({messages: []})

  const node = window.node = new window.Ipfs({
    EXPERIMENTAL: { pubsub: true },
    config: {
      Addresses: {
        Swarm: [
          "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
        ]
      }
    }
  });

  node.on("ready", async () => {
    window.id = (await node.id()).id;
    if(window.form) window.form.setState({ready: true})
    
    await node.pubsub.subscribe("gossipr" + window.location.hash, packet => {
      const msg = json(packet.data.toString());
      const blocked = json(localStorage.getItem('blocked')) || []
      if (msg.type === 'message')
        if (msg.name && msg.data)
          if (!blocked.includes(packet.from))
            if (window.logger) window.logger.log(packet.from, msg);
    });

    if (window.peers) clearInterval(window.peers)
    window.peers = setInterval(async () => {
      const peers = (await node.pubsub.peers('gossipr' + window.location.hash)).length
      window.appBar.setState({ peers })
    }, 3000);
  });
}

export const dataURL = (blob, callback) => {
    var reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(blob);
};

export const upload = (blob, callback) => {
  const reader = new FileReader()
  reader.onloadend = async () => {
    const buffer = window.node.types.Buffer.from(reader.result)
    const res = await window.node.files.add(buffer)
    callback(res[0].hash)
  }
  reader.readAsArrayBuffer(blob)
}

ReactDOM.render(<App />, document.getElementById('root'));

if(window.location.hash) makeNode()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
