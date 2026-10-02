import { expect, type Locator } from '@playwright/test'

// Inspect the painted endpoints rather than requiring layout properties to be animated.
export function samplePhotoFlight(frame: Element) {
  const animation = frame.getAnimations()[0]
  const duration = Number(animation.effect!.getTiming().duration)
  const time = animation.currentTime, running = animation.playState === 'running'
  animation.pause()
  const samples = [0, duration / 2, duration].map(time => {
    animation.currentTime = time
    const css = getComputedStyle(frame), rect = frame.getBoundingClientRect(), image = frame.querySelector('img')!.getBoundingClientRect()
    const scale = rect.width / parseFloat(css.width)
    const values = css.clipPath.match(/^inset\(([^)]*)\)/)![1].split('round')[0].trim().split(/\s+/).map(value => parseFloat(value) * scale)
    const [top, right = top, bottom = top, left = right] = values
    return {
      frame: { left: `${rect.left + left}px`, top: `${rect.top + top}px`, width: `${rect.width - left - right}px`, height: `${rect.height - top - bottom}px` },
      image: { left: `${image.left}px`, top: `${image.top}px`, width: `${image.width}px`, height: `${image.height}px` },
      layout: { width: css.width, height: css.height },
    }
  })
  animation.currentTime = time
  if (running) animation.play()
  return {
    frame: samples.map(sample => sample.frame), image: samples.map(sample => sample.image),
    layout: samples.map(sample => sample.layout), duration,
    properties: Object.keys((animation.effect as KeyframeEffect).getKeyframes()[0]).filter(key => !['offset', 'computedOffset', 'easing', 'composite'].includes(key)).sort(),
  }
}

export async function swipeImage(viewer: Locator, direction: 'left' | 'right' = 'left') {
  await expect(viewer).toHaveAttribute('data-phase', 'open')
  const bounds = (await viewer.boundingBox())!
  const start = direction === 'left' ? bounds.width * .8 : bounds.width * .2
  const end = direction === 'left' ? bounds.width * .2 : bounds.width * .8
  const stage = viewer.locator('.apple-viewer-stage')
  const event = { pointerId: 1, pointerType: 'touch', clientY: bounds.y + bounds.height / 2, button: 0, bubbles: true }
  await stage.dispatchEvent('pointerdown', { ...event, clientX: bounds.x + start })
  await stage.dispatchEvent('pointermove', { ...event, clientX: bounds.x + end })
  await stage.dispatchEvent('pointerup', { ...event, clientX: bounds.x + end })
  await expect(viewer).toHaveAttribute('data-phase', 'open')
}
