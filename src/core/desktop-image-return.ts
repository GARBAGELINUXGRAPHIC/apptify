import { interruptedPhotoEnter } from './desktop-image-enter'
import { thumbnailGeometry, type PhotoGeometry } from './image-geometry'
import { photoEasing, photoFlightFrame, photoFlightSize, photoMotion } from './image-motion'

export async function returnDesktopPhoto(panel: HTMLElement, thumbnail: HTMLImageElement | null, motion: string, signal: AbortSignal) {
  const interrupted = interruptedPhotoEnter.get(panel)
  interruptedPhotoEnter.delete(panel)
  const photo = panel.querySelector<HTMLImageElement>('.apple-viewer-page:not([class*="leave"]) .apple-viewer-image')
  const canvas = photo?.parentElement
  const bounds = panel.getBoundingClientRect()
  const destination = thumbnail && thumbnailGeometry(thumbnail, bounds)
  const duration = motion === 'none' ? 0 : motion === 'reduced' ? 120 : photoMotion.close
  const animations: Animation[] = []
  let flight: HTMLElement | null = null
  const opacity = thumbnail?.style.opacity ?? ''
  const parent = thumbnail?.parentElement
  const background = parent?.style.backgroundColor ?? ''
  const pages = panel.querySelector<HTMLElement>('.apple-viewer-pages')
  const pagesOpacity = pages?.style.opacity ?? ''
  const cancel = () => animations.forEach(animation => animation.cancel())
  signal.addEventListener('abort', cancel, { once: true })
  try {
    if (!duration || typeof panel.animate !== 'function') return
    if (photo && canvas && destination && motion === 'full' && photo.naturalWidth) {
      const rect = photo.getBoundingClientRect()
      const pose = new DOMMatrixReadOnly(getComputedStyle(canvas).transform)
      const scale = Math.hypot(pose.a, pose.b)
      const width = photo.offsetWidth * scale, height = photo.offsetHeight * scale
      const from: PhotoGeometry = interrupted?.geometry ?? {
        left: rect.left + rect.width / 2 - width / 2 - bounds.left,
        top: rect.top + rect.height / 2 - height / 2 - bounds.top,
        width, height, image: { left: 0, top: 0, width, height }, radius: 0, inset: [0, 0, 0, 0],
      }
      const base = photoFlightSize(from, destination)
      flight = document.createElement('div')
      flight.className = 'apple-viewer-return-photo'
      Object.assign(flight.style, { position: 'absolute', left: '0', top: '0', width: `${base.width}px`, height: `${base.height}px`, transformOrigin: '0 0', pointerEvents: 'none' })
      const image = photo.cloneNode(true) as HTMLImageElement
      image.className = ''
      image.setAttribute('aria-hidden', 'true')
      Object.assign(image.style, { display: 'block', width: '100%', height: '100%', maxWidth: 'none', maxHeight: 'none', transition: 'none', transform: getComputedStyle(photo).transform })
      flight.append(image); panel.append(flight)
      // The loaded image has its own visibility:visible, so an ancestor's
      // visibility:hidden would still paint a second, stationary full-size photo.
      if (pages) pages.style.opacity = '0'
      thumbnail!.style.opacity = '0'
      if (parent) { parent.style.backgroundColor = '#000'; parent.classList.add('apple-image__trigger--placeholder') }
      const start = photoFlightFrame(from, base)
      // A rotated photo can extend past its unrotated box; keep those corners
      // visible until the return flight gradually adopts the thumbnail crop.
      const flightScale = width / base.width
      const extraX = Math.max(0, rect.width - width) / 2 / flightScale
      const extraY = Math.max(0, rect.height - height) / 2 / flightScale
      if (!interrupted) start.clipPath = `inset(${-extraY}px ${-extraX}px ${-extraY}px ${-extraX}px round 0px)`
      animations.push(flight.animate([start, photoFlightFrame(destination, base)], { duration, easing: photoEasing, fill: 'both' }))
      animations.push(image.animate([{ transform: image.style.transform }, { transform: 'rotate(0deg)' }], { duration, easing: photoEasing, fill: 'both' }))
      animations.push(panel.animate([{ backgroundColor: interrupted?.background ?? getComputedStyle(panel).backgroundColor }, { backgroundColor: 'transparent' }], { duration, easing: photoEasing, fill: 'both' }))
      Array.from(panel.children).filter(child => child !== flight && !child.classList.contains('apple-viewer-pages')).forEach(child => {
        animations.push(child.animate([{ opacity: getComputedStyle(child).opacity }, { opacity: 0 }], { duration, easing: photoEasing, fill: 'both' }))
      })
    } else animations.push(panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: 'both' }))
    await Promise.all(animations.map(animation => animation.finished.catch(() => undefined)))
  } finally {
    signal.removeEventListener('abort', cancel)
    animations.forEach(animation => animation.cancel())
    flight?.remove()
    if (thumbnail) thumbnail.style.opacity = opacity
    if (parent) { parent.style.backgroundColor = background; parent.classList.remove('apple-image__trigger--placeholder') }
    if (pages) pages.style.opacity = pagesOpacity
    panel.classList.remove('apple-viewer-return')
  }
}
