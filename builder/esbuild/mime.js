import path from 'path'

const MIME_TYPES = {
  // Images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  avif: 'image/avif',
  // Fonts
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  eot: 'application/vnd.ms-fontobject',
  // Media
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'audio/ogg',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  // Web
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  // Other
  pdf: 'application/pdf',
  wasm: 'application/wasm',
}

export const mimeType = (filename) => {
  const ext = path.extname(filename).slice(1).toLowerCase()
  return MIME_TYPES[ext] ?? 'application/octet-stream'
}
