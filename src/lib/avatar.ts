import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '../firebase'

// Beskär till en kvadrat och skala ner, så att bilden blir liten och snabb att ladda
export const resizeToSquare = (file: File, size = 256): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('canvas'))
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('blob'))), 'image/jpeg', 0.86)
    }
    img.onerror = () => (URL.revokeObjectURL(url), reject(new Error('image')))
    img.src = url
  })

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })

// Med Firebase Storage laddas bilden upp dit. Utan Firebase sparas den som en liten data-URL.
export const uploadAvatar = async (personId: string, blob: Blob): Promise<string> => {
  if (!storage) return toDataUrl(blob)
  const r = ref(storage, `avatars/${personId}.jpg`)
  await uploadBytes(r, blob, { contentType: 'image/jpeg' })
  return getDownloadURL(r)
}
