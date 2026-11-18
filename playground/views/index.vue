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
          <div class="feature-stage photo-stage">
            <div class="feature-panel photo-panel"><ImageDemo :controls="false" :limit="3" aspect-ratio="auto" /></div>
          </div>
          <router-link to="/component-docs/apple-image" custom v-slot="{ href, navigate }">
            <apple-link :href="href" class="feature-foot feature-link" @click="navigate">体验图片组件 <IconArrowUpRight :size="15" aria-hidden="true" /></apple-link>
          </router-link>
        </apple-card>

        <apple-card class="specimen appearance-specimen" aria-labelledby="home-appearance">
          <header class="feature-heading"><h3 id="home-appearance">界面风格，<br /><span>随你设定</span></h3></header>
          <div class="feature-stage appearance-stage">
            <div class="feature-panel glass-panel">
              <apple-segmented-control :model-value="apple.theme.value.name" :items="themeOptions" aria-label="主题"
                @update:model-value="value => apple.theme.value.set(String(value))" />
              <div class="ripple-controls">
                <apple-switch :model-value="rippleAllowed && apple.ripple.value.enabled" :disabled="!rippleAllowed"
                  label="点击波纹" @update:model-value="apple.ripple.value.set" />
                <apple-button size="small" variant="borderless" label="测试点击波纹">测试</apple-button>
              </div>
              <apple-slider :model-value="apple.glass.value.blur" label="玻璃模糊" :min="2" :max="22"
                :format-value="value => `${value}px`" @update:model-value="blur => apple.glass.value.set({ blur })" />
              <apple-slider :model-value="apple.glass.value.opacity" label="不透明度" :max="100"
                :format-value="value => `${value}%`" @update:model-value="opacity => apple.glass.value.set({ opacity })" />
            </div>
          </div>
          <router-link to="/settings" custom v-slot="{ href, navigate }">
            <apple-link :href="href" class="feature-foot feature-link" @click="navigate">前往设置 <IconArrowUpRight :size="15" aria-hidden="true" /></apple-link>
          </router-link>
        </apple-card>

        <apple-card class="specimen starter-specimen" aria-labelledby="home-starter">
          <header class="feature-heading"><h3 id="home-starter">启动框架，<br /><span>一应俱全</span></h3></header>
          <div class="feature-stage starter-stage">
            <div class="feature-panel starter-preview">
              <div class="terminal-command"><span aria-hidden="true">$</span><code>npm create apptify</code></div>
              <ul class="starter-features">
                <li v-for="feature in starterFeatures" :key="feature"><IconCheck :size="15" aria-hidden="true" />{{ feature }}</li>
              </ul>
            </div>
          </div>
          <p class="feature-foot">已有项目？使用 <code>$ npm i apptify</code> 按需接入即可。</p>
        </apple-card>

        <apple-card class="specimen editor-specimen" aria-labelledby="home-editor">
          <header class="feature-heading"><h3 id="home-editor">低代码示例，<br /><span>易学易用</span></h3></header>
          <div class="feature-stage editor-stage">
            <div class="feature-panel editor-panel">
              <div class="editor-toolbar">
                <span style="font-size: 14px; font-weight: 600; margin-right: 16px; margin-bottom: 2px">容器宽度</span><apple-slider v-model="containerWidth" aria-label="容器宽度" :min="40" :max="100" :step="5" :format-value="value => `${value}%`" />
              </div>
              <div class="editor-preview">
                <apple-container :width="`${containerWidth}%`" class="container-preview"><span>内容</span></apple-container>
              </div>
              <div class="editor-code">
                <pre class="editor-example"><code><span class="code-tag">&lt;apple-container</span> <span class="code-attribute">width</span>=<span class="code-string">"{{ containerWidth }}%"</span><span class="code-tag">&gt;</span>
  内容
<span class="code-tag">&lt;/apple-container&gt;</span></code></pre>
                <apple-button class="editor-copy" variant="borderless" :icon="IconCopy" icon-only label="复制示例代码" @click="copyExample" />
              </div>
            </div>
          </div>
          <router-link to="/component-docs/apple-container" custom v-slot="{ href, navigate }">
            <apple-link :href="href" class="feature-foot feature-link" @click="navigate">API 文档与低代码编辑器 <IconArrowUpRight :size="15" aria-hidden="true" /></apple-link>
          </router-link>
        </apple-card>

        <apple-card class="specimen showcase-specimen" aria-labelledby="home-showcase">
          <header class="feature-heading"><h3 id="home-showcase">看看实例，<br /><span>高下立判</span></h3></header>
          <div class="feature-stage showcase-stage">
            <apple-image
              v-model:index="projectIndex" class="showcase-carousel" :class="{ 'is-single': projects.length === 1 }"
              :gallery="projects" carousel :autoplay="false" :preview="false" label="使用 Apptify Design 的项目" aspect-ratio="auto"
            >
              <template #item="{ index }">
                <div class="project-preview">
                  <ProjectComparison v-if="projects[index].value === 'clash-verge-rev-fork'" />
                </div>
              </template>
            </apple-image>
          </div>
          <apple-link :href="activeProject.href" class="feature-foot feature-link" external>{{ activeProject.label }}</apple-link>
        </apple-card>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IconArrowRight, IconArrowUpRight, IconCheck, IconCopy } from '@tabler/icons-vue'
