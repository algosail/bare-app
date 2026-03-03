import * as esbuild from 'esbuild'
import { OUT_DIR } from './constants.js'
import { getTemplate } from './getTemplate.js'
import { esbuildConfig } from '../esbuild/esbuildConfig.js'

export const serveClient = async (config, plugins = []) => {
  const { name, client, template } = config
  const templateContent = await getTemplate(name, template)

  const ctx = await esbuild.context(
    esbuildConfig({
      entry: client,
      outdir: OUT_DIR,
      liveReload: true,
      plugins,
      template: templateContent,
    }),
  )

  const server = await ctx.serve({ servedir: OUT_DIR })
  await ctx.watch()

  return { server, ctx }
}
