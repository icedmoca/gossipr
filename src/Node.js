import Data from './Data'
import * as Messenger from './Messenger'

const Node = {

  get node() { return window.data.node },
  get id() { return window.data.id },
  get ready() { return Node.node && Node.node.isOnline() },
  get buffer() { return Node.node.types.Buffer },

  config: {
    repo: "/gossipr/ipfs",
    EXPERIMENTAL: { pubsub: true },
    config: {
      Addresses: {
        Swarm: ["/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"]
      }
    }
  },

  start: () => new Promise(callback => {
    const node = new window.Ipfs(Node.config)
    node.on('ready', async () => {
      window.data.node = node
      window.data.id = (await node.id()).id
      callback()
    })
  }),

  refresh: () => {
    if(!Node.ready) return
    window.app.setState({ ready: true })

    const channel = Data.channel
    if (channel){

      if(!Data.channels.includes(channel))
        Node.subscribe(channel)

      let others = Data.channels.filter(it => it !== channel)
      others.unshift(channel)
      Data.channels = others
    }

    Node.refreshPeers()
  },

  subscribe: async (channel) => {
    const hash = await Node.hash('gossipr'+channel)
    const channels = await Node.node.pubsub.ls()
    if(channels.includes(hash)) return

    const listener = async (packet) => {
      if(!Data.channels.includes(channel)) return

      const peer = packet.from
      const { meta, data } = JSON.parse(packet.data.toString())
      if (meta.type !== "message" || !meta.name || !data) return

      Node.handleMessage({ meta, data, peer, channel })
    }

    await Node.node.pubsub.subscribe(hash, listener)
    console.log('Subscribed to', channel)
  },

  unsubscribe: async (channel) => {
    const channels = Data.channels.filter(it => it !== channel)
    Data.channels = channels
    console.log('Unsubscribed from', channel)
  },

  refreshPeers: async () => {
    const current = Data.channel
    if (!current) return;

    const result = {};

    for(const channel of Data.channels){
      const hash = await Node.hash('gossipr'+channel)
      const peers = await Node.node.pubsub.peers(hash)
      result[channel] = peers
    }

    window.data.peers = result
    if(window.drawer) window.drawer.setState({})
 
    if (!result[current]) return
    if(window.appBar) window.appBar.setState({ peers: result[current].length });
  },

  catAndRespond: async (hash) => {
    const data = await Node.node.files.cat(hash)
    return new Response(data, { status: 200, statusText: 'OK', headers: {} })
  },

  arrayBuffer: (blob) => new Promise(callback => {
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsArrayBuffer(blob);
  }),

  upload: async (file, options) => {
    const arr = await Node.arrayBuffer(file)
    const buffer = Node.buffer.from(arr)
    const res = await Node.node.files.add(buffer, options)
    return res[0].hash
  },

  hash: async (data) => {
    const buffer = Node.buffer.from(data)
    const res = await Node.node.files.add(buffer, { onlyHash: true })
    return res[0].hash
  },

  meta: (type) => ({ type, name: Data.name, time: new Date().getTime(), avatar: Data.avatar }),

  sendMessage: (data) => Node.publish(Data.channel, Node.meta('message'), data),

  sendFile: async (file) => {
    const hash = await Node.upload(file, { pin: true })
    return 'https://ipfs.io/ipfs/' + hash
  },

  publish: async (channel, meta, data) => {
    const raw = { meta, data }
    const json = JSON.stringify(raw)
    const buffer = Node.buffer.from(json);
    const hash = await Node.hash('gossipr'+channel)
    Node.node.pubsub.publish(hash, buffer);
  },

  uploadAvatar: async (file) => {
    Data.avatar = await Node.upload(file, {pin: true})
  },

  handleMessage: async (msg) => {
    Data.messages = [...Data.messages, msg]
    if (window.logger) window.logger.setState({})

    if (Data.muted.includes(msg.channel)) return
    if (msg.peer === window.id) return
    if (Data.blocked.includes(msg.peer)) return
    if (Data.channel === msg.channel && document.visibilityState === 'visible') return
    Messenger.notify(msg.channel, msg.data + '\n~' + msg.meta.name)
  },

  getAvatar: (hash) => {
    const avatar = window.data.avatars[hash]
    if(!avatar) Node.loadAvatar(hash)
    return avatar
  },

  loadAvatar: async (hash) => {
    if(!hash) return
    if(window.data.avatars[hash]) return
    const data = await Node.node.files.cat(hash)
    window.data.avatars[hash] = 'data:image/png;base64,'+data.toString("base64")
    if(window.logger) window.logger.setState({})
  },

}

export default Node