import { resolveMotion, useApple } from '../../src'
import ImageDemo from '../components/ImageDemo.vue'
import ProjectComparison from '../components/ProjectComparison.vue'
import MiniPlayer from '../components/MiniPlayer.vue'

const apple = useApple()
const rippleAllowed = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced) !== 'none')
const themeOptions = [{ label: '系统', value: 'system' }, { label: '浅色', value: 'light' }, { label: '深色', value: 'dark' }, { label: '石墨', value: 'graphite' }, { label: '玫瑰', value: 'rose' }]
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

const projectIndex = ref(0)
const projects = [
  {
    value: 'clash-verge-rev-fork',
    label: 'Clash Verge Rev Fork',
    description: '以 Apptify Design 重构桌面体验。',
    href: 'https://github.com/GARBAGELINUXGRAPHIC/clash-verge-rev-fork',
  },
]
const activeProject = computed(() => projects[projectIndex.value] ?? projects[0])
</script>

<style scoped>
.home-link { min-height: 44px; gap: 9px; font-size: 13px; font-weight: 500; }
.specimen-grid { --feature-stage-height: 300px; gap: 22px; }
.specimen { padding: 0; border-radius: 24px; box-shadow: 0 3px 14px rgb(0 0 0 / 4%); }
.specimen:hover { box-shadow: 0 6px 22px rgb(0 0 0 / 7%); }
.specimen > :deep(.apple-card__body) { display: flex; flex-direction: column; gap: 0; height: 100%; padding: 0; }
.feature-heading { min-height: 133px; padding: 28px 28px 22px; }
.specimen h3 { margin: 0; font-size: 27px; line-height: 1.28; font-weight: 650; }
.specimen h3 span { color: var(--apple-secondary); }
.feature-heading p { margin: 12px 0 0; color: var(--apple-secondary); font-size: 13px; line-height: 1.6; }
.feature-stage { display: grid; align-items: center; min-width: 0; height: var(--feature-stage-height); margin: 0 20px; padding: 22px; border-radius: 14px; background-color: var(--feature-tint); background-size: cover; background-position: center; }
.feature-panel { width: 100%; min-width: 0; max-width: 320px; max-height: 100%; margin: auto; border: 1px solid color-mix(in srgb, var(--apple-border) 45%, transparent); border-radius: 20px; background: var(--apple-surface); box-shadow: 0 2px 5px rgb(0 0 0 / 3%), 0 12px 28px -10px rgb(0 0 0 / 18%); }
.feature-foot { display: flex; flex-wrap: wrap; align-items: center; gap: 0 4px; min-height: 64px; margin: 0; padding: 16px 28px 20px; color: var(--apple-secondary); font-size: 12px; line-height: 1.6; }
.feature-foot code { color: var(--apple-text); font-size: 12px; }
.feature-link { color: var(--apple-accent); }
.controls-stage { --feature-tint: #5288e9; background-image: url('/images/gradients/openai-blue-pink.webp'); }
.photo-stage { --feature-tint: #23bc9e; background-image: url('/images/gradients/openai-green-purple.webp'); }
.appearance-stage { --feature-tint: #ed85c3; background-image: url('/images/gradients/wang-pink.jpg'); }
.starter-stage { --feature-tint: #efaa8d; background-image: url('/images/gradients/wang-peach.jpg'); }
.editor-stage { --feature-tint: #008ba9; background-image: url('/images/gradients/openai-cyan-blue.webp'); }
.showcase-stage { --feature-tint: #8783ef; background-image: url('/images/gradients/openai-purple-blue.webp'); }
.photo-panel { height: 100%; padding: 20px 20px 0 20px; }
.photo-stage :deep(.demo-image) { width: 100%; height: 100%; }
.photo-stage :deep(.apple-image) { display: flex; flex-direction: column; height: 100%; border-radius: 12px; }
.photo-stage :deep(.apple-image__surface) { flex: 1; min-height: 0; }
.photo-stage :deep(.apple-image__pagination) { flex: none; padding: 4px 6px; }
.glass-panel { display: grid; gap: 5px; padding: 20px; background: rgb(var(--apple-glass-rgb) / var(--apple-glass-opacity)); -webkit-backdrop-filter: blur(var(--apple-glass-blur)) saturate(1.4); backdrop-filter: blur(var(--apple-glass-blur)) saturate(1.4); }
.ripple-controls { display: flex; align-items: center; gap: 12px; min-width: 0; }
.ripple-controls > :deep(.apple-switch-field) { flex: 1; min-width: 0; }
.ripple-controls > :deep(.apple-button) { flex-shrink: 0; }
.glass-panel :deep(.apple-field__label), .glass-panel :deep(.apple-choice__label) { font-size: 12px; }
.glass-panel :deep(.apple-field) { gap: 0; }
.glass-panel :deep(.apple-slider-row) { min-height: 32px; }
.glass-panel :deep(.apple-slider) { height: 32px; }
.glass-panel :deep(.apple-slider__value) { font-size: 11px; }
.glass-panel :deep(.apple-segmented) { background: rgb(var(--apple-glass-rgb, 255 255 255) / var(--apple-glass-opacity, .5)); -webkit-backdrop-filter: blur(var(--apple-glass-blur, 12px)) saturate(2); backdrop-filter: blur(var(--apple-glass-blur, 12px)) saturate(2); }
.glass-panel :deep(.apple-segmented__item) { flex-basis: 0; min-height: 32px; padding-inline: 4px; font-size: 11px; }
.starter-preview { display: flex; flex-direction: column; justify-content: center; padding: 20px; }
.terminal-command { display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 1px solid var(--apple-border); font-size: 14px; }
.terminal-command > span { color: var(--apple-secondary); }
.starter-features { display: grid; gap: 7px; margin: 12px 0 0; padding: 0; list-style: none; color: var(--apple-secondary); font-size: 11px; }
.starter-features li { display: flex; align-items: center; gap: 10px; }
.starter-features svg { color: var(--apple-success); flex-shrink: 0; }
.editor-panel { display: flex; flex-direction: column; overflow: hidden; }
.editor-toolbar { display: flex; align-items: center; padding: 12px 20px 4px; }
.editor-toolbar > :deep(.apple-field) { flex: 1; min-width: 0; }
.editor-toolbar :deep(.apple-segmented__item) { flex-basis: 0; padding-inline: 8px; font-size: 12px; }
.editor-preview { display: flex; align-items: center; padding: 0 20px 14px; }
.container-preview { display: grid; place-items: center; min-height: 56px; border: 1px dashed color-mix(in srgb, var(--apple-accent) 55%, transparent); border-radius: 8px; background: color-mix(in srgb, var(--apple-accent) 8%, var(--apple-surface)); color: var(--apple-accent); font-size: 12px; }
.editor-code { display: grid; grid-template-columns: minmax(0, 1fr) 32px; align-items: start; gap: 6px; padding: 12px 14px 16px 20px; border-top: 1px solid color-mix(in srgb, var(--apple-border) 50%, transparent); background: var(--apple-surface-alt); }
.editor-example { min-width: 0; margin: 0; padding: 0; font-size: 12px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
.editor-copy { width: 32px; min-width: 32px; height: 32px; min-height: 32px; padding: 6px; }
.code-tag { color: var(--apple-accent); }
.code-attribute { color: var(--apple-secondary); }
.code-string { color: var(--apple-text); }
.showcase-carousel { display: flex; flex-direction: column; height: 100%; }
.showcase-carousel :deep(.apple-image__surface) { flex: 1; min-height: 0; background: transparent; }
.showcase-carousel.is-single :deep(.apple-image__pagination) { display: none; }
.project-preview { display: flex; flex-direction: column; justify-content: center; gap: 12px; width: 100%; height: 100%; color: var(--apple-text); }
.project-preview > .project-comparison { flex: none; min-height: 0; }
@media (min-width: 1600px) {
  .specimen-grid { --feature-stage-height: 320px; }
}
@media (max-width: 1200px) and (min-width: 1101px) {
  .feature-heading { padding-inline: 22px; }
  .feature-stage { margin-inline: 14px; padding: 14px; }
}
@media (max-width: 640px) {
  .specimen-grid { gap: 20px; }
  .feature-heading { min-height: 124px; padding: 25px 26px 20px; }
  .specimen h3 { font-size: 26px; }
  .feature-stage { margin-inline: 18px; padding: 16px; }
  .feature-foot { padding-inline: 26px; }
}
@media (max-width: 360px) {
  .feature-stage { margin-inline: 14px; padding: 12px; }
  .starter-features { gap: 5px; }
}
</style>
