<template>
  <main class="main-content settings-page">
    <header class="page-heading"><div><div class="page-kicker">PREFERENCES</div><h1>设置<span>。</span></h1><p>选择喜欢的外观，找到舒服的交互节奏。</p></div></header>
    <section class="settings-section" aria-labelledby="theme-heading">
      <div class="settings-section-heading"><Palette :size="21" aria-hidden="true" /><div><h2 id="theme-heading">主题</h2><p>应用于所有页面，并保存在这台设备上。</p></div></div>
      <div class="theme-picker" role="group" aria-label="选择主题">
        <apple-button v-for="theme in themes" variant="ghost" class="theme-choice" :key="theme.value" type="button" :aria-pressed="apple.theme.value.name === theme.value" :class="{ selected: apple.theme.value.name === theme.value }" @click="apple.theme.value.set(theme.value)">
          <span aria-hidden="true" class="theme-swatch" :style="{ background: theme.background, color: theme.accent }"><i /><i /><i /></span>
          <span class="theme-label">{{ theme.label }}<Check v-if="apple.theme.value.name === theme.value" :size="15" aria-hidden="true" /></span>
        </apple-button>
      </div>
    </section>
    <section class="settings-section" aria-labelledby="glass-heading">
      <div class="settings-section-heading"><Layers :size="21" aria-hidden="true" /><div><h2 id="glass-heading">玻璃效果</h2><p>调整下拉浮层的底色与模糊程度，并保存在这台设备上。</p></div></div>
      <div class="glass-controls">
        <apple-slider :model-value="apple.glass.value.opacity" label="玻璃不透明度" :min="0" :max="100" :step="0.1" :format-value="formatOpacity" hint="0% 完全透明，100% 完全不透明。" @update:model-value="setGlassOpacity" />
        <apple-slider :model-value="apple.glass.value.blur" label="玻璃模糊" :min="2" :max="22" :step="1" :format-value="formatBlur" hint="范围 2–22px，默认 12px。" @update:model-value="setGlassBlur" />
      </div>
      <div class="glass-preview" aria-label="玻璃效果实时预览">
        <div class="glass-preview-backdrop" :style="{ backgroundImage: glassPreviewPattern }" aria-hidden="true" />
        <apple-list class="glass-preview-panel" :items="glassPreviewItems" label="玻璃预览内容" />
      </div>
      <p class="glass-preview-note">细碎图案便于观察模糊程度，预览随滑块实时变化。账号菜单和登录对话框保持实底。</p>
      <div class="glass-preview-select"><apple-select v-model="glassPreviewChoice" label="打开下拉查看实际效果" :items="glassPreviewItems" /></div>
    </section>
    <section class="settings-section" aria-labelledby="motion-heading">
      <div class="settings-section-heading"><Waves :size="21" aria-hidden="true" /><div><h2 id="motion-heading">动效</h2><p>为页面切换和组件交互选择动效强度。</p></div></div>
      <apple-segmented-control :model-value="apple.motion.value.mode" :items="motionOptions" label="全局动效" @update:model-value="setMotion" />
      <p class="settings-note">{{ motionDescriptions[apple.motion.value.mode] }}<template v-if="apple.motion.value.reduced"> 系统已开启减少动态效果。</template></p>
      <div class="motion-preview">
        <div class="motion-preview-heading"><span>试试当前效果</span><apple-button variant="ghost" size="small" @click="expanded = !expanded">{{ expanded ? '收起预览' : '展开预览' }}</apple-button></div>
        <apple-auto-size><div class="motion-preview-content"><apple-button @click="apple.notify('这就是当前的交互效果', { tone: 'success' })">轻点一下</apple-button><p v-if="expanded">舒适的颜色，自然的变化。每一个细节，都跟随你的偏好。</p></div></apple-auto-size>
      </div>
    </section>
    <div class="settings-reset"><span>偏好会自动保存。</span><apple-button variant="ghost" size="small" @click="reset">恢复默认设置</apple-button></div>
    <PageFooter />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Check, Layers, Palette, Waves } from 'lucide-vue-next'
