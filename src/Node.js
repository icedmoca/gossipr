import {json} from './index'

export default () => {
  if (window.node) window.node.shutdown();
  if (window.form) window.form.setState({ ready: false });

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

  node.on("ready", async () => {
    window.id = (await node.id()).id;
    if (window.form) window.form.setState({ ready: true });

    await node.pubsub.subscribe("gossipr" + window.location.hash, packet => {
      const msg = json(packet.data.toString());
      const blocked = json(localStorage.getItem("blocked")) || [];
      if (msg.type === "message")
        if (msg.name && msg.data)
          if (!blocked.includes(packet.from))
            if (window.logger) window.logger.log(packet.from, msg);
    });

    if (window.peers) clearInterval(window.peers);
    window.peers = setInterval(async () => {
      const peers = (await node.pubsub.peers("gossipr" + window.location.hash))
        .length;
      window.appBar.setState({ peers });
    }, 3000);
  });
};