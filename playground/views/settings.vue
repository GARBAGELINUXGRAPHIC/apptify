<template>
  <main>
  <apple-container class="main-content settings-page" :data-preview-motion="previewMotion" :data-preview-ripple="rippleAllowed && apple.ripple.value.enabled">
    <aside class="settings-sidebar">
      <h1>设置</h1>
      <nav aria-label="设置导航"><apple-tree v-model="selectedSetting" v-model:expanded="expandedSettings" :items="settingsTree" label="设置目录" @select="navigateSetting" /></nav>
      <p>让界面跟随你的偏好。</p>
    </aside>
    <div class="settings-content">
    <header class="page-heading settings-heading">
      <div><div class="page-kicker">APPTIFY / 外观与交互</div><h2>外观设置</h2><p>调整主题、动效与材质，即刻查看效果。</p></div>
      <apple-button variant="secondary" size="small" @click="reset">恢复默认设置</apple-button>
    </header>
    <div class="settings-grid">
      <apple-card id="setting-theme" class="settings-section" tabindex="-1" aria-labelledby="theme-heading">
        <div class="specimen-caption"><span>01 / 外观</span><Palette :size="18" aria-hidden="true" /></div>
        <div class="settings-section-heading"><div><h2 id="theme-heading">主题</h2><p>选择喜欢的色彩，应用于所有页面。</p></div></div>
        <div class="theme-picker" role="group" aria-label="选择主题">
          <apple-link as="button" v-for="theme in themes" class="theme-choice" :key="theme.value" type="button" :aria-pressed="apple.theme.value.name === theme.value" :class="{ selected: apple.theme.value.name === theme.value }" @click="apple.theme.value.set(theme.value)">
            <span aria-hidden="true" class="theme-swatch" :style="{ background: theme.background, color: theme.accent }"><i /><i /><i /></span>
            <span class="theme-label">{{ theme.label }}<Check v-if="apple.theme.value.name === theme.value" :size="15" aria-hidden="true" /></span>
          </apple-link>
        </div>
        <div class="settings-card-foot">外观偏好保存在这台设备上。</div>
      </apple-card>
      <apple-card id="setting-motion" class="settings-section" tabindex="-1" aria-labelledby="motion-heading">
        <div class="specimen-caption"><span>02 / 动效</span><Waves :size="18" aria-hidden="true" /></div>
        <div class="settings-section-heading"><div><h2 id="motion-heading">动效</h2><p>为页面切换和组件交互选择动效强度。</p></div></div>
        <apple-segmented-control :model-value="apple.motion.value.mode" :items="motionOptions" label="全局动效" @update:model-value="setMotion" />
        <p class="settings-note">{{ motionDescriptions[apple.motion.value.mode] }}<template v-if="apple.motion.value.reduced"> 系统已开启减少动态效果。</template></p>
        <div ref="motionDemo" class="effect-demo motion-sample" aria-label="动效自动演示" @pointerenter="motionPaused = true" @pointerleave="motionPaused = false" @focusin="motionPaused = true" @focusout="motionPaused = false">
          <apple-accordion v-model="motionDemoOpened" multiple :items="motionDemoItems" />
        </div>
        <div class="settings-card-foot">{{ previewMotion === 'none' ? '动效已关闭 · 静态展示' : '自动演示 · 跟随当前动效强度' }}</div>
      </apple-card>
      <apple-card id="setting-ripple" class="settings-section" tabindex="-1" aria-labelledby="ripple-heading">
        <div class="specimen-caption"><span>03 / 点击反馈</span><MousePointer2 :size="18" aria-hidden="true" /></div>
        <div class="settings-section-heading"><div><h2 id="ripple-heading">点击波纹</h2><p>让每一次轻点，都有细微的回应。</p></div></div>
        <apple-switch :model-value="rippleAllowed && apple.ripple.value.enabled" :disabled="!rippleAllowed" label="点击波纹" :hint="rippleAllowed ? '减弱动效时自动关闭，可手动开启；偏好保存在这台设备上。' : '关闭动效时，无法开启点击波纹。'" @update:model-value="apple.ripple.value.set" />
        <div ref="rippleDemo" class="effect-demo ripple-sample" aria-label="波纹自动演示" @pointerenter="ripplePaused = true" @pointerleave="ripplePaused = false" @focusin="ripplePaused = true" @focusout="ripplePaused = false">
          <apple-button variant="outline" @click="rippleDemoClicks++">试试点击波纹</apple-button>
          <span class="ripple-click-count">已点击 {{ rippleDemoClicks }} 次</span>
        </div>
        <div class="settings-card-foot">{{ rippleAllowed && apple.ripple.value.enabled ? '自动点击 · 也可以手动试一试' : '点击波纹已关闭 · 静态展示' }}</div>
      </apple-card>
      <apple-card id="setting-glass" class="settings-section" tabindex="-1" aria-labelledby="glass-heading">
        <div class="specimen-caption"><span>04 / 材质</span><SlidersHorizontal :size="18" aria-hidden="true" /></div>
        <div class="settings-section-heading"><div><h2 id="glass-heading">玻璃效果</h2><p>调整下拉浮层的底色与模糊程度。</p></div></div>
        <div class="glass-controls">
          <apple-slider :model-value="apple.glass.value.opacity" label="玻璃不透明度" :min="0" :max="100" :step="0.1" :format-value="formatOpacity" @update:model-value="setGlassOpacity" />
          <apple-slider :model-value="apple.glass.value.blur" label="玻璃模糊" :min="2" :max="22" :step="1" :format-value="formatBlur" @update:model-value="setGlassBlur" />
        </div>
	      <div style="margin-bottom: 16px;">
		      <apple-select v-model="glassPreviewChoice" label="点击查看效果" :items="glassPreviewItems"/>
	      </div>
        <div class="effect-demo glass-sample" aria-label="玻璃效果自动演示">
          <div class="glass-sample-colors" aria-hidden="true"><span /><span /><span /></div>
        </div>
        <apple-link as="button" class="glass-reset" @click="resetGlass">恢复默认玻璃效果</apple-link>
      </apple-card>
    </div>
    </div>
  </apple-container>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, Layers, MousePointer2, Palette, SlidersHorizontal, Waves } from 'lucide-vue-next'
