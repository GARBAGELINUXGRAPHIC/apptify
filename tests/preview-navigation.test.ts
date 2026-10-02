import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { AppleAside, AppleNavibar } from '../src/components/navibar'
import { holdPreviewNavigation } from '../src/core/preview-navigation'

const wrappers: VueWrapper[] = []
const releases: Array<() => void> = []
afterEach(() => {
  releases.splice(0).forEach(release => release())
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ''
})

it('keeps navigation hidden until every preview starts closing, with idempotent cleanup', async () => {
  const wrapper = mount({ render: () => h('div', [h(AppleNavibar), h(AppleAside, null, () => 'Navigation')]) }, { attachTo: document.body })
  wrappers.push(wrapper)
  const first = holdPreviewNavigation(wrapper.element), second = holdPreviewNavigation(wrapper.element)
  releases.push(first, second)
  await nextTick()
  for (const nav of wrapper.findAll('.apple-navibar,.apple-aside')) {
    expect(nav.attributes('inert')).toBeDefined()
    expect(nav.attributes('aria-hidden')).toBe('true')
  }
  first(); first()
  await nextTick()
  expect(wrapper.find('.apple-aside').attributes('data-preview-hidden')).toBe('true')
  second()
  await nextTick()
  expect(wrapper.find('.apple-aside').attributes('data-preview-hidden')).toBeUndefined()
  expect(wrapper.find('.apple-navibar').attributes('inert')).toBeUndefined()
})

it('isolates dialog navigation and allows ordinary layout navigation to stay visible', async () => {
  const wrapper = mount({ render: () => h('div', [
    h(AppleNavibar, { id: 'global' }),
    h('section', { class: 'apple-modal' }, [
      h(AppleNavibar, { id: 'embedded', fixed: false }),
      h(AppleNavibar, { id: 'opted-in', fixed: false, hideOnPreview: true }),
      h(AppleAside, { id: 'aside' }), h(AppleAside, { id: 'layout', hideOnPreview: false }),
    ]),
  ]) }, { attachTo: document.body })
  wrappers.push(wrapper)
  releases.push(holdPreviewNavigation(wrapper.find('.apple-modal').element))
  await nextTick()
  for (const id of ['global', 'embedded', 'layout']) expect(wrapper.find(`#${id}`).attributes('data-preview-hidden')).toBeUndefined()
  for (const id of ['opted-in', 'aside']) expect(wrapper.find(`#${id}`).attributes('data-preview-hidden')).toBe('true')
})
