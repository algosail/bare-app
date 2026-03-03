import fs from 'fs/promises'

export const getTemplate = async (name, templatePath) => {
  if (!templatePath) {
    const defaultPath = new URL('./template.html', import.meta.url)
    const template = await fs.readFile(defaultPath, 'utf8')
    return template.replace('{name}', name)
  }

  const template = await fs.readFile(templatePath, 'utf8')
  return template.replace('{name}', name)
}
