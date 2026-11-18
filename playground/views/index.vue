<template>
  <main class="main-content home-page">
    <section class="home-intro">
      <div class="page-kicker">Apptify.</div>
      <h1>让界面自然，<br /><span>让细节动人。</span></h1>
      <p>Beyond Design.</p>
      <div class="home-actions">
        <router-link v-slot="{ href, navigate }" to="/components" custom>
          <apple-button :href="href" @click="navigate">浏览全部组件 <IconArrowRight :size="17" aria-hidden="true" /></apple-button>
        </router-link>
        <router-link v-slot="{ href, navigate }" to="/settings" custom>
          <apple-link :href="href" class="home-link" @click="navigate">设置 <IconArrowUpRight :size="16" aria-hidden="true" /></apple-link>
        </router-link>
      </div>
    </section>
    <section aria-label="Apptify 特点">
      <div class="specimen-grid">
        <apple-card class="specimen controls-specimen" aria-labelledby="home-controls">
          <header class="feature-heading"><h3 id="home-controls">美观简洁，<br /><span>灵动易用</span></h3></header>
          <div class="feature-stage controls-stage">
            <MiniPlayer />
          </div>
          <router-link to="/components#apple-button" custom v-slot="{ href, navigate }">
            <apple-link :href="href" class="feature-foot feature-link" @click="navigate">查看基础组件 <IconArrowUpRight :size="15" aria-hidden="true" /></apple-link>
          </router-link>
        </apple-card>

        <apple-card class="specimen media-specimen" aria-labelledby="home-gallery">
          <header class="feature-heading"><h3 id="home-gallery">跨端复杂组件，<br /><span>不只基础</span></h3></header>
          <div class="feature-stage photo-stage"><ImageDemo :controls="false" aspect-ratio="auto" /></div>
          <router-link to="/component-docs/apple-image" custom v-slot="{ href, navigate }">
            <apple-link :href="href" class="feature-foot feature-link" @click="navigate">体验图片组件 <IconArrowUpRight :size="15" aria-hidden="true" /></apple-link>
          </router-link>
        </apple-card>

        <apple-card class="specimen appearance-specimen" aria-labelledby="home-appearance">
          <header class="feature-heading"><h3 id="home-appearance">界面风格，<br /><span>随你设定</span></h3></header>
          <div class="feature-stage appearance-stage" :style="{ backgroundImage: 'url(' + imageUrl('coast.jpg') + ')' }">
            <div class="glass-panel">
              <apple-switch :model-value="rippleAllowed && apple.ripple.value.enabled" :disabled="!rippleAllowed"
                label="点击波纹" @update:model-value="apple.ripple.value.set" />
              <apple-slider :model-value="apple.glass.value.blur" label="玻璃模糊" :min="2" :max="22"
                :format-value="value => `${value}px`" @update:model-value="blur => apple.glass.value.set({ blur })" />
              <apple-slider :model-value="apple.glass.value.opacity" label="不透明度" :max="100"
                :format-value="value => `${value}%`" @update:model-value="opacity => apple.glass.value.set({ opacity })" />
              <apple-segmented-control :model-value="apple.motion.value.mode" :items="motionOptions" aria-label="动效强度"
                @update:model-value="setMotion" />
            </div>
          </div>
          <p class="feature-foot">Android 波纹、Apple 玻璃，自由搭配。</p>
        </apple-card>

        <apple-card class="specimen starter-specimen" aria-labelledby="home-starter">
          <header class="feature-heading"><h3 id="home-starter">启动框架，<br /><span>一应俱全</span></h3></header>
          <div class="feature-stage starter-stage">
            <div class="terminal-command"><span aria-hidden="true">$</span><code>npm create apptify</code></div>
            <ul class="starter-features">
              <li v-for="feature in starterFeatures" :key="feature"><IconCheck :size="15" aria-hidden="true" />{{ feature }}</li>
            </ul>
          </div>
          <p class="feature-foot">已有项目？使用 <code>$ npm i apptify</code> 按需接入即可。</p>
        </apple-card>

        <apple-card class="specimen editor-specimen" aria-labelledby="home-editor">
          <header class="feature-heading"><h3 id="home-editor">低代码示例，<br /><span>易学易用</span></h3></header>
          <div class="feature-stage editor-stage">
            <div class="editor-toolbar">
              <apple-slider v-model="containerWidth" aria-label="容器宽度" :min="40" :max="100" :step="5" :format-value="value => `${value}%`" />
              <apple-button variant="borderless" :icon="IconCopy" icon-only label="复制示例代码" @click="copyExample" />
            </div>
            <div class="editor-preview">
              <apple-container :width="`${containerWidth}%`" class="container-preview"><span>内容</span></apple-container>
            </div>
            <pre class="editor-example"><code><span class="code-tag">&lt;apple-container</span> <span class="code-attribute">width</span>=<span class="code-string">"{{ containerWidth }}%"</span><span class="code-tag">&gt;</span>
  内容
