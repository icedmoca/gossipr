import Node from './Node'

const Data = {
  get name() { return localStorage.name || 'Gossipr' },
  set name(value) { localStorage.name = value },

  get newfag() { return localStorage.newfag !== 'false' },
  set newfag(value) { localStorage.newfag = value },

  get lang() { return localStorage.lang || navigator.language.split('-')[0] },
  set lang(value) { localStorage.lang = value },

  get avatar() { return localStorage.avatar || '' },
  set avatar(hash) { (async () => {
    localStorage.avatar = hash
    if(hash) await Node.loadAvatar(hash)
    window.drawer.setState({})
  })() },

  get theme() { return localStorage.theme || "navy" },
  set theme(value) { localStorage.theme = value },

  get channel() { return localStorage.channel || "" },
  set channel(value) { 
    localStorage.channel = value 
    if(window.location.hash !== value) window.location.hash = value
  },

  get multiline() { return localStorage.multiline === 'true' },
  set multiline(value) { return localStorage.multiline = value },

  get messages() { return JSON.parse(localStorage.messages || '[]') },
  set messages(value) { localStorage.messages = JSON.stringify(value) },

  get channels() { return JSON.parse(localStorage.channels || '[]') },
  set channels(value) { localStorage.channels = JSON.stringify(value) },

  get blocked() { return JSON.parse(localStorage.blocked || '[]') },
  set blocked(value) { 
    localStorage.blocked = JSON.stringify(value) 
    if(window.logger) window.logger.setState({}) 
  },

  get muted() { return JSON.parse(localStorage.muted || '[]') },
  set muted(value) { localStorage.muted = JSON.stringify(value) },

  get pinnedAtTop() { return localStorage.pinnedAtTop === 'true' },
  set pinnedAtTop(value) { 
    localStorage.pinnedAtTop = value
    if(window.logger) window.logger.setState({})  
  },

}

export default Data