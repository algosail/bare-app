import fs from 'fs/promises'
import path from 'path'
import { parse } from 'node-html-parser'

export const htmlPlugin = (opts = {}) => ({
  name: 'html',
  setup(build) {
    const { liveReload = false, template } = opts
    const outdir = path.resolve(build.initialOptions.outdir)

    build.initialOptions.metafile = true

    build.onEnd(async (result) => {
      await fs.mkdir(outdir, { recursive: true })

      const root = parse(template)

      const outputs = result.metafile?.outputs ?? {}
      const head = root.querySelector('head')
      const body = root.querySelector('body')

      if (!head)
        throw new Error('htmlPlugin: template is missing a <head> element')
      if (!body)
        throw new Error('htmlPlugin: template is missing a <body> element')

      // Inject <link> for every CSS output.
      for (const [file] of Object.entries(outputs)) {
        if (!file.endsWith('.css')) continue
        const rel = path.relative(outdir, path.resolve(file))
        head.insertAdjacentHTML(
          'beforeend',
          `\n    <link rel="stylesheet" href="./${rel}">`,
        )
      }

      // Inject <script type="module"> only for JS entry points (not chunks).
      for (const [file, meta] of Object.entries(outputs)) {
        if (!file.endsWith('.js')) continue
        if (meta.entryPoint === undefined) continue
        const rel = path.relative(outdir, path.resolve(file))
        body.insertAdjacentHTML(
          'beforeend',
          `\n    <script type="module" src="./${rel}"></script>`,
        )
      }

      if (liveReload) {
        body.insertAdjacentHTML(
          'beforeend',
          `\n    <script>new EventSource('/esbuild').addEventListener('change', () => location.reload())</script>`,
        )
      }

      // Write HTML to outdir.
      const htmlDest = path.join(outdir, 'index.html')
      await fs.writeFile(htmlDest, root.toString())

      // Add HTML to metafile so it appears in _viewMap.
      result.metafile.outputs[htmlDest] = { inputs: {}, bytes: 0 }
    })
  },
})
