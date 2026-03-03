import { clearView } from './client/clear.js'
import { serveClient } from './client/serve.js'
import { watchApp } from './app/watch.js'

export const startDev = async (config) => {
  console.log('Clearing view...')
  await clearView(config)

  console.log('Starting development server...')
  const { server, ctx } = await serveClient(config, [])
  console.log('Development server started!')

  const { watcher, kill } = await watchApp(config, [
    `--dev`,
    `--host ${server.hosts[0]}`,
    `--port ${server.port}`,
  ])

  console.log(`App started in dev mode for host: ${config.host}`)
  console.log(
    `Watching client for host: http://${server.hosts[0]}:${server.port}`,
  )

  const close = async () => {
    console.log('Shutting down...')
    kill()
    watcher.close()
    await ctx.dispose()
  }

  process.on('SIGINT', async () => {
    await close()
    process.exit(0)
  })
  process.on('SIGTERM', async () => {
    await close()
    process.exit(0)
  })
}
