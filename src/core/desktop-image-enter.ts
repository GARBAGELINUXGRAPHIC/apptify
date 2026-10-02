import { thumbnailGeometry, type PhotoGeometry } from './image-geometry'
import { photoEasing, photoFlightFrame, photoFlightSize, photoMotion, readPhotoGeometry } from './image-motion'

export const interruptedPhotoEnter = new WeakMap<HTMLElement, { geometry: PhotoGeometry; background: string }>()

export async function enterDesktopPhoto(panel: HTMLElement, thumbnail: HTMLImageElement | null, motion: string, signal: AbortSignal) {
  const photo = panel.querySelector<HTMLImageElement>('.apple-viewer-image')
  const pages = panel.querySelector<HTMLElement>('.apple-viewer-pages')
  const animations: Animation[] = []
  let flight: HTMLElement | null = null
  const opacity = thumbnail?.style.opacity ?? ''
  const pagesOpacity = pages?.style.opacity ?? ''
  const cancel = () => {
    if (flight?.firstElementChild) interruptedPhotoEnter.set(panel, {
      geometry: readPhotoGeometry(flight, flight.firstElementChild as HTMLElement, panel.getBoundingClientRect()),
      background: getComputedStyle(panel).backgroundColor,
    })
    animations.forEach(animation => animation.cancel())
  }
  signal.addEventListener('abort', cancel, { once: true })
  try {
    if (signal.aborted || motion === 'none' || typeof panel.animate !== 'function') return
    // Keep the source visible while the full-size image is decoding. A late load
    // must not flash a full-size photo before its origin flight starts.
    if (pages) pages.style.opacity = '0'
    panel.style.backgroundColor = 'transparent'
    if (photo && !photo.complete) await new Promise<void>(resolve => {
      const done = () => {
        photo.removeEventListener('load', done); photo.removeEventListener('error', done)
        signal.removeEventListener('abort', done); resolve()
      }
      photo.addEventListener('load', done, { once: true }); photo.addEventListener('error', done, { once: true })
      signal.addEventListener('abort', done, { once: true })
    })
    if (signal.aborted) return
    panel.style.backgroundColor = ''
    const background = getComputedStyle(panel).backgroundColor
    const bounds = panel.getBoundingClientRect()
    const from = thumbnail && thumbnailGeometry(thumbnail, bounds)
    const duration = motion === 'full' ? photoMotion.open : 120
    const options: KeyframeAnimationOptions = { duration, easing: photoEasing, fill: 'both' }
    if (photo?.naturalWidth && from && motion === 'full') {
      const rect = photo.getBoundingClientRect()
      const to: PhotoGeometry = { left: rect.left - bounds.left, top: rect.top - bounds.top, width: rect.width, height: rect.height,
        image: { left: 0, top: 0, width: rect.width, height: rect.height }, radius: 0, inset: [0, 0, 0, 0] }
      const base = photoFlightSize(from, to)
      flight = document.createElement('div')
      flight.className = 'apple-viewer-enter-photo'
      Object.assign(flight.style, { position: 'absolute', left: '0', top: '0', width: `${base.width}px`, height: `${base.height}px`, transformOrigin: '0 0', pointerEvents: 'none' })
      const image = photo.cloneNode(true) as HTMLImageElement
      image.className = ''
      image.setAttribute('aria-hidden', 'true')
      Object.assign(image.style, { display: 'block', visibility: 'visible', width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none', transform: 'none', transition: 'none' })
      flight.append(image); panel.append(flight)
      thumbnail!.style.opacity = '0'
      animations.push(flight.animate([photoFlightFrame(from, base), photoFlightFrame(to, base)], options))
    } else if (pages) animations.push(pages.animate([{ opacity: 0 }, { opacity: 1 }], options))
    animations.push(panel.animate([{ backgroundColor: 'transparent' }, { backgroundColor: background }], options))
    Array.from(panel.children).filter(child => child !== flight && child !== pages).forEach(child => {
      animations.push(child.animate([{ opacity: 0 }, { opacity: 1 }], options))
    })
    await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)))
  } finally {
    signal.removeEventListener('abort', cancel)
    animations.forEach(animation => animation.cancel())
    flight?.remove()
    if (thumbnail) thumbnail.style.opacity = opacity
    if (pages) pages.style.opacity = pagesOpacity
    panel.style.backgroundColor = ''
  }
}
