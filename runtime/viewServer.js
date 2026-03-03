import http from 'bare-http1'
import url from 'bare-url'
import fs from 'bare-fs/promises'

export const startViewServer = async (viewMap, port = 0) => {
  const server = http.createServer(async (req, res) => {
    const route = req.url.split('?')[0]

    const file = viewMap[route === '/' ? 'index.html' : route.slice(1)]

    if (!file) {
      res.writeHead(404)
      res.end()
      return
    }

    try {
      const path = url.fileURLToPath(file.path)
      const data = await fs.readFile(path)
      res.writeHead(200, { 'Content-Type': file.type })
      res.end(data)
    } catch {
      res.writeHead(404)
      res.end()
    }
  })

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server))
  })
}
