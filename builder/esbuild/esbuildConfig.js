import path from 'path'
import { htmlPlugin } from './htmlPlugin.js'
import { viewMapPlugin } from './viewMapPlugin.js'

export const esbuildConfig = (opts) => {
  const { entry, outdir, liveReload = false, template, plugins } = opts

  return {
    entryPoints: [entry],
    outdir,
    outbase: path.dirname(path.resolve(entry)),
    bundle: true,
    target: ['esnext'],
    assetNames: 'assets/[name]',
    chunkNames: '[ext]/[name]',
    loader: {
      '.otf': 'file',
      '.ttf': 'file',
      '.woff': 'file',
      '.woff2': 'file',
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.svg': 'file',
      '.gif': 'file',
    },
    plugins: [
      htmlPlugin({ template, liveReload }),
      viewMapPlugin(),
      ...plugins,
    ],
  }
}
