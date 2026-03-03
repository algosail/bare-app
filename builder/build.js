import { clearView } from './client/clear.js'
import { buildClient } from './client/build.js'
import { buildApp } from './app/build.js'

export const startBuild = async (config) => {
  console.log('Clearing view...')
  await clearView(config)

  console.log('Building client...')
  await buildClient(config)

  for (const host of config.hosts) {
    await buildApp({ ...config, host })
  }

  console.log('Build complete!')
}
