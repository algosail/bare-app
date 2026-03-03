import fs from 'fs/promises'

export const clearApp = async (config, host) => {
  await fs.rm(`${config.out}/by-arch/${host}`, { recursive: true, force: true })
}
