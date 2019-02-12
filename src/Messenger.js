import Data from '/src/Data'

const handle = ({type, data}) => Handlers[type] && Handlers[type](data)

export const register = async () => {
  await navigator.serviceWorker.register('ipfs-sw.js')
  navigator.serviceWorker.onmessage = (e) => console.log(e.data) || handle(e.data)

  await wait()
  console.log('Successfully connected to service worker')

  sendReady()
}

const wait = () => new Promise(callback => {
  const waiter = setInterval(() => {
    if (!navigator.serviceWorker.controller) return
    clearInterval(waiter)
    callback()
  }, 100)
})

const post = (type, data) => {
  const controller = navigator.serviceWorker.controller
  if(controller) controller.postMessage({type, data})
}

const Handlers = {

  avatar: (hash) => Data.avatar = hash,

  peers: (data) => {
    const channel = Data.channel
    if(!channel) return;

    window.data.channels = data
    if(window.drawer) window.drawer.setState({})

    const peers = data[channel]
    if(!peers) return
    if(window.appBar) window.appBar.setState({ peers: peers.length });
  },

  id: (id) => window.data.id = id,

  ready: (ready) => {
    window.app.setState({ready})
    if(!ready) return

    sendPeers()
    sendId()

    const channel = Data.channel
    if(channel) sendSubscribe(channel)
  },

  message: (msg) => {
    window.data.messages.push(msg)
    if(window.logger) window.logger.setState({})

    if(msg.peer === window.id) return
    if(Data.blocked.includes(msg.peer)) return
    if(Data.channel === msg.channel) return
    sendNotify(msg.channel, msg.data + '\n~' + msg.meta.name)
  }, 

  avatars: (data) => window.data.avatars = data,
  messages: (data) => window.data.messages = data,
}


export const sendReady = () => post('ready')

export const sendMessages = (channel) => post('messages', channel)

export const sendAvatars = (hashes) => post('avatars', hashes)

export const sendSubscribe = (channel) => post('subscribe', channel)
export const sendUnsubscribe = (channel) => post('unsubscribe', channel)

export const sendAvatar = (file) => post('avatar', file)

export const sendPeers = () => post('peers')

export const sendId = () => post('id')

export const sendNotify = (channel, body) => post('notify', {channel, body})

export const sendPublish = (data) => {
  const channel = Data.channel
  const meta = Data.meta('message')
  post('publish', {channel, meta, data})
}

export const sendUpload = (file) => {
  const channel = Data.channel
  const meta = Data.meta('message')
  post('upload', {channel, meta, file})
}