import { builtInThemes, resolveMotion, useApple, type Motion } from '../../src'

const apple = useApple()
const selectedSetting = ref('theme')
const expandedSettings = ref(['settings', 'appearance'])
const settingsTree = [{ label: '设置', value: 'settings', children: [{
  label: '外观设置', value: 'appearance', children: [
    { label: '主题', value: 'theme' },
    { label: '动效', value: 'motion' },
    { label: '点击波纹', value: 'ripple' },
    { label: '玻璃效果', value: 'glass' },
  ],
}] }]
async function navigateSetting(item: { value: string | number }) {
  await nextTick()
  const card = document.getElementById(`setting-${item.value}`)
  card?.scrollIntoView({ behavior: previewMotion.value === 'full' ? 'smooth' : 'instant', block: 'start' })
  card?.focus({ preventScroll: true })
}
const previewMotion = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced))
const rippleAllowed = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced) !== 'none')
const motionDemo = ref<HTMLElement>()
const rippleDemo = ref<HTMLElement>()
const motionDemoOpened = ref<string[]>([])
const motionDemoItems = [{ label: '预览效果', value: 'preview', content: '折叠面板与所有组件的动画速度、数量都会跟随你选择的动效强度。' }]
const rippleDemoClicks = ref(0)
const motionPaused = ref(false)
const ripplePaused = ref(false)
let demoTimer: number | undefined
let releaseTimer: number | undefined
let pressedButton: HTMLButtonElement | undefined
function releaseDemoButton() {
  window.clearTimeout(releaseTimer)
  pressedButton?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, button: 0 }))
  pressedButton = undefined
}
function playDemos() {
  if (document.hidden || previewMotion.value === 'none') return
  if (!motionPaused.value) motionDemo.value?.querySelector<HTMLButtonElement>('button')?.click()
  if (ripplePaused.value || !apple.ripple.value.enabled) return
  const button = rippleDemo.value?.querySelector<HTMLButtonElement>('button')
  if (!button) return
  releaseDemoButton()
  const rect = button.getBoundingClientRect()
  pressedButton = button
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, buttons: 1, clientX: rect.x + rect.width / 2, clientY: rect.y + rect.height / 2 }))
  releaseTimer = window.setTimeout(() => {
    releaseDemoButton()
    button.click()
  }, 160)
}
onMounted(() => { demoTimer = window.setInterval(playDemos, 2600) })
onBeforeUnmount(() => {
  window.clearInterval(demoTimer)
  releaseDemoButton()
})
const glassPreviewChoice = ref('1')
const glassPreviewItems = [
  { label: 'Item 1', value: '1', description: 'Item 1' },
  { label: 'Item 2', value: '2', description: 'Item 2' },
]
function formatOpacity(value: number) { return `${Number(value.toFixed(1))}%` }
function formatBlur(value: number) { return `${value}px` }
function setGlassOpacity(opacity: number) { apple.glass.value.set({ opacity }) }
function setGlassBlur(blur: number) { apple.glass.value.set({ blur }) }
const themes = [
  { label: '跟随系统', value: 'system', background: 'linear-gradient(125deg, #f5f5f7 50%, #242426 50%)', accent: '#8a8a90' },
  { label: '浅色', value: 'light', background: '#f5f5f7', accent: builtInThemes.light.tokens.accent },
  { label: '深色', value: 'dark', background: '#242426', accent: builtInThemes.dark.tokens.accent },
  { label: '石墨', value: 'graphite', background: '#253334', accent: '#a6ceca' },
  { label: '玫瑰', value: 'rose', background: '#fff1f5', accent: '#a83b65' },
]
const motionOptions = [{ label: '自动', value: 'auto' }, { label: '完整', value: 'full' }, { label: '减弱', value: 'reduced' }, { label: '关闭', value: 'none' }]
const motionDescriptions: Record<string, string> = {
  auto: '跟随系统的动态效果偏好，自动调整。',
  full: '呈现完整的过渡与交互动效，同时尊重系统的减少动态效果设置。',
  reduced: '缩短过渡、减少位移，保留必要的反馈。',
  none: '立即呈现每次变化，关闭过渡动画。',
}
function setMotion(value: Motion) { apple.motion.value.set(value) }
function resetGlass() {
  apple.glass.value.reset()
  apple.notify('已恢复默认玻璃效果', { tone: 'success' })
}
function reset() {
  apple.theme.value.set('light')
  apple.motion.value.set('auto')
  apple.ripple.value.set(true)
  apple.glass.value.reset()
  apple.notify('已恢复默认设置', { tone: 'success' })
}
</script>

