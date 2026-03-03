import { spawn } from 'child_process'

const getExePath = (config, host) => {
  switch (host) {
    case 'darwin-arm64':
    case 'darwin-x64':
      return `${config.out}/by-arch/${host}/app/${config.name}.app/Contents/MacOS/${config.name}`
    case 'win32-arm64':
    case 'win32-x64':
      return `${config.out}/by-arch/${host}/app/${config.name}/App/${config.name}.exe`
    case 'linux-arm64':
    case 'linux-x64':
      return `${config.out}/by-arch/${host}/app/${config.name}.AppDir/usr/bin/${config.name}`
    default:
      return null
  }
}

export const runApp = (config, host, params = []) => {
  if (host === 'ios-arm64-simulator') {
    const appPath = `${config.out}/by-arch/ios-arm64-simulator/app/${config.name}.app`
    const args = ['simctl', 'install', 'booted', appPath]
    const app = spawn('xcrun', args, { stdio: 'inherit' })
    app.on('error', (err) =>
      console.error('Failed to install app on simulator:', err),
    )
    return app
  }

  const appPath = getExePath(config, host)
  if (!appPath) {
    console.error(`runApp: no executable path for host "${host}"`)
    return null
  }

  const app = spawn(appPath, params, { stdio: 'inherit' })
  app.on('error', (err) => console.error('Failed to start app:', err))
  return app
}