import { builtInThemes, useApple, type Motion } from '../../src'
import PageFooter from '../components/PageFooter.vue'

const apple = useApple()
const expanded = ref(false)
const glassPreviewPattern = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="176" height="144" viewBox="0 0 176 144"><g fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g stroke="#7196ad"><path d="M12 12h15v10H12zM12 12l7.5 6 7.5-6"/><circle cx="64" cy="17" r="8"/><path d="M64 12v5l4 2M110 9l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1zM148 10h12v15h-12zM152 14h5M152 18h5M152 22h3"/></g><g stroke="#bd856b"><path d="M12 48h12v11a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM24 50h3a4 4 0 0 1 0 8h-3M15 43v2M20 42v3M57 46l7-3 7 3v16l-7-3-7 3zM64 43v16M105 47l7-4 7 4v8l-7 4-7-4zM105 47l7 4 7-4M112 51v8M146 48h15v12h-15zM149 45v6M158 45v6M146 53h15M150 56h2M156 56h2"/></g><g stroke="#719281"><path d="M12 84c13-6 18 0 11 9-9 4-15 0-11-9zM12 94l12-11M62 80l-6 9 6 9 6-9zM61 89h3M105 82h13v13h-13zM108 85h7M108 88h7M108 91h4M147 83a7 7 0 0 1 14 0v6M147 85h3v7h-3zM158 85h3v7h-3z"/></g><g stroke="#a58cbb"><path d="M12 118l10-6 4 6-10 6zM12 118l-1 7 5-1M57 119c0-10 14-10 14 0M57 119v6h4v-6zM67 119v6h4v-6zM105 113h13v13h-13zM109 113v13M106 117h12M151 113h7v5l4 5-3 4h-9l-3-4 4-5zM151 118h7"/></g></g></svg>')}")`
const glassPreviewChoice = ref('profile')
const glassPreviewItems = [
  { label: '个人资料', value: 'profile', description: '姓名、头像和联系方式' },
  { label: '通知', value: 'notices', description: '推送和邮件偏好' },
  { label: '隐私与安全', value: 'privacy', description: '管理你的账户安全设置' },
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
function reset() {
  apple.theme.value.set('light')
  apple.motion.value.set('auto')
  apple.glass.value.reset()
  apple.notify('已恢复默认设置', { tone: 'success' })
}
</script>

<style scoped>
.theme-picker { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.theme-choice { min-width: 0; padding: 7px; border: 1px solid var(--apple-border); border-radius: 8px; }
.theme-choice.selected { border-color: var(--apple-accent); outline: 1px solid var(--apple-accent); }
.theme-choice:focus-visible { outline: 3px solid color-mix(in srgb, var(--apple-accent) 65%, transparent); outline-offset: 3px; }
.theme-choice :deep(.apple-button__content) { flex-direction: column; width: 100%; gap: 12px; }
.theme-label { color: var(--apple-text); }
.glass-controls { display: grid; gap: 20px; margin-bottom: 24px; }
.glass-controls :deep(.apple-slider__value) { min-width: 58px; }
.glass-preview { position: relative; isolation: isolate; display: grid; place-items: center; min-height: 274px; padding: 24px; border-radius: 8px; background: var(--apple-surface-alt); }
.glass-preview-backdrop { position: absolute; inset: 0; z-index: -1; border-radius: inherit; background-color: var(--apple-surface-alt); background-size: 176px 144px; }
.glass-preview-panel { width: 100%; max-width: 340px; padding: 12px; border: 1px solid var(--apple-border); border-radius: 10px; background: rgb(var(--apple-glass-rgb, 255 255 255) / var(--apple-glass-opacity, 0.31372549)); -webkit-backdrop-filter: blur(var(--apple-glass-blur, 12px)) saturate(2); backdrop-filter: blur(var(--apple-glass-blur, 12px)) saturate(2); box-shadow: var(--apple-shadow); }
.glass-preview-note { font-size: 12px; line-height: 1.8; color: var(--apple-secondary); margin: 14px 0 20px; }
.glass-preview-select { max-width: 440px; }
@media (max-width: 600px) {
  .theme-picker { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
