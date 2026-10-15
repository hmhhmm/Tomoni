/**
 * Shrinks a chosen photo to a small JPEG data URL so it fits in browser storage
 * (a few tens of KB instead of several MB). The original file never leaves the browser.
 * Throws if the browser cannot decode the format (for example HEIC on most desktop browsers).
 */
export async function downscale(file: File, max = 480): Promise<string> {
  const source = await decode(file)
  const w = 'naturalWidth' in source ? source.naturalWidth : source.width
  const h = 'naturalHeight' in source ? source.naturalHeight : source.height
  if (!w || !h) throw new Error('empty image')
  const scale = Math.min(1, max / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * scale)
  canvas.height = Math.round(h * scale)
  canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height)
  if ('close' in source) source.close()
  return canvas.toDataURL('image/jpeg', 0.8)
}

/** createImageBitmap where available, otherwise an <img> element. */
async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file)
  } catch {
    const url = URL.createObjectURL(file)
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      return img
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}
