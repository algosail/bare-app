import * as esbuild from 'esbuild'
import { OUT_DIR } from './constants.js'
import { getTemplate } from './getTemplate.js'
import { esbuildConfig } from '../esbuild/esbuildConfig.js'

export const buildClient = async (config, plugins = []) => {
  const { name, client, template } = config
  const templateContent = await getTemplate(name, template)

  await esbuild.build(
    esbuildConfig({
      entry: client,
      outdir: OUT_DIR,
      liveReload: false,
      plugins,
      template: templateContent,
    }),
  )
}
