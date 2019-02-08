console.log('Started IPFS service worker!')

self.importScripts('ipfs.min.js')
console.log('Imported IPFS')

const config = {
  repo: "/gossipr/ipfs",
  relay: { enabled: true },
  EXPERIMENTAL: { pubsub: true },
  config: {
    Addresses: {
      Swarm: ["/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"]
    }
  }
}

const makeNode = () => new Promise(callback => {
  const node = new self.Ipfs(config)
  node.on('ready', () => callback(node))
})

const openDB = () => new Promise(callback => {
  const onerror = () => { throw "Error accessing IndexedDB database" }

  self.IndexedDB = self.indexedDB || self.webkitIndexedDB || self.mozIndexedDB || self.OIndexedDB || self.msIndexedDB
  self.IDBTransaction = self.IDBTransaction || self.webkitIDBTransaction || self.OIDBTransaction || self.msIDBTransaction
  if(!self.IndexedDB || !self.IDBTransaction) onerror()

  const req = self.IndexedDB.open('/gossipr/app', 2)

  req.onerror = onerror
  req.onsuccess = () => callback(req.result)
  req.onupgradeneeded = (e) => {
    const db = e.target.result
    const store = db.createObjectStore('gossipr')
    store.transaction.oncomplete = () => callback(db)
  }
})

const saveData = (key, value) => {
  if(!self.db) throw "Error accessing IndexedDB database"
  const transaction = self.db.transaction(['gossipr'], 'readwrite');
  transaction.objectStore('gossipr').put(value, key);
}

const retrieveData = async (key) => new Promise(callback => {
  if(!self.db) throw "Error accessing IndexedDB database"
  const transaction = self.db.transaction(['gossipr'], 'readwrite');
  transaction.objectStore('gossipr').get(key).onsuccess = (e) => callback(e.target.result)
})

const getHashes = () => retrieveData('hashes')

const subscribe = async (hash) => {
  const listener = async (packet) => {
    console.log(packet)
    self.registration.showNotification('Received message from '+packet.from)
  }
  await self.node.pubsub.subscribe('gossipr'+hash, listener)
  console.log('Subscribed to', hash)
}

const unsubscribe = async (hash) => {
  console.log('Unsubscribed from', hash)
}

const join = (hash) => {
  subscribe(hash)
  self.hashes.unshift(hash)
  saveData('hashes', self.hashes)
}

const leave = (hash) => {
  unsubscribe(hash)
  self.hashes = self.hashes.filter(it => it != hash)
  saveData('hashes', self.hashes)
}

const process = ({action, data}) => {
  if(action === 'join') join(data)
  if(action === 'leave') leave(data)
}

const boot = async () => {
  console.log('Opening database...')
  self.db = await openDB()
  console.log('Successfully opened database!')

  self.hashes = await getHashes() || []
  console.log(self.hashes)

  console.log('Starting IPFS node...')
  self.node = await makeNode()
  console.log('IPFS node is ready!')

  const {id} = await self.node.id();
  console.log('PeerID is', id)

  self.hashes.forEach(subscribe)

  setInterval(async () => {
    const peers = async (hash) => await self.node.pubsub.peers('gossipr'+hash)
    const hashes = await self.hashes.reduce(async (hashes, hash) => {
        hashes[hash] = await peers(hash)
        return hashes;
    }, {})
    const clients = await self.clients.matchAll()
    clients.forEach(it => it.postMessage(hashes));
  }, 3000)
}

self.addEventListener('install', (e) => e.waitUntil(self.skipWaiting()))
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('message', (e) => process(e.data))

boot()

// self.addEventListener('fetch', (event) => {
//   const hash = event.request.url.split('/ipfs/')[1]
//   event.respondWith(catAndRespond(hash))
// })
//
// async function catAndRespond (hash) {
//   const data = await self.node.files.cat(hash)
//   return new Response(data, { status: 200, statusText: 'OK', headers: {} })
// }
