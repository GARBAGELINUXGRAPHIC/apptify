import { clamp, type PhotoGeometry, type PhotoSize } from './image-geometry'

// Photo motion has its own cadence; changing a provider's UI transition duration
// must not change how far a flick travels or how quickly a photo comes to rest.
export const photoMotion = { open: 360, close: 300, zoom: 300, settle: 320, page: 360 } as const

// Sample a critically damped spring once, then let the browser animate it.
// Velocity is expressed in units of the remaining distance per duration.
export function photoSpring(duration: number, velocity = 0): string {
  // Older WebKit supports WAAPI but rejects linear() easing entirely.
  if (typeof CSS !== 'undefined' && !CSS.supports('animation-timing-function', 'linear(0, 1)')) {
    return velocity ? `cubic-bezier(.33333333,${clamp(velocity, -2, 3) / 3},.66666667,1)` : 'cubic-bezier(.2,.8,.2,1)'
  }
  const frequency = Math.max(9, velocity)
  const position = (time: number) => 1 - (1 + (frequency - velocity) * time) * Math.exp(-frequency * time)
  const end = position(1)
  const times = [0, 1]
  for (let time = 4; time < duration; time += 4) times.push(time)
  times.push(duration)
  return `linear(${times.map(time => `${(position(time / duration) / end).toFixed(6)} ${(time / duration * 100).toFixed(4)}%`).join(',')})`
}

export const photoEasing = photoSpring(photoMotion.zoom)

// Paging should build speed like a compact strip's smooth scroll. The opening
// spring finishes most of its travel too early for a full viewport translation.
export const photoPageEasing = 'cubic-bezier(.38,0,.05,1)'

export function photoPageTiming(distance: number, velocity: number, _width: number) {
  if (Math.abs(distance) < .1) return { duration: 0, easing: 'linear' }
  if (Math.abs(velocity) < .01) {
    return { duration: Math.round(clamp(Math.sqrt(Math.abs(distance)) * 16, 240, 620)), easing: photoPageEasing }
  }
  const resting = clamp(Math.sqrt(Math.abs(distance)) * 16, 240, 620)
  // Keep the compact strip's easing family after a drag, matching its initial
  // tangent to the release speed instead of switching to the opening spring.
  const duration = distance * velocity > 0 ? clamp(Math.abs(distance / velocity) * 3, 140, resting) : resting
  const slope = velocity * duration / distance
  const controlX = Math.min(.38, .95 / Math.max(1, Math.abs(slope)))
  // A fast flick is already at speed: progressively remove the acceleration phase.
  const landingX = .05 + (2 / 3 - .05) * clamp((slope - 1) / 2, 0, 1)
  return { duration, easing: `cubic-bezier(${controlX},${controlX * slope},${landingX},1)` }
}

// Keep the decoded photo at a fixed size. Only its transform and crop animate,
// so opening/closing does not lay out and resize the image on every frame.
export function photoFlightSize(from: PhotoGeometry, to: PhotoGeometry): PhotoSize {
  return from.image.width > to.image.width ? from.image : to.image
}

export function photoFlightFrame(rect: PhotoGeometry, base: PhotoSize): Keyframe {
  const scale = rect.image.width / Math.max(1, base.width)
  const crop = [
    rect.inset[0] - rect.image.top,
    rect.image.left + rect.image.width - rect.width + rect.inset[1],
    rect.image.top + rect.image.height - rect.height + rect.inset[2],
    rect.inset[3] - rect.image.left,
  ].map(value => Math.max(0, value) / Math.max(.0001, scale))
  return {
    transform: `translate3d(${rect.left + rect.image.left}px,${rect.top + rect.image.top}px,0) scale(${scale})`,
    clipPath: `inset(${crop.map(value => `${value}px`).join(' ')} round ${rect.radius / Math.max(.0001, scale)}px)`,
  }
}

export function readPhotoGeometry(frame: HTMLElement, photo: HTMLElement, panel: DOMRect): PhotoGeometry {
  const rect = frame.getBoundingClientRect(), image = photo.getBoundingClientRect()
  const css = getComputedStyle(frame)
  const scale = rect.width / (parseFloat(css.width) || rect.width || 1)
  const clip = css.clipPath.match(/^inset\(([^)]*)\)/)?.[1].split('round')
  const values = clip?.[0].trim().split(/\s+/).map(value => parseFloat(value) * scale) ?? [0]
  return {
    left: rect.left - panel.left, top: rect.top - panel.top, width: rect.width, height: rect.height,
    image: { left: image.left - rect.left, top: image.top - rect.top, width: image.width, height: image.height },
    radius: (parseFloat(clip?.[1] ?? css.borderRadius) || 0) * scale,
    inset: [values[0], values[1] ?? values[0], values[2] ?? values[0], values[3] ?? values[1] ?? values[0]],
  }
}
