# bare-app

> **Experimental.** This package is not production-ready and has not been thoroughly tested. APIs may change without notice. Use at your own risk.

Toolkit for building native desktop applications with a [Bare](https://github.com/holepunchto/bare) backend and a web-based UI.

## Install

```
npm install @algosail/bare-app
```

> **Note:** Install as a regular dependency, not `devDependency`. `bare-build` traverses `dependencies` to discover native addons to link into the app bundle — if `@algosail/bare-app` is in `devDependencies`, its transitive native addons (e.g. `bare-dns`) will be missing from the built app.

## Project structure

```
my-app/
  bare/
    index.js       # Bare app — backend, native code
  client/
    index.js       # Client — runs in the WebView
    index.html     # HTML template (optional)
  .env             # Signing credentials (optional, not committed)
  package.json
```

Generated at build time:

```
my-app/
  .view/           # Ephemeral — rebuilt on every dev/start/build
    index.html
    _app.js
    _viewMap.js
    assets/
    css/
    js/
  distr/           # Default output directory for builds
    by-arch/
      darwin-arm64/
      darwin-x64/
      linux-x64/
      win32-x64/
      ...
```

## Setup

Add to `package.json`:

```json
{
  "imports": {
    "#app": { "default": "./.view/_app.js" }
  },
  "scripts": {
    "dev": "bare-app dev",
    "start": "bare-app start",
    "build": "bare-app build --hosts darwin-arm64,darwin-x64"
  },
  "bare": {
    "name": "MyApp",
    "identifier": "com.example.myapp",
    "hosts": ["darwin-arm64", "darwin-x64"]
  }
}
```

## Writing the app

### `bare/index.js` — runs in Bare, handles business logic

```js
import RPC from 'bare-rpc'
import { connect } from '#app'

connect((socket) => {
  const rpc = new RPC(socket, (req) => {
    req.reply('hello from bare')
  })
})
```

`connect(cb)` is called once per client connection. The `socket` argument is a `bare-ws` stream compatible with `bare-rpc` and other stream-based protocols.

### `client/index.js` — runs in the WebView, handles UI

```js
import RPC from 'bare-rpc'
import { connect } from '#app-client'

const socket = connect()
const rpc = new RPC(socket)
```

`connect()` returns a socket wrapping a WebSocket IPC channel. Both sides expose the same stream-like interface.

#### Client socket API

| Method                   | Description                          |
| ------------------------ | ------------------------------------ |
| `socket.on(event, fn)`   | Register an event listener           |
| `socket.once(event, fn)` | Register a single-use event listener |
| `socket.off(event, fn)`  | Remove an event listener             |
| `socket.write(data)`     | Send binary data                     |
| `socket.destroy([err])`  | Close the connection                 |

| Event   | Payload  | Description            |
| ------- | -------- | ---------------------- |
| `open`  | —        | Connection established |
| `data`  | `Buffer` | Data received          |
| `close` | —        | Connection closed      |
| `error` | `Error`  | Connection error       |

## CLI

### `bare-app dev`

Starts an esbuild dev server for the client with live reload, then builds and runs the Bare app. The Bare process is passed `--dev`, `--host`, and `--port` so the generated `_app.js` shim can connect to the dev server. When `bare/` files change you are prompted to restart the backend.

### `bare-app start`

Builds the client, builds the native app for the current platform (or a simulator target with `--host`), and launches it.

### `bare-app build`

Builds the client once, then builds native apps for every host listed in `--hosts` or in the `bare.hosts` field of `package.json`.

```
bare-app build --hosts darwin-arm64,darwin-x64,linux-x64
```

---

### Base flags (all commands)

These flags override the corresponding fields in `package.json` `bare` config.

| Flag                           | Default                      | Description                                              |
| ------------------------------ | ---------------------------- | -------------------------------------------------------- |
| `--name, -n <name>`            | `package.json` `name`        | Application display name                                 |
| `--author <name>`              | `package.json` `author`      | Author name                                              |
| `--description <text>`         | `package.json` `description` | Application description                                  |
| `--icon, -i <path>`            | —                            | Path to application icon image                           |
| `--identifier <id>`            | —                            | Unique application identifier (e.g. `com.example.myapp`) |
| `--app <path>`                 | `bare/index.js`              | Path to the Bare entry script                            |
| `--client <path>`              | `client/index.js`            | Path to the client entry script                          |
| `--out <path>`                 | `distr`                      | Output directory for built apps                          |
| `--template <path>`            | —                            | Custom HTML template file                                |
| `--apple-manifest <path>`      | —                            | Apple `Info.plist` override                              |
| `--android-manifest <path>`    | —                            | Android `AndroidManifest.xml` override                   |
| `--windows-manifest <path>`    | —                            | Windows `AppxManifest.xml` override                      |
| `--android-resources <path>`   | —                            | Android resources directory                              |
| `--linux-compatibility <name>` | —                            | Compatibility patches (`snap`)                           |

### `start`-only flags

| Flag            | Description                                                                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| `--host <host>` | Target host platform. Defaults to the current machine. Pass `ios-arm64-simulator` to run on the iOS simulator. |

### `build`-only flags

| Flag              | Description                                   |
| ----------------- | --------------------------------------------- |
| `--hosts <hosts>` | Comma-separated list of target host platforms |
| `--package`       | Package the application for distribution      |
| `--sign`          | Sign the application                          |

#### macOS signing

| Flag                          | `.env` variable        | Description                           |
| ----------------------------- | ---------------------- | ------------------------------------- |
| `--identity <id>`             | `IDENTITY`             | General signing identity              |
| `--application-identity <id>` | `APPLICATION_IDENTITY` | Application-specific signing identity |
| `--installer-identity <id>`   | `INSTALLER_IDENTITY`   | Installer signing identity            |
| `--keychain <name>`           | `KEYCHAIN`             | Keychain to use for signing           |
| `--entitlements <path>`       | `ENTITLEMENTS`         | Path to entitlements `.plist` file    |
| `--hardened-runtime`          | —                      | Enable macOS hardened runtime         |

#### Windows signing

| Flag                    | `.env` variable | Description                       |
| ----------------------- | --------------- | --------------------------------- |
| `--subject <id>`        | `SUBJECT`       | Certificate subject               |
| `--subject-name <name>` | `SUBJECT_NAME`  | Certificate subject friendly name |
| `--thumbprint <sha1>`   | `THUMBPRINT`    | Certificate SHA-1 thumbprint      |

#### Android signing

| Flag                             | `.env` variable     | Description                          |
| -------------------------------- | ------------------- | ------------------------------------ |
| `--keystore <path>`              | `KEYSTORE`          | Java keystore file                   |
| `--keystore-key <name>`          | `KEYSTORE_KEY`      | Certificate name within the keystore |
| `--keystore-password <password>` | `KEYSTORE_PASSWORD` | Keystore password                    |

#### Linux signing

| Flag           | `.env` variable | Description          |
| -------------- | --------------- | -------------------- |
| `--key <hash>` | `KEY`           | GPG signing key hash |

---

## `package.json` `bare` config

All fields are optional. CLI flags take precedence over this config; missing values fall back to the top-level `package.json` fields (`name`, `author`, `description`, `version`).

```json
{
  "bare": {
    "name": "MyApp",
    "author": "Alice",
    "description": "My application",
    "identifier": "com.example.myapp",
    "app": "bare/index.js",
    "client": "client/index.js",
    "out": "distr",
    "template": "client/index.html",
    "appleManifest": "assets/Info.plist",
    "androidManifest": "assets/AndroidManifest.xml",
    "windowsManifest": "assets/AppxManifest.xml",
    "androidResources": "assets/android-res",
    "linuxCompatibility": "snap",
    "hosts": ["darwin-arm64", "darwin-x64", "linux-x64", "win32-x64"]
  }
}
```

| Field                | Type       | Default                      | Description                                        |
| -------------------- | ---------- | ---------------------------- | -------------------------------------------------- |
| `name`               | `string`   | `package.json` `name`        | Application display name                           |
| `author`             | `string`   | `package.json` `author`      | Author name                                        |
| `description`        | `string`   | `package.json` `description` | Application description                            |
| `identifier`         | `string`   | —                            | Unique reverse-DNS application identifier          |
| `app`                | `string`   | `"bare/index.js"`            | Path to the Bare entry script                      |
| `client`             | `string`   | `"client/index.js"`          | Path to the client entry script                    |
| `out`                | `string`   | `"distr"`                    | Directory where built apps are written             |
| `template`           | `string`   | —                            | Path to a custom HTML template                     |
| `appleManifest`      | `string`   | —                            | Path to a custom `Info.plist`                      |
| `androidManifest`    | `string`   | —                            | Path to a custom `AndroidManifest.xml`             |
| `windowsManifest`    | `string`   | —                            | Path to a custom `AppxManifest.xml`                |
| `androidResources`   | `string`   | —                            | Path to an Android resources directory             |
| `linuxCompatibility` | `"snap"`   | —                            | Apply Linux compatibility patches                  |
| `hosts`              | `string[]` | `[]`                         | Default list of build targets for `bare-app build` |

---

## Signing credentials via `.env`

Signing flags can be stored in a `.env` file at the project root instead of passing them on the command line. CLI flags take priority over `.env` values.

```ini
# macOS
IDENTITY=Developer ID Application: Alice Example (XXXXXXXXXX)
APPLICATION_IDENTITY=3rd Party Mac Developer Application: Alice Example
INSTALLER_IDENTITY=3rd Party Mac Developer Installer: Alice Example
KEYCHAIN=login.keychain
ENTITLEMENTS=entitlements.plist

# Windows
SUBJECT=CN=Example, O=Example Inc, C=US
SUBJECT_NAME=Example Inc
THUMBPRINT=AABBCCDDEEFF...

# Android
KEYSTORE=release.keystore
KEYSTORE_KEY=alias
KEYSTORE_PASSWORD=s3cret

# Linux
KEY=ABCDEF1234567890
```

---

## Supported host platforms

| Host                  | Platform                           |
| --------------------- | ---------------------------------- |
| `darwin-arm64`        | macOS Apple Silicon                |
| `darwin-x64`          | macOS Intel                        |
| `ios-arm64`           | iOS device                         |
| `ios-arm64-simulator` | iOS simulator (Apple Silicon host) |
| `ios-x64-simulator`   | iOS simulator (Intel host)         |
| `android-arm64`       | Android ARM 64-bit                 |
| `android-arm`         | Android ARM 32-bit                 |
| `android-x64`         | Android x86-64                     |
| `android-ia32`        | Android x86                        |
| `win32-arm64`         | Windows ARM 64-bit                 |
| `win32-x64`           | Windows x86-64                     |
| `linux-arm64`         | Linux ARM 64-bit                   |
| `linux-x64`           | Linux x86-64                       |

---

## How it works

1. **Client bundle** — `buildClient()` uses esbuild to bundle `client/index.js` (and any imported CSS/assets) into `.view/`. It generates:
   - `.view/index.html` — HTML with injected `<script>` and `<link>` tags
   - `.view/_viewMap.js` — a map of asset paths and MIME types
   - `.view/_app.js` — a shim that imports `_viewMap.js`, calls `init({ viewMap, ... })` from `bare-app/runtime`, and re-exports `connect` and `close`

2. **Native app** — `buildApp()` calls `bare-build` with the platform-specific manifest, resources, and compatibility options to produce a native executable under `out/by-arch/<host>/`.

3. **IPC** — at runtime, `bare-app/runtime` starts a WebSocket server on `localhost:8080`. The WebView loads the bundled HTML and connects back over WebSocket. `#app` (`.view/_app.js`) exposes `connect(cb)` on the Bare side; `bare-app/client` exposes `connect()` on the WebView side. Both return a stream compatible with `bare-rpc` and similar libraries.

4. **Dev mode** — instead of serving from `.view/`, the WebView loads the esbuild dev server URL directly. The backend is rebuilt and relaunched on demand.

The `.view/` directory is ephemeral and should be added to `.gitignore`.
