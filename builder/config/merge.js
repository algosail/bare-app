import path from 'path'
import fs from 'fs/promises'

const getPkg = async () => {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json')
    const content = await fs.readFile(pkgPath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Failed to load package.json:', error)
    return {}
  }
}

const getEnv = async () => {
  try {
    const envPath = path.join(process.cwd(), '.env')
    const content = await fs.readFile(envPath, 'utf8')
    return Object.fromEntries(
      content
        .split('\n')
        .filter((line) => line && !line.startsWith('#'))
        .map((line) => {
          const eq = line.indexOf('=')
          return [line.slice(0, eq), line.slice(eq + 1)]
        })
        .filter(([key]) => key.trim())
        .map(([key, val = '']) => [
          key.trim(),
          val.trim().replace(/^["']|["']$/g, ''),
        ]),
    )
  } catch {
    return {}
  }
}

export const getCurrentHost = () => {
  return `${process.platform}-${process.arch}`
}

const getPkgConfig = async () => {
  const pkg = await getPkg()
  return { pkg, config: pkg.bare || {} }
}

const getBaseOptions = (pkg, config, params) => ({
  version: pkg.version || '1.0.0',
  name: params.name || config.name || pkg.name || 'App',
  author: params.author || config.author || pkg.author,
  description: params.description || config.description || pkg.description,
  identifier: params.identifier || config.identifier,
  app: params.app || config.app || 'bare/index.js',
  client: params.client || config.client || 'client/index.js',
  out: params.out || config.out || 'distr',
  template: params.template || config.template,
  appleManifest: params.appleManifest || config.appleManifest,
  androidManifest: params.androidManifest || config.androidManifest,
  windowsManifest: params.windowsManifest || config.windowsManifest,
  androidResources: params.androidResources || config.androidResources,
  linuxCompatibility: params.linuxCompatibility || config.linuxCompatibility,
})

export const mergeStartConfig = async (params) => {
  const { pkg, config } = await getPkgConfig()

  return {
    ...getBaseOptions(pkg, config, params),
    host: params.host || getCurrentHost(),
  }
}

export const mergeDevConfig = async (params) => {
  const { pkg, config } = await getPkgConfig()

  return {
    ...getBaseOptions(pkg, config, params),
    host: getCurrentHost(),
  }
}

export const mergeBuildConfig = async (params) => {
  const env = await getEnv()
  const { pkg, config } = await getPkgConfig()

  return {
    ...getBaseOptions(pkg, config, params),
    hosts: params.hosts || config.hosts || [],
    package: !!params.package,
    sign: !!params.sign,
    identity: params.identity || env.IDENTITY,
    applicationIdentity: params.applicationIdentity || env.APPLICATION_IDENTITY,
    installerIdentity: params.installerIdentity || env.INSTALLER_IDENTITY,
    keychain: params.keychain || env.KEYCHAIN,
    entitlements: params.entitlements || env.ENTITLEMENTS,
    hardenedRuntime: !!params.hardenedRuntime,
    subject: params.subject || env.SUBJECT,
    subjectName: params.subjectName || env.SUBJECT_NAME,
    thumbprint: params.thumbprint || env.THUMBPRINT,
    key: params.key || env.KEY,
    keystore: params.keystore || env.KEYSTORE,
    keystoreKey: params.keystoreKey || env.KEYSTORE_KEY,
    keystorePassword: params.keystorePassword || env.KEYSTORE_PASSWORD,
  }
}
