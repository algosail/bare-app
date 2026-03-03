#!/usr/bin/env node
import { command, summary, flag } from 'paparam'
import { start, dev, build } from './index.js'

// Meta flags:
const name = flag('--name|-n <name>', 'The application name')
const author = flag('--author <name>', 'The name of the application author')
const description = flag(
  '--description <text>',
  'The description of the application',
)
const icon = flag('--icon|-i <path>', 'The application icon')
const identifier = flag(
  '--identifier <id>',
  'The unique application identifier',
)

// Source config flags:
const app = flag('--app <path>', 'Path to app script').default('bare/index.js')
const client = flag('--client <path>', 'Path to client script').default(
  'client/index.js',
)
const out = flag('--out <path>', 'Directory to output apps').default('.distr')
const template = flag('--template <path>', 'Path to HTML template')

// Platform-specific flags:
const appleManifest = flag(
  '--apple-manifest <path>',
  'The apple application manifest (Info.plist)',
)
const androidManifest = flag(
  '--android-manifest <path>',
  'The android application manifest (AndroidManifest.xml)',
)
const windowsManifest = flag(
  '--windows-manifest <path>',
  'The windows application manifest (AppxManifest.xml)',
)
const androidResources = flag(
  '--android-resources <path>',
  'The android application resources',
)
const linuxCompatibility = flag(
  '--linux-compatibility <name>',
  'Apply compatibility patches',
).choices(['snap'])

const baseFlags = [
  name,
  author,
  description,
  icon,
  identifier,
  app,
  client,
  out,
  template,
  appleManifest,
  androidManifest,
  windowsManifest,
  androidResources,
  linuxCompatibility,
]

const startCmd = command(
  'start',
  summary('Build and run the app for the current or simulator platform'),
  flag(
    '--host <host>',
    'Target host platform (e.g. darwin-arm64, ios-arm64-simulator)',
  ),
  ...baseFlags,
  async (cmd) => {
    try {
      await start(cmd.flags)
    } catch (err) {
      console.error(err)
      process.exitCode = 1
    }
  },
)

const devCmd = command(
  'dev',
  summary('Start a dev server for the client and run the app with live reload'),
  ...baseFlags,
  async (cmd) => {
    try {
      await dev(cmd.flags)
    } catch (err) {
      console.error(err)
      process.exitCode = 1
    }
  },
)

const buildCmd = command(
  'build',
  summary('Build the app for selected host platforms'),
  flag(
    '--hosts <hosts>',
    'Comma-separated list of target host platforms',
  ).multiple(),
  ...baseFlags,
  flag('--package', 'Package the application for distribution'),
  flag('--sign', 'Sign the application'),
  flag('--identity <id>', 'The macOS signing identity'),
  flag('--application-identity <id>', 'The macOS application signing identity'),
  flag('--installer-identity <id>', 'The macOS installer signing identity'),
  flag('--keychain <name>', 'The macOS signing keychain'),
  flag('--entitlements <path>', 'The macOS signing entitlements'),
  flag('--hardened-runtime', 'Enable the macOS hardened runtime'),
  flag('--subject <id>', 'The Windows signing subject'),
  flag('--subject-name <name>', 'The Windows signing subject friendly name'),
  flag('--thumbprint <sha1>', 'The Windows signing subject thumbprint'),
  flag('--key <hash>', 'The GPG signing key'),
  flag('--keystore <path>', 'The Java-based keystore file'),
  flag(
    '--keystore-key <name>',
    'The name of the certificate to use from the keystore',
  ),
  flag('--keystore-password <password>', 'The password to the keystore file'),
  async (cmd) => {
    try {
      await build(cmd.flags)
    } catch (err) {
      console.error(err)
      process.exitCode = 1
    }
  },
)

const cmd = command(
  'bare-app',
  summary('A minimal cli for bare apps'),
  startCmd,
  devCmd,
  buildCmd,
)

cmd.parse()
