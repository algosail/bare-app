import build from 'bare-build'
import { clearApp } from './clear.js'

const getManifest = (config) => {
  switch (config.host) {
    case 'darwin-arm64':
    case 'darwin-x64':
    case 'ios-arm64':
    case 'ios-arm64-simulator':
    case 'ios-x64-simulator':
      return config.appleManifest
    case 'android-arm64':
    case 'android-arm':
    case 'android-ia32':
    case 'android-x64':
      return config.androidManifest
    case 'win32-arm64':
    case 'win32-x64':
      return config.windowsManifest
    default:
      return undefined
  }
}

const getResources = (config) => {
  switch (config.host) {
    case 'android-arm64':
    case 'android-arm':
    case 'android-ia32':
    case 'android-x64':
      return config.androidResources
    default:
      return undefined
  }
}

const getCompatibility = (config) => {
  switch (config.host) {
    case 'linux-arm64':
    case 'linux-x64':
      return config.linuxCompatibility
    default:
      return undefined
  }
}

export const buildApp = async (config) => {
  const { app, out, host } = config

  console.log(`Building for host: ${host}`)
  await clearApp(config, host)

  const opts = {
    ...config,
    manifest: getManifest(config),
    resources: getResources(config),
    compatibility: getCompatibility(config),
    out: `${out}/by-arch/${host}/app`,
    hosts: [host],
    runtime: 'bare-native/runtime',
  }

  for await (const resource of build(app, opts)) {
    console.log(resource)
  }

  console.log(`Build completed for host: ${host}`)
}
