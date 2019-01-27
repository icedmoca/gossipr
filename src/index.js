import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

if(window.location.protocol==='http:'){
  const https = window.location.href.replace('http', 'https')
  if(!['127.0.0.1','localhost'].includes(window.location.hostname))
  fetch(https).then(() => window.location.href = https)
}

ReactDOM.render(<App />, document.getElementById('root'));

export const json = str => JSON.parse(str);
export const str = json => JSON.stringify(json);

export const node = (window.node = new window.Ipfs({
  EXPERIMENTAL: { pubsub: true },
  config: {
    Addresses: {
      Swarm: [
        "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
      ]
    }
  }
}));

node.on("ready", async () => {
  const id = (window.id = (await node.id()).id);

  await node.pubsub.subscribe("gossipr", packet => {
    const msg = json(packet.data.toString());
    if(msg.name && msg.data) window.logger.log(msg);
  });

  window.form.setState({ ready: true });

  setInterval(async () => {
    const peers = (await node.pubsub.peers('gossipr')).length
    window.appBar.setState({ peers })
  }, 3000);
});

export const dataURL = (blob, callback) => {
    var reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(blob);
};

export const upload = (blob, callback) => {
  const reader = new FileReader()
  reader.onloadend = async () => {
    const buffer = node.types.Buffer.from(reader.result)
    const res = await node.files.add(buffer)
    callback(res[0].hash)
  }
  reader.readAsArrayBuffer(blob)
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.register();
