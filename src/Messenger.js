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
    if(!channel || !window.appBar) return;

    const peers = data[channel]
    if(peers) window.appBar.setState({ peers: peers.length });
  },

  ready: (ready) => {
    if(window.form) window.form.setState({ ready })
    if(!ready) return
    const channel = Data.channel
    if(channel) sendSubscribe(channel)
    if (window.appBar) window.appBar.setState({ avatar: Data.avatar })
  },

  message: (data) => {
    window.data.messages.push(data)
    if(window.logger) window.logger.setState({})
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
