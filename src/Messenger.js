import Data from './Data'

export const register = async () => {
  window.reg = await navigator.serviceWorker.ready
  console.log('Successfully connected to service worker')
}

export const post = (type, data) => {
  const controller = navigator.serviceWorker.controller
  if(controller) controller.postMessage({type, data})
}

export const notify = async (channel, body) => {
  if(!window.reg) return
  window.reg.showNotification(channel, { body, icon: 'favicon.ico'})
}
