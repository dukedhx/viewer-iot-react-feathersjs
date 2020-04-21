import io from 'socket.io-client'
import feathers from '@feathersjs/client'
import { createContext } from 'react'

const socket = io(
  process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:3030'
)
const client = feathers()

client.configure(feathers.socketio(socket))
client.configure(
  feathers.authentication({
    storage: window.localStorage,
  })
)

const subscriptionManager = {}

const unSubscribe = (key) => delete subscriptionManager[key]

client.service('messages').on('created', (message) => {
  subscriptionManager.defaultData = Object.assign({}, message.data)
  Object.keys(message.data).forEach((key) => {
    const subscription = subscriptionManager[key]
    if (subscription) {
      subscription.data = message.data[key]
      const result = subscription.handler.next()
      if (result.done) unSubscribe(key)
      else if (result.value) message.data[key] = null
    }
  })
  subscriptionManager.defaultHandler &&
    subscriptionManager.defaultHandler.next()
})

export default createContext({
  subscriptionManager,
  subscribe: (key, handler) =>
    (subscriptionManager[key] = { data: null, handler }),
  unSubscribe,
})
