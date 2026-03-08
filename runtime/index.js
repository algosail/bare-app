import ws from 'bare-ws'
import Console from 'bare-console'
import { Window, WebView } from 'bare-native'
import { startViewServer } from './viewServer.js'

const console = new Console()

const startIcpServer = () =>
  new Promise((resolve) => {
    const icp = new ws.Server({ port: 0 })
    icp.on('listening', () => resolve(icp))
  })

export const init = async (opts = {}) => {
  const {
    width = 800,
    height = 600,
    viewMap,
    dev = false,
    devURL = null,
  } = opts

  // IPC WebSocket server — bridges Bare and the WebView
  const icp = await startIcpServer()
  const icpPort = icp.address().port
  const sockets = new Set()

  console.log(`IPC server started on ws://localhost:${icpPort}`)

  icp.on('connection', (socket) => {
    sockets.add(socket)
    socket.on('close', () => sockets.delete(socket))
  })

  const connect = (cb) => {
    icp.on('connection', (socket) => {
      console.log('Client connected to IPC server')
      cb(socket)
    })
  }

  // Native window + WebView
  const window = new Window(width, height)
  const webView = new WebView()
  window.content(webView)
  webView.inspectable(dev)

  // HTTP server that serves the bundled client assets (production only)
  let viewServer = null
  if (dev && devURL) {
    console.log(`Loading dev server at ${devURL}...`)
    webView.loadURL(`${devURL}?icp=${icpPort}`)
  } else {
    viewServer = await startViewServer(viewMap)
    const address = viewServer.address()
    console.log(`View server address:`, address)
    webView.loadURL(`http://localhost:${address.port}?icp=${icpPort}`)
  }

  const close = () => {
    for (const socket of sockets) socket.destroy()
    icp.close()
    if (viewServer) viewServer.close()
  }

  Bare.on('teardown', close)

  return { window, connect, close }
}
