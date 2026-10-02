import { expect, type Locator } from '@playwright/test'

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
