const Service = this;
const log = (...args) => console.log.apply(null, ['[SW]', ...args])

const handle = ({type, data}) => Handlers[type] && Handlers[type](data)

const post = async (type, data) => {
  const clients = await Service.clients.matchAll()
  const msg = {type, data}
  clients.forEach(it => it.postMessage(msg));
}

const arrayBuffer = (blob) => new Promise(callback => {
  const reader = new FileReader();
  reader.onloadend = () => callback(reader.result);
  reader.readAsArrayBuffer(blob);
})

const boot = async () => {
  Service.addEventListener('install', (e) => e.waitUntil(Service.skipWaiting()))
  Service.addEventListener('activate', (e) => e.waitUntil(Service.clients.claim()))
  Service.addEventListener('message', (e) => log(e.data) || handle(e.data))

  Service.addEventListener('fetch', (event) => {
    console.log(event.request.url)
    const hash = event.request.url.split('/ipfs/')[1]
    if(hash && Node.ready) event.respondWith(Node.catAndRespond(hash))
  })

  log('Started service worker!')

  //self.importScripts('service-worker.js')
  //log('Imported Workbox')

  Service.importScripts('https://unpkg.com/ipfs@0.33.1/dist/index.min.js')
  log('Imported IPFS')

  log('Starting IPFS...')
  await Node.start()

  console.log(await Memory.node.pin.ls())

  log('IPFS is ready!')
  log('PeerID is', Memory.id)

  log('Opening database...')
  Memory.db = await Storage.init()
  log('Opened database!')

  Memory.channels = await Storage.channels
  log('Retrieved channels')

  Handlers.ready()

  Memory.channels.forEach(Node.subscribe)

  setInterval(Node.sendPeers, 3000)
  log('Sending peers every 3 seconds')
}

const Memory = {
  node: null,
  id: null,
  db: null,
  channels: [],
}

const Node = {

  get ready() { return Memory.node && Memory.node.isOnline() },
  get buffer() { return Memory.node.types.Buffer },

  config: {
    repo: "/gossipr/ipfs",
    relay: { enabled: true },
    EXPERIMENTAL: { pubsub: true },
    config: {
      Addresses: {
        Swarm: ["/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"]
      }
    }
  },

  start: () => new Promise(callback => {
    const node = new Service.Ipfs(Node.config)
    node.on('ready', async () => {
      Memory.node = node
      Memory.id = (await node.id()).id
      callback()
    })
  }),

  subscribe: async (channel) => {
    const channels = await Memory.node.pubsub.ls()
    if(channels.includes('gossipr'+channel)) return 

    const listener = async (packet) => {
      const peer = packet.from

      const { meta, data } = JSON.parse(packet.data.toString())
      console.log(meta, data)
      if(meta.type !== "message" || !meta.name || !data) return

      post('message', {meta, data, peer})
    
      if(!Service.Notification) return
      Service.registration.showNotification(channel, { body: data + '\n~' + meta.name, icon: 'favicon.ico'})
    }

    await Memory.node.pubsub.subscribe('gossipr'+channel, listener)
    log('Subscribed to', channel)
  },

  sendPeers: async () => {
    const peers = (channel) => Memory.node.pubsub.peers('gossipr'+channel)
    const transform = async (channels, channel) => { channels[channel] = await peers(channel); return channels }
    const channels = await Memory.channels.reduce(transform, {})
    post('peers', channels)
  },

  catAndRespond: async (hash) => {
    const data = await Memory.node.files.cat(hash)
    return new Response(data, { status: 200, statusText: 'OK', headers: {} })
  },

  upload: async (file, options) => {
    const arr = await arrayBuffer(file)
    const buffer = Node.buffer.from(arr)
    const res = await Memory.node.files.add(buffer, options)
    return res[0].hash
  }

}

const Storage = {

  init: () => new Promise(callback => {
    const idb = Service.indexedDB || Service.webkitIndexedDB || Service.mozIndexedDB || Service.OIndexedDB || Service.msIndexedDB
    if(!idb) throw new Error("Can't find IndexedDB")

    const req = idb.open('/gossipr/app', 3)
    req.onerror = () => { throw new Error("Can't open database") }
    req.onsuccess = () => callback(req.result)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      e.target.transaction.oncomplete = () => callback(db)
      if(!db.objectStoreNames.contains('app'))
        db.createObjectStore('app')
    }
  }),

  store: (name) => {
    if (!Memory.db) throw new Error("Database is not loaded")
    const transaction = Memory.db.transaction([name], 'readwrite');
    return transaction.objectStore(name)
  },

  get: (store, key, def) => new Promise(callback => {
    store.get(key).onsuccess = (e) => callback(e.target.result || def)
  }),

  set: (store, key, value) => store.put(value, key),

  get app() { return this.store('app') },

  get channels() { return this.get(this.app, 'channels', []) },
  set channels(value) { this.set(this.app, 'channels', value) },

}

const Handlers = {

  ready: () => post('ready', Node.ready),

  subscribe: async (channel) => {
    await Node.subscribe(channel)
    Memory.channels = Memory.channels.filter(it => it !== channel)
    Memory.channels.unshift(channel)
    Storage.channels = Memory.channels
    log('Added', channel, 'to the list of channels')
  },

  unsubscribe: async (channel) => {
    Memory.channels = Memory.channels.filter(it => it !== channel)
    Storage.channels = Memory.channels
    log('Unsubscribed from', channel)
  },

  publish: async ({channel, meta, data}) => {
    const raw = { meta, data }
    const json = JSON.stringify(raw)
    const buffer = Node.buffer.from(json);
    Memory.node.pubsub.publish("gossipr"+channel, buffer);
  },

  upload: async ({channel, meta, file}) => {
    const hash = await Node.upload(file, {pin: true})
    Handlers.publish({ channel, meta, data: 'https://ipfs.io/ipfs/'+hash })
  },

  avatar: async (file) => {
    const hash = await Node.upload(file, {pin: true})
    post('avatar', hash)
  },

}

boot()