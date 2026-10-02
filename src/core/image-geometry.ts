export interface PhotoSize { width: number; height: number }
export interface PhotoPoint { x: number; y: number }
export interface PhotoGeometry {
  left: number; top: number; width: number; height: number
  image: { left: number; top: number; width: number; height: number }
  radius: number
  inset: [number, number, number, number]
}

export const touchImageQuery = '(any-pointer: coarse)'
export const isTouchImageDevice = () => typeof window !== 'undefined' &&
  (window.navigator.maxTouchPoints > 0 || (window.matchMedia?.(touchImageQuery).matches ?? false))
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function fitPhoto(photo: PhotoSize, viewport: PhotoSize): PhotoSize {
  if (!photo.width || !photo.height) return { width: 0, height: 0 }
  const scale = Math.min(viewport.width / photo.width, viewport.height / photo.height)
  return { width: photo.width * scale, height: photo.height * scale }
}

// An axis smaller than the viewport stays centered; a larger one must cover it.
export function boundPhoto(point: PhotoPoint, photo: PhotoSize, viewport: PhotoSize, scale: number, elastic = false): PhotoPoint {
  const bound = (value: number, extent: number) => {
    const limit = Math.max(0, extent) / 2
    const bounded = clamp(value, -limit, limit)
    const excess = value - bounded
    return elastic ? bounded + Math.sign(excess) * 64 * (1 - Math.exp(-Math.abs(excess) / 320)) : bounded
  }
  return { x: bound(point.x, photo.width * scale - viewport.width), y: bound(point.y, photo.height * scale - viewport.height) }
}

const position = (value: string, free: number) => {
  const keywords: Record<string, number> = { left: 0, top: 0, center: .5, right: 1, bottom: 1 }
  return value in keywords ? free * keywords[value] : value.endsWith('%') ? free * (parseFloat(value) || 0) / 100 : parseFloat(value) || 0
}

// Keep the image's aspect ratio and its cover crop, including clipping by a scroll box.
export function thumbnailGeometry(image: HTMLImageElement, panel: DOMRect): PhotoGeometry | null {
  const rect = image.getBoundingClientRect()
  if (!rect.width || !rect.height || !image.naturalWidth || !image.naturalHeight) return null
  const view = image.ownerDocument.defaultView!
  const style = view.getComputedStyle(image)
  const contain = style.objectFit === 'contain' || style.objectFit === 'scale-down'
  const ratio = contain ? Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight) : Math.max(rect.width / image.naturalWidth, rect.height / image.naturalHeight)
  const width = image.naturalWidth * ratio
  const height = image.naturalHeight * ratio
  const [x = '50%', y = '50%'] = style.objectPosition.split(' ')
  const offsetX = position(x, rect.width - width)
  const offsetY = position(y, rect.height - height)
  const frame = contain ? { left: rect.left + offsetX, top: rect.top + offsetY, width, height } : rect
  let left = frame.left, top = frame.top, right = frame.left + frame.width, bottom = frame.top + frame.height
  let radius = parseFloat(style.borderRadius) || 0
  for (let parent = image.parentElement; parent && parent !== image.ownerDocument.body; parent = parent.parentElement) {
    const css = view.getComputedStyle(parent)
    const bounds = parent.getBoundingClientRect()
    if (/(hidden|clip|auto|scroll)/.test(css.overflowX)) { left = Math.max(left, bounds.left); right = Math.min(right, bounds.right) }
    if (/(hidden|clip|auto|scroll)/.test(css.overflowY)) { top = Math.max(top, bounds.top); bottom = Math.min(bottom, bounds.bottom) }
    if (!contain && Math.abs(bounds.width - rect.width) < 1 && Math.abs(bounds.height - rect.height) < 1) radius = Math.max(radius, parseFloat(css.borderRadius) || 0)
  }
  return {
    left: frame.left - panel.left, top: frame.top - panel.top, width: frame.width, height: frame.height,
    image: { left: contain ? 0 : offsetX, top: contain ? 0 : offsetY, width, height }, radius,
    inset: [clamp(top - frame.top, 0, frame.height), clamp(frame.left + frame.width - right, 0, frame.width), clamp(frame.top + frame.height - bottom, 0, frame.height), clamp(left - frame.left, 0, frame.width)],
  }
}
