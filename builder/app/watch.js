import { watch } from 'fs'
import readline from 'readline'

import { buildApp } from './build.js'
import { runApp } from './run.js'

const askConfirm = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question(question, (answer) => {
      rl.close()
      const trimmed = answer.trim().toLowerCase()
      resolve(trimmed === '' || trimmed === 'y' || trimmed === 'yes')
    })
  })

export const watchApp = async (config, args) => {
  const { app } = config

  await buildApp(config)

  let appInstance = runApp(config, config.host, args)
  let rebuildPending = false

  const watcher = watch(
    app,
    { recursive: true },
    async (_eventType, filename) => {
      if (filename?.includes('_view')) return
      if (rebuildPending) return
      rebuildPending = true

      console.log(`Application files changed`)
      const confirmed = await askConfirm(
        'Do you want to restart the application? [Enter/Y/N]: ',
      )

      if (confirmed) {
        console.log('Rebuilding native app...')
        appInstance?.kill()
        await buildApp(config)
        appInstance = runApp(config, config.host, args)
        console.log('App restarted!')
      }

      rebuildPending = false
    },
  )

  console.log(`Watching for changes in ${app}...`)

  return { watcher, kill: () => appInstance?.kill() }
}