<style scoped>
.settings-page { padding-bottom: 40px; display: grid; grid-template-columns: 176px minmax(0, 1fr); gap: 32px; align-items: start; }
.settings-sidebar { position: sticky; top: 96px; min-width: 0; }
.settings-sidebar h1 { font-size: 22px; margin: 0 0 24px 8px; }
.settings-sidebar p { color: var(--apple-secondary); font-size: 11px; line-height: 1.7; margin: 24px 8px 0; }
.settings-content { min-width: 0; padding-inline: 0; }
.settings-heading h2 { font-size: 30px; line-height: 1.2; margin: 0; font-weight: 650; }
.settings-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
.settings-heading .page-kicker { margin-bottom: 14px; }
.settings-heading > .apple-button { flex-shrink: 0; }
.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 18px; align-items: stretch; }
.settings-section { min-width: 0; margin: 0; scroll-margin-top: 88px; }
.settings-section:focus-visible { outline: 2px solid var(--apple-accent); outline-offset: 4px; }
.settings-section :deep(> .apple-card__body) { height: 100%; display: flex; flex-direction: column; padding: 12px; }
.specimen-caption { margin-bottom: 20px; font-size: 10px; }
.settings-section-heading { margin-bottom: 24px; }
.settings-section h2 { font-size: 21px; line-height: 1.3; }
.settings-section-heading p { margin-top: 9px; }
.settings-card-foot { margin-top: auto; padding-top: 24px; color: var(--apple-secondary); font-size: 11px; line-height: 1.7; }
.theme-picker { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.theme-choice { min-width: 0; padding: 6px; border: 1px solid var(--apple-border); border-radius: 10px; }
.theme-choice.selected { border-color: var(--apple-accent); outline: 1px solid var(--apple-accent); }
.theme-choice:focus-visible { outline: 3px solid color-mix(in srgb, var(--apple-accent) 65%, transparent); outline-offset: 3px; }
.theme-choice :deep(.apple-link__content) { flex-direction: column; width: 100%; gap: 9px; }
.theme-swatch { height: 62px; padding: 12px; }
.theme-label { color: var(--apple-text); font-size: 11px; }
.settings-note { margin: 16px 0 0; }
.effect-demo { position: relative; min-height: 144px; border-radius: 12px; overflow: hidden; background: transparent; margin-top: 20px; }
.motion-sample { display: flex; align-items: flex-start; flex: 1; min-height: 220px; padding: 16px; }
.motion-sample :deep(.apple-accordion) { width: 100%; }
.motion-sample :deep(.apple-accordion h3) { font-size: 14px; }
.motion-sample :deep(.apple-accordion__content) { font-size: 12px; }
.ripple-sample { flex: 1; max-height: 180px; margin-block: auto; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px; padding: 20px; }
.ripple-click-count { color: var(--apple-secondary); font-size: 11px; }
.glass-sample { min-height: 156px; display: grid; place-items: center; margin: 0 0 20px; isolation: isolate; }
.glass-sample-colors { position: absolute; inset: -40px; display: flex; align-items: center; justify-content: center; gap: 20px; animation: sample-glass 6s ease-in-out infinite; }
.glass-sample-colors span { width: 95px; height: 95px; flex-shrink: 0; border-radius: 28px; background: #82b6ef; transform: rotate(-20deg); }
.glass-sample-colors span:nth-child(2) { background: #e9aa99; width: 72px; height: 120px; transform: rotate(25deg); }
.glass-sample-colors span:nth-child(3) { background: #ada1e2; border-radius: 50%; }
.glass-sample-panel { position: relative; display: grid; grid-template-columns: 20px 1fr; gap: 12px; width: 168px; padding: 18px; border: 1px solid var(--apple-border); border-radius: 12px; background: rgb(var(--apple-glass-rgb, 255 255 255) / var(--apple-glass-opacity, .3)); backdrop-filter: blur(var(--apple-glass-blur, 12px)) saturate(2); -webkit-backdrop-filter: blur(var(--apple-glass-blur, 12px)) saturate(2); font-size: 12px; }
.glass-sample-panel i { grid-column: 1 / -1; height: 5px; width: 100%; border-radius: 4px; background: currentColor; opacity: .15; }
.glass-sample-panel i:last-child { width: 65%; }
@keyframes sample-glass { 0%, 100% { transform: translateX(-32px) rotate(-8deg); } 50% { transform: translateX(32px) rotate(8deg); } }
@keyframes sample-reduced { 0%, 100% { opacity: .6; } 50% { opacity: 1; } }
.settings-page[data-preview-motion=reduced] .glass-sample-colors { animation-name: sample-reduced; }
.settings-page[data-preview-motion=none] .glass-sample-colors { animation: none; }
.glass-reset { align-self: flex-start; margin-top: 12px; }
.glass-controls { display: grid; gap: 24px; margin-bottom: 24px; }
.glass-controls :deep(.apple-slider__value) { min-width: 58px; }

@media (max-width: 900px) { .settings-page { grid-template-columns: 144px minmax(0, 1fr); gap: 24px; } }
@media (max-width: 640px) {
  .settings-page { grid-template-columns: minmax(0, 1fr); gap: 24px; }
  .settings-sidebar { position: static; }
  .settings-sidebar h1 { margin-bottom: 12px; }
  .settings-sidebar p { display: none; }
  .settings-heading h2 { font-size: 26px; }
  .settings-grid { grid-template-columns: minmax(0, 1fr); gap: 16px; }
  .settings-heading { align-items: flex-start; flex-direction: column; gap: 16px; }
  .settings-section :deep(> .apple-card__body) { padding: 10px 6px; }
}
</style>
