import Node from './Node'

const Data = {
  get name() { return localStorage.name || 'Gossipr' },
  set name(value) { localStorage.name = value },

  get avatar() { return localStorage.avatar || '' },
  set avatar(hash) { (async () => {
    localStorage.avatar = hash
    if(hash) await Node.loadAvatar(hash)
    window.drawer.setState({})
  })() },

  get theme() { return localStorage.theme || "light" },

  get channel() { return localStorage.channel || "" },
  set channel(value) { 
    localStorage.channel = value 
    if(window.location.hash !== value) window.location.hash = value
  },

  get messages() { return JSON.parse(localStorage.messages) || [] },
  set messages(value) { localStorage.messages = JSON.stringify(value) },

  get channels() { return JSON.parse(localStorage.channels) || [] },
  set channels(value) { localStorage.channels = JSON.stringify(value) },

  get blocked() { return JSON.parse(localStorage.blocked) || [] },
  set blocked(value) { 
    localStorage.blocked =  JSON.stringify(value) 
    if(window.logger) window.logger.setState({}) 
  },

  get pinnedAtTop() { return localStorage.pinnedAtTop === 'true' },
  set pinnedAtTop(value) { 
    localStorage.pinnedAtTop = value
    if(window.logger) window.logger.setState({pinnedAtTop: value})  
  },

}

export default Data