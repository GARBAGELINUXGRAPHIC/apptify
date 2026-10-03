import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { AppleButton, AppleCard, AppleImage, AppleProvider } from '../src/components/foundation'
import { appleKey, createApple, useApple } from '../src/core/context'

describe('foundation integration', () => {
  it('updates tokens and motion in the mounted provider immediately', async () => {
    const context=createApple({theme:'light'})
    const wrapper=mount(AppleProvider, {global:{provide:{[appleKey as symbol]:context}}, slots:{default:() => h(AppleButton, null, ()=> 'Continue')}})
    context.theme.value.set('dark');context.motion.value.set('none')
    await nextTick()
    expect(wrapper.attributes('data-apple-theme')).toBe('dark')
    expect(wrapper.attributes('data-apple-motion')).toBe('none')
    expect(wrapper.find('button').attributes('data-apple-motion')).toBe('none')
    expect(wrapper.attributes('style')).toContain('--apple-bg: #161617')
    wrapper.unmount()
  })
  it('gives nested providers independent hosts and inherited updates', async () => {
    const context=createApple({theme:'light'})
    const wrapper=mount(AppleProvider, {global:{provide:{[appleKey as symbol]:context}}, slots:{default:() => h(AppleProvider, null, ()=>h('p','Nested'))}})
    context.theme.value.set('rose');await nextTick()
    expect(wrapper.findAll('.apple-provider').map(w=>w.attributes('data-apple-theme'))).toEqual(['rose','rose'])
    context.theme.value.register('rose', {accent:'#8a2852'})
    await nextTick()
    expect(wrapper.findAll('.apple-provider').every(w=>w.attributes('style').includes('--apple-accent: #8a2852'))).toBe(true)
    context.dialog({title:'Only once'})
    await nextTick();await nextTick()
    expect(wrapper.findAll('[role="dialog"]')).toHaveLength(1)
    wrapper.unmount()
  })
  it('provider applies scoped theme without mutating the application', async () => {
    const context=createApple({theme:'light'})
    const wrapper=mount(AppleProvider, {props:{theme:'dark'},global:{provide:{[appleKey as symbol]:context}}})
    expect(wrapper.attributes('data-apple-theme')).toBe('dark')
    await wrapper.setProps({theme:'rose'})
    expect(wrapper.attributes('data-apple-theme')).toBe('rose')
    expect(context.theme.value.name).toBe('light')
    wrapper.unmount()
  })
  it('blocks disabled/loading buttons and uses button as the default type', async () => {
    const wrapper=mount(AppleButton, {props:{loading:true}})
    expect(wrapper.attributes('type')).toBe('button')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeUndefined()
    await wrapper.setProps({loading:false})
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
    wrapper.unmount()
  })
  it('passes image alternative text to the viewer and handles errors', async () => {
    const wrapper=mount(AppleImage, {props:{gallery:{src:'/test.jpg',alt:'A test image'}}})
    expect(wrapper.find('button').attributes('aria-label')).toBe('放大图片：A test image')
    await wrapper.find('img').trigger('error')
    expect(wrapper.text()).toContain('图片无法加载')
    expect(wrapper.find('button').exists()).toBe(false)
    wrapper.unmount()
  })
  it('keeps card slots and per-component motion overrides', () => {
    const wrapper=mount(AppleCard, {props:{title:'A very long title',motion:'none'},slots:{actions:()=>h('button','Action')}})
    expect(wrapper.find('h3').text()).toBe('A very long title')
    expect(wrapper.attributes('data-apple-motion')).toBe('none')
    expect(wrapper.find('.apple-card__actions button').text()).toBe('Action')
    wrapper.unmount()
  })
})
