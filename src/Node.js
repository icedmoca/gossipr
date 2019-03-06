import Data from './Data'
import * as serviceWorker from './serviceWorker'

import Crypto from 'crypto-js'

import * as Names from './contracts/Names'

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
      if (window.Notification) window.Notification.requestPermission();

      if(!Data.channels.includes(channel))
        Node.subscribe(channel)

      let others = Data.channels.filter(it => it !== channel)
      others.unshift(channel)
      Data.channels = others
    }

    Node.refreshPeers()
  },

  subscribe: async (channel) => {
    const topic = await Node.hash('gossipr'+channel)
    const channels = await Node.node.pubsub.ls()
    if(channels.includes(topic)) return

    const listener = async (packet) => {
      if(!Data.channels.includes(channel)) return
      let meta, data

      try{
        const json = packet.data.toString();
        ({ meta, data } = JSON.parse(json))
      }
      catch(e){
        const hash = packet.data.toString()
        const encrypted = await Node.node.files.cat(hash)
        const decrypted = Crypto.AES.decrypt(encrypted.toString(), channel);
        ({ meta, data } = JSON.parse(decrypted.toString(Crypto.enc.Utf8)))
      }

      if (meta.type !== "message" || !meta.name || !data) return
      Node.handleMessage({ channel, meta, data, peer: packet.from })
    }

    await Node.node.pubsub.subscribe(topic, listener)
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
    const topic = await Node.hash('gossipr' + channel)
    const raw = { meta, data }

    const json = JSON.stringify(raw)
    Node.node.pubsub.publish(topic, Node.buffer.from(json));

    const encrypted = Crypto.AES.encrypt(json, channel).toString()
    const buffer = Node.buffer.from(encrypted)
    const res = await Node.node.files.add(buffer)
    const hash = res[0].hash
    Node.node.pubsub.publish(topic, Node.buffer.from(hash));
  },

  uploadAvatar: async (file) => {
    Data.avatar = await Node.upload(file, {pin: true})
  },

  handleMessage: async (msg) => {
    msg.hash = await Node.hash(JSON.stringify(msg))
    if(Data.messages.some(it => it.hash === msg.hash)) return

    Data.messages = [...Data.messages, msg]
    if (window.logger) window.logger.setState({})

    if (Data.muted.includes(msg.channel)) return
    if (msg.peer === window.id) return
    if (Data.blocked.includes(msg.peer)) return
    if (Data.channel === msg.channel && document.visibilityState === 'visible') return
    serviceWorker.notify(msg.channel, msg.data + '\n~' + msg.meta.name)
  },

  getName: (id) => {
    if(window.data.names[id] === undefined) Node.loadName(id)
    return window.data.names[id]
  },

  loadName: async (id) => {
    if(!id) return
    console.log('Loading '+id+' name')
    window.data.names[id] = null
    const name = await Names.getName(id)
    if(name.trim() !== name) return
    window.data.names[id] = name || null
    if(window.logger) window.logger.setState({})
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