import path from 'path'
import fs from 'fs/promises'
import { mimeType } from './mime.js'

export const createViewMap = (files, outdir) => {
  const entries = files
    .map((name) => {
      const rel = outdir ? path.relative(outdir, name) : name
      return `  '${rel}': { path: import.meta.asset('./${rel}'), type: '${mimeType(rel)}' }`
    })
    .join(',\n')

  return `export default {\n${entries},\n}\n`
}

const createAppShim = () => `\
// GENERATED — do not edit
import viewMap from './_viewMap.js'
import { init } from '@algosail/bare-app/runtime'

const isDev = Bare.argv.includes('--dev')
const devHost = Bare.argv.find((a) => a.startsWith('--host '))?.split(' ')[1]
const devPort = Bare.argv.find((a) => a.startsWith('--port '))?.split(' ')[1]
const devURL = isDev && devHost && devPort ? \`http://\${devHost}:\${devPort}\` : null

export const { connect, close } = await init({ viewMap, dev: isDev, devURL })
`

export const viewMapPlugin = () => ({
  name: 'view-map',
  setup(build) {
    const outdir = build.initialOptions.outdir

    build.onEnd(async (result) => {
      const outputFiles = Object.keys(result.metafile?.outputs ?? {})

      await Promise.all([
        fs.writeFile(
          path.join(outdir, '_viewMap.js'),
          createViewMap(outputFiles, outdir),
        ),
        fs.writeFile(path.join(outdir, '_app.js'), createAppShim()),
      ])
    })
  },
})
