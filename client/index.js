import b4a from 'b4a'

const WS_PORT = 8080

export const connect = () => {
  const url = `ws://localhost:${WS_PORT}`
  const handlers = {}

  function on(name, fn) {
    ;(handlers[name] ??= []).push(fn)
    return socket
  }
  function once(name, fn) {
    const w = (...a) => {
      off(name, w)
      fn(...a)
    }
    return on(name, w)
  }
  function off(name, fn) {
    handlers[name] = (handlers[name] || []).filter((f) => f !== fn)
    return socket
  }
  function emit(name, ...args) {
    for (const fn of [...(handlers[name] || [])]) fn(...args)
  }

  const ws = new WebSocket(url)
  ws.binaryType = 'arraybuffer'
  ws.onopen = () => emit('open')
  ws.onmessage = (e) => emit('data', b4a.from(e.data))
  ws.onclose = () => emit('close')
  ws.onerror = () => emit('error', new Error('WebSocket error'))

  const socket = {
    on,
    once,
    off,
    write(data) {
      ws.send(data)
      return true
    },
    destroy(err) {
      ws.onclose = null
      ws.close()
      if (err) emit('error', err)
      emit('close')
    },
  }

  return socket
}
