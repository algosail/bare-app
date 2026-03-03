import { startApp } from './builder/start.js'
import { startDev } from './builder/dev.js'
import { startBuild } from './builder/build.js'
import {
  mergeStartConfig,
  mergeDevConfig,
  mergeBuildConfig,
} from './builder/config/merge.js'

export const start = async (params) => {
  const config = await mergeStartConfig(params)
  await startApp(config)
}

export const dev = async (params) => {
  const config = await mergeDevConfig(params)
  await startDev(config)
}

export const build = async (params) => {
  const config = await mergeBuildConfig(params)
  await startBuild(config)
}
