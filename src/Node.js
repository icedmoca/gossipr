import {json, getStorageHashes, notify, getMessages } from './index'

const retrieveAvatar = async (message) => {
  const hash = message.avatar
  if (hash) {
    const file = await window.node.files.cat(hash);
    const b64 = file.toString("base64");
    const avatar = "data:image/png;base64," + b64
    window.data.avatars.set(hash, avatar)
    return avatar;
  }
  return null;
}

export const subscribe = async (hash) => {
  const node = window.node

  const subscribed = await node.pubsub.ls()
  if(subscribed.includes('gossipr'+hash)) return;

  const current = () => (window.location.hash === hash)
  if(current() && window.form) window.form.setState({ ready: false });

  await node.pubsub.subscribe("gossipr"+hash, async packet => {
    const msg = json(packet.data.toString());

    if (msg.type !== "message") return
    if(!msg.name || !msg.data) return

    const blocked = json(localStorage.getItem("blocked")) || [];
    msg.peer = packet.from
    if(blocked.includes(msg.peer)) return

    getMessages(hash).push(msg)
    if(current() && window.logger) window.logger.setState({})
    else notify(hash, msg)

    await retrieveAvatar(msg)
    if (current() && window.logger) window.logger.setState({})
  });

  console.log('Subscribed to', hash)
  if(current() && window.form) window.form.setState({ ready: true });
}

export const startNode = () => {
  const node = (window.node = new window.Ipfs({
    repo: "/var/ipfs/gossipr",
    relay: { enabled: true },
    EXPERIMENTAL: { pubsub: true },
    config: {
      Addresses: {
        Swarm: [
          "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
        ]
      }
    }
  }));

  console.log('Starting IPFS node...')

  node.on("ready", async () => {
    console.log('IPFS node is ready')
    window.id = (await node.id()).id;

    setInterval(async () => {
      const hash = window.location.hash
      if(window.appBar && hash){
        const peers = await node.pubsub.peers("gossipr"+hash);
        window.appBar.setState({ peers: peers.length });
      }
    }, 3000);

    getStorageHashes().forEach(hash => subscribe(hash))
  });
};