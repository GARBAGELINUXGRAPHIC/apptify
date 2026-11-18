<template>
  <div class="mini-player" :data-motion="motion" :data-skip="lastSkip" :class="{ 'is-playing': playing }">
    <div class="player-track">
      <div class="track-stack">
        <Transition name="track-change" :css="motion === 'full'">
          <div :key="track.title" class="track-info">
            <img :src="imageUrl(track.image)" alt="" width="56" height="56" />
            <div class="track-caption"><h4>{{ track.title }}</h4><p>群星</p></div>
          </div>
        </Transition>
      </div>
      <apple-button variant="borderless" :icon="IconHeart" icon-only :label="liked ? '取消喜欢' : '喜欢'"
        :aria-pressed="liked" class="player-heart" :class="{ 'is-liked': liked }" @click="liked = !liked" />
    </div>
    <div class="player-progress">
      <apple-slider :model-value="Math.floor(elapsed)" aria-label="播放进度" :max="duration" :format-value="time" :show-value="false" @update:model-value="seek" />
      <div class="player-time"><span>{{ time(elapsed) }}</span><span>{{ time(duration) }}</span></div>
    </div>
    <div class="player-buttons">
      <apple-button class="player-previous" variant="borderless" icon-only label="上一首" @click="skip(-1)">
        <IconPlayerSkipBackFilled :key="index" :size="22" aria-hidden="true" />
      </apple-button>
      <apple-button class="player-play" icon-only :label="playing ? '暂停' : '播放'" @click="toggle">
        <span class="play-symbol" aria-hidden="true">
          <IconPlayerPlayFilled class="symbol-play" :size="24" />
          <IconPlayerPauseFilled class="symbol-pause" :size="24" />
        </span>
      </apple-button>
      <apple-button class="player-next" variant="borderless" icon-only label="下一首" @click="skip(1)">
        <IconPlayerSkipForwardFilled :key="index" :size="22" aria-hidden="true" />
      </apple-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { IconHeart, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled } from '@tabler/icons-vue'
import { resolveMotion, useApple } from '../../src'
import { imageUrl } from '../images'

const apple = useApple()
const motion = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced))
const tracks = [
  { title: '海岸来信', image: 'coast.jpg' },
  { title: '山间回声', image: 'mountains.jpg' },
  { title: '晴日慢调', image: 'lake.jpg' },
]
const index = ref(0)
const track = computed(() => tracks[index.value])
const lastSkip = ref<'previous' | 'next'>()
const playing = ref(false)
const liked = ref(false)
const elapsed = ref(42)
const duration = 168
let timer: ReturnType<typeof setInterval> | undefined
let startedAt = 0

function time(value: number) {
  const seconds = Math.floor(value)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function seek(seconds: number) {
  elapsed.value = seconds
  startedAt = performance.now() - seconds * 1000
}

function tick() {
  elapsed.value = Math.min(duration, (performance.now() - startedAt) / 1000)
  if (elapsed.value === duration) skip(1)
}

function toggle() {
  if (playing.value) {
    clearInterval(timer)
    tick()
  } else {
    seek(elapsed.value === duration ? 0 : elapsed.value)
    timer = setInterval(tick, 200)
  }
  playing.value = !playing.value
}

function skip(direction: -1 | 1) {
  lastSkip.value = direction < 0 ? 'previous' : 'next'
  index.value = (index.value + direction + tracks.length) % tracks.length
  liked.value = false
  seek(0)
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.mini-player {
  --track-offset: 14px;
  width: 100%;
  min-width: 0;
  max-width: 320px;
  margin: auto;
  padding: 18px 20px 14px;
  border: 1px solid color-mix(in srgb, var(--apple-border) 45%, transparent);
  border-radius: 20px;
  background: var(--apple-surface);
  box-shadow: 0 2px 5px rgb(0 0 0 / 3%), 0 12px 28px -10px rgb(0 0 0 / 18%);
}
[data-skip="previous"] { --track-offset: -14px; }
.player-track { display: flex; align-items: center; gap: 8px; }
.track-stack { flex: 1; display: grid; min-width: 0; }
.track-info { grid-area: 1 / 1; display: flex; align-items: center; gap: 12px; min-width: 0; }
.track-info img { flex: none; width: 56px; height: 56px; border-radius: 12px; object-fit: cover; box-shadow: 0 3px 8px rgb(0 0 0 / 12%); }
.track-caption { min-width: 0; }
.track-caption h4 { margin: 0; font-size: 16px; font-weight: 600; }
.track-caption p { margin: 4px 0 0; color: var(--apple-secondary); font-size: 12px; }
.player-heart { margin-right: -8px; color: var(--apple-secondary); }
.is-liked :deep(svg) { color: #e74d70; fill: #e74d70; }
.player-progress { margin-top: 6px; }
.player-progress :deep(.apple-slider::-webkit-slider-thumb) { width: 14px; height: 14px; margin-top: -4px; border-color: var(--apple-accent); background: var(--apple-accent); }
.player-progress :deep(.apple-slider::-moz-range-thumb) { width: 14px; height: 14px; border-color: var(--apple-accent); background: var(--apple-accent); }
.player-time { display: flex; justify-content: space-between; margin-top: -6px; color: var(--apple-secondary); font-size: 10px; font-variant-numeric: tabular-nums; }
.player-buttons { display: flex; justify-content: center; align-items: center; gap: clamp(6px, 4vw, 18px); margin-top: 9px; }
.player-buttons .apple-button { border-radius: 50%; }
.player-previous { --skip-offset: -4px; }
.player-next { --skip-offset: 4px; }
.player-play { width: 48px; height: 48px; box-shadow: 0 3px 8px color-mix(in srgb, var(--apple-accent) 22%, transparent); }
.play-symbol { display: grid; }
.play-symbol svg { grid-area: 1 / 1; }
.symbol-play { transform: translateX(1px); }
.symbol-pause, .is-playing .symbol-play { opacity: 0; transform: scale(.55); }
.is-playing .symbol-pause { opacity: 1; transform: scale(1); }

.track-change-enter-active { transition: opacity 240ms ease-out, transform 320ms var(--apple-ease); }
.track-change-leave-active { transition: opacity 140ms ease-in, transform 200ms ease-in; }
.track-change-enter-from { opacity: 0; transform: translateX(var(--track-offset)); }
.track-change-leave-to { opacity: 0; transform: translateX(calc(-1 * var(--track-offset))); }
[data-motion="full"] .play-symbol svg { transition: transform 230ms cubic-bezier(.2,.8,.2,1.12), opacity 150ms ease; }
[data-motion="full"] .track-info img { transition: transform 320ms var(--apple-ease); }
[data-motion="full"]:not(.is-playing) .track-info img { transform: scale(.93); }
[data-motion="full"][data-skip="previous"] .player-previous svg,
[data-motion="full"][data-skip="next"] .player-next svg { animation: skip-feedback 300ms var(--apple-ease); }
@keyframes skip-feedback {
  0% { transform: scale(.86); }
  40% { transform: translateX(var(--skip-offset)) scale(1.04); }
  100% { transform: translateX(0) scale(1); }
}

@media (max-width: 360px) {
  .mini-player { padding-inline: 14px; }
  .track-info { gap: 9px; }
  .track-info img { width: 46px; height: 46px; }
}
</style>
