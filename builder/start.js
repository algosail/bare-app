import { clearView } from './client/clear.js'
import { buildClient } from './client/build.js'
import { buildApp } from './app/build.js'
import { runApp } from './app/run.js'

export const startApp = async (config) => {
  console.log(`Starting app for host: ${config.host}`)

  console.log('Clearing view...')
  await clearView(config)

  console.log('Building client...')
  await buildClient(config)

  await buildApp(config)
  console.log('Build complete!')

  const app = runApp(config, config.host)
  console.log('App started!')

  const close = () => {
    app?.kill()
  }

  process.on('SIGINT', () => {
    close()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    close()
    process.exit(0)
  })
}
