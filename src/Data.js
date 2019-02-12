export const Data = {
  get name() { return localStorage.getItem('name') || 'Gossipr' },
  set name(value) { localStorage.setItem('name', value) },

  get avatar() { return localStorage.getItem('avatar') || '' },
  set avatar(hash) { 
    localStorage.setItem('avatar', hash) 
    window.drawer.setState({})
  },

  get theme() { return localStorage.getItem('theme') || "light" },

  get channel() { return localStorage.getItem("channel") || "" },
  set channel(value) { 
    localStorage.setItem("channel", value) 
    if(window.location.hash !== value) window.location.hash = value
  },

  get blocked() { return JSON.parse(localStorage.getItem("blocked")) || [] },
  set blocked(value) { 
    localStorage.setItem('blocked', JSON.stringify(value)) 
    if(window.logger) window.logger.setState({}) 
  },

  get pinnedAtTop() { return localStorage.getItem('pinnedAtTop') === 'true' },
  set pinnedAtTop(value) { 
    localStorage.setItem('pinnedAtTop', value) 
    if(window.logger) window.logger.setState({pinnedAtTop: value})  
  },

  meta: (type) => ({ type, name: Data.name, time: new Date().getTime(), avatar: Data.avatar })
}

export default Data