<span class="code-tag">&lt;/apple-container&gt;</span></code></pre>
          </div>
          <router-link to="/component-docs/apple-container" custom v-slot="{ href, navigate }">
            <apple-link :href="href" class="feature-foot feature-link" @click="navigate">API 文档与低代码编辑器 <IconArrowUpRight :size="15" aria-hidden="true" /></apple-link>
          </router-link>
        </apple-card>

        <apple-card class="specimen showcase-specimen" aria-labelledby="home-showcase">
          <header class="feature-heading"><h3 id="home-showcase">看看实例，<br /><span>高下立判</span></h3></header>
          <apple-image
            class="feature-stage showcase-carousel" :class="{ 'is-single': projects.length === 1 }"
            :gallery="projects" carousel :autoplay="false" :preview="false" label="使用 Apptify Design 的项目" aspect-ratio="auto"
          >
            <template #item="{ index }">
              <div class="project-preview">
                <ImageCompareDemo v-if="projects[index].value === 'clash-verge-rev-fork'" />
                <div class="project-summary">
                  <img class="project-icon" :src="projects[index].icon" alt="" width="32" height="32" loading="lazy" />
                  <h4>{{ projects[index].label }}</h4>
                  <apple-link :href="projects[index].href" class="project-link" external icon-only label="查看项目" />
                </div>
              </div>
            </template>
          </apple-image>
        </apple-card>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconArrowRight, IconArrowUpRight, IconCheck, IconCopy } from '@tabler/icons-vue'
import { resolveMotion, useApple, type Motion } from '../../src'
import { catalog } from '../catalog'
import { imageUrl } from '../images'
import ImageDemo from '../components/ImageDemo.vue'
import ImageCompareDemo from '../components/ImageCompareDemo.vue'
import MiniPlayer from '../components/MiniPlayer.vue'

const apple = useApple()
const rippleAllowed = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced) !== 'none')
const motionOptions = [{ label: '自动', value: 'auto' }, { label: '完整', value: 'full' }, { label: '减弱', value: 'reduced' }, { label: '关闭', value: 'none' }]
function setMotion(value: Motion) { apple.motion.value.set(value) }
const starterFeatures = ['Apptify 组件', '自动创建 Vue 3 路由', 'HTTP 错误页', '常用页面（导航栏、登录、注册表单等）', '全局广播 API', '本地 /component-docs 低代码与文档']
const containerWidth = ref(75)
const containerExample = computed(() => `<apple-container width="${containerWidth.value}%">
  内容
</apple-container>`)

async function copyExample() {
  try {
    await navigator.clipboard.writeText(containerExample.value)
    apple.notify('示例代码已复制', { tone: 'success' })
  } catch {
    apple.notify('无法访问剪贴板，请选中代码复制', { tone: 'warning' })
  }
}

const projects = [
  {
    value: 'clash-verge-rev-fork',
    label: 'Clash Verge Rev Fork',
    description: '以 Apptify Design 重构桌面体验。',
    href: 'https://github.com/GARBAGELINUXGRAPHIC/clash-verge-rev-fork',
    icon: imageUrl('clash-verge.png'),
  },
]
</script>

