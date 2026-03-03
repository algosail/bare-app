interface BaseOptions {
  version?: string
  name: string
  author?: string
  description?: string
  identifier?: string
  icon?: string
  app: string
  client: string
  out: string
  template?: string
  appleManifest?: string
  androidManifest?: string
  windowsManifest?: string
  androidResources?: string
  linuxCompatibility?: string
}

export interface StartOptions extends BaseOptions {
  host: string
}

export interface DevOptions extends BaseOptions {}

export interface BuildOptions extends BaseOptions {
  hosts: string[]
  package: boolean
  sign: boolean
  identity?: string
  applicationIdentity?: string
  installerIdentity?: string
  keychain?: string
  entitlements?: string
  hardenedRuntime?: boolean
  subject?: string
  subjectName?: string
  thumbprint?: string
  key?: string
  keystore?: string
  keystoreKey?: string
  keystorePassword?: string
}

export declare const start: (params: Partial<StartOptions>) => Promise<void>
export declare const dev: (params: Partial<DevOptions>) => Promise<void>
export declare const build: (params: Partial<BuildOptions>) => Promise<void>
