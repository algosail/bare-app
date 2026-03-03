import fs from 'fs/promises'
import { OUT_DIR } from './constants.js'

export const clearView = async () => {
  await fs.rm(OUT_DIR, { recursive: true, force: true })
}