<style scoped>
.home-link { min-height: 44px; gap: 9px; font-size: 13px; font-weight: 500; }
.specimen-grid { gap: 22px; }
.specimen { padding: 0; border-radius: 24px; box-shadow: 0 3px 14px rgb(0 0 0 / 4%); }
.specimen:hover { box-shadow: 0 6px 22px rgb(0 0 0 / 7%); }
.specimen > :deep(.apple-card__body) { display: flex; flex-direction: column; gap: 0; height: 100%; padding: 0; }
.feature-heading { min-height: 133px; padding: 28px 28px 22px; }
.specimen h3 { margin: 0; font-size: 27px; line-height: 1.28; font-weight: 650; }
.specimen h3 span { color: var(--apple-secondary); }
.feature-heading p { margin: 12px 0 0; color: var(--apple-secondary); font-size: 13px; line-height: 1.6; }
.feature-stage { min-width: 0; height: 252px; margin: 0 20px; border-radius: 14px; }
.feature-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 0 4px; min-height: 64px; margin: 0; padding: 16px 28px 20px; color: var(--apple-secondary); font-size: 12px; line-height: 1.6; }
.feature-foot code { color: var(--apple-text); font-size: 12px; }
.feature-link { color: var(--apple-accent); }
.controls-stage { display: grid; align-items: center; padding: 22px; background: color-mix(in srgb, var(--apple-accent) 6%, var(--apple-surface-alt)); }
.photo-stage { display: flex; align-items: center; }
.photo-stage :deep(.demo-image) { width: 100%; height: 100%; }
.photo-stage :deep(.apple-image) { display: flex; flex-direction: column; height: 100%; border-radius: 12px; }
.photo-stage :deep(.apple-image__surface) { flex: 1; min-height: 0; }
.photo-stage :deep(.apple-image__pagination) { flex: none; padding-top: 8px; }
.appearance-stage { display: grid; align-items: center; padding: 22px; background-size: cover; background-position: center; }
.glass-panel { padding: 10px 14px; border: 1px solid rgb(255 255 255 / 55%); border-radius: 18px; background: rgb(var(--apple-glass-rgb) / var(--apple-glass-opacity)); -webkit-backdrop-filter: blur(var(--apple-glass-blur)) saturate(1.4); backdrop-filter: blur(var(--apple-glass-blur)) saturate(1.4); box-shadow: 0 12px 32px rgb(0 0 0 / 10%); }
.glass-panel { display: grid; gap: 5px; padding: 12px 14px; }
.glass-panel :deep(.apple-field__label), .glass-panel :deep(.apple-choice__label) { font-size: 12px; }
.glass-panel :deep(.apple-field) { gap: 0; }
.glass-panel :deep(.apple-slider-row) { min-height: 32px; }
.glass-panel :deep(.apple-slider) { height: 32px; }
.glass-panel :deep(.apple-slider__value) { font-size: 11px; }
.glass-panel :deep(.apple-segmented__item) { flex-basis: 0; min-height: 32px; padding-inline: 4px; font-size: 11px; }
.starter-stage { display: flex; flex-direction: column; padding: 24px; color: #e6edf3; background: #20252c; }
.terminal-command { display: flex; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid #ffffff16; font-size: 14px; }
.terminal-command > span { color: #9aa8b5; }
.starter-features { display: grid; gap: 12px; margin: 20px 0 0; padding: 0; list-style: none; font-size: 12px; color: #b9c4ce; }
.starter-features li { display: flex; align-items: center; gap: 10px; }
.starter-features svg { color: #8bd9b2; flex-shrink: 0; }
.editor-stage { display: flex; flex-direction: column; border: 1px solid color-mix(in srgb, var(--apple-border) 55%, transparent); background: var(--apple-surface); overflow: hidden; }
.editor-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 12px; }
.editor-toolbar > :deep(.apple-field) { flex: 1; min-width: 0; }
.editor-toolbar :deep(.apple-segmented__item) { flex-basis: 0; padding-inline: 8px; font-size: 12px; }
.editor-preview { display: flex; flex: 1; align-items: center; padding: 8px 20px 18px; }
.container-preview { display: grid; place-items: center; min-height: 68px; border: 1px dashed color-mix(in srgb, var(--apple-accent) 55%, transparent); border-radius: 8px; color: var(--apple-accent); background: color-mix(in srgb, var(--apple-accent) 8%, var(--apple-surface)); font-size: 12px; }
.editor-example { margin: 0; padding: 15px 20px; border-top: 1px solid color-mix(in srgb, var(--apple-border) 50%, transparent); background: var(--apple-surface-alt); font-size: 12px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
.code-tag { color: var(--apple-accent); }
.code-attribute { color: var(--apple-secondary); }
.code-string { color: var(--apple-text); }
.showcase-carousel { flex: 1; width: auto; min-height: 252px; height: auto; margin-bottom: 20px; }
.showcase-carousel :deep(.apple-image__surface) { height: 100%; background: color-mix(in srgb, var(--apple-surface) 90%, #b189ed); }
.showcase-carousel.is-single :deep(.apple-image__pagination) { display: none; }
.showcase-carousel:not(.is-single) :deep(.apple-image__surface) { height: calc(100% - 28px); }
.project-preview { display: flex; flex-direction: column; justify-content: center; gap: 12px; width: 100%; height: 100%; padding: 12px; color: var(--apple-text); }
.project-preview > .apple-image-compare { flex: 1; min-height: 0; }
.project-summary { display: flex; align-items: center; gap: 9px; min-width: 0; }
.showcase-carousel :deep(img.project-icon) { flex-shrink: 0; width: 32px; height: 32px; border-radius: 8px; }
.project-preview h4 { flex: 1; min-width: 0; margin: 0; font-size: 12px; line-height: 1.4; font-weight: 600; }
.project-link { min-width: 32px; min-height: 38px; }
@media (min-width: 1600px) {
  .feature-stage { height: 280px; }
}
@media (max-width: 1200px) and (min-width: 1101px) {
  .feature-heading { padding-inline: 22px; }
  .feature-stage { margin-inline: 14px; }
  .controls-stage, .appearance-stage { padding: 14px; }
}
@media (max-width: 640px) {
  .specimen-grid { gap: 20px; }
  .feature-heading { min-height: 124px; padding: 25px 26px 20px; }
  .specimen h3 { font-size: 26px; }
  .feature-stage { height: 252px; margin-inline: 18px; }
  .feature-foot { padding-inline: 26px; }
  .controls-stage, .appearance-stage { padding: 16px; }
}
@media (max-width: 360px) {
  .feature-stage { margin-inline: 14px; }
  .controls-stage, .appearance-stage { padding: 12px; }
  .starter-stage { padding: 22px 18px; }
  .project-preview h4 { font-size: 11px; }
}
</style>
