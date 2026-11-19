<template>
  <div class="mini-player" v-bind="interaction" :data-motion="motion" :data-skip="lastSkip" :class="{ 'is-playing': playing }">
    <div class="player-track">
      <div class="track-stack">
        <Transition name="track-change" :css="motion === 'full'">
          <div :key="track.title" class="track-info">
            <div class="track-turntable" aria-hidden="true">
              <div class="track-record"><img :src="imageUrl(track.image)" alt="" width="26" height="26" /></div>
              <svg class="record-tonearm" viewBox="0 0 64 64" fill="none">
                <path class="tonearm-shadow" d="M55 11C55 19 55.5 27 52 32S47 37 45 39" />
                <path class="tonearm-rod" d="M55 11C55 19 55.5 27 52 32S47 37 45 39" />
                <circle class="tonearm-pivot" cx="55" cy="9" r="2.7" />
                <g class="tonearm-cartridge" transform="translate(45 39) rotate(45)">
                  <path class="tonearm-needle" d="M0 7.5V9" />
                  <rect class="tonearm-head" x="-1.8" width="3.6" height="7.5" rx=".35" />
                  <path class="tonearm-detail" d="M-1 2H1M-1 4H1" />
                </g>
              </svg>
            </div>
            <div class="track-caption"><h4>{{ track.title }}</h4><p>群星</p></div>
          </div>
        </Transition>
      </div>
      <apple-button variant="borderless" :icon="IconHeart" icon-only :label="liked ? '取消喜欢' : '喜欢'"
        :aria-pressed="liked" class="player-heart" :class="{ 'is-liked': liked }" @click="liked = !liked" />
    </div>
    <div class="player-progress">
      <apple-slider :model-value="elapsed" aria-label="播放进度" :max="duration" :step=".001" :format-value="time" :show-value="false" @update:model-value="seek" />
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
import { computed, ref } from 'vue'
import { IconHeart, IconPlayerPauseFilled, IconPlayerPlayFilled, IconPlayerSkipBackFilled, IconPlayerSkipForwardFilled } from '@tabler/icons-vue'
import { resolveMotion, useApple } from '../../src'
import { imageUrl } from '../images'
import { useDemoAnimation } from './useDemoAnimation'

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
const playing = ref(true)
const liked = ref(false)
const elapsed = ref(42)
const duration = 168
const { interaction } = useDemoAnimation((delta, automatic, interacting) => {
  if (automatic) playing.value = true
  if (!playing.value || interacting) return
  const next = elapsed.value + delta / 1000
  if (next >= duration) skip(1)
  elapsed.value = next % duration
})

function time(value: number) {
  const seconds = Math.floor(value)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function seek(seconds: number) {
  elapsed.value = seconds
}

function toggle() {
  playing.value = !playing.value
}

function skip(direction: -1 | 1) {
  lastSkip.value = direction < 0 ? 'previous' : 'next'
  index.value = (index.value + direction + tracks.length) % tracks.length
  liked.value = false
  seek(0)
}
</script>

<style scoped>
.mini-player {
  --track-offset: 14px;
  width: 100%;
  min-width: 0;
  max-width: 320px;
  margin: auto;
  padding: 24px;
  border: 1px solid color-mix(in srgb, var(--apple-border) 45%, transparent);
  border-radius: 20px;
  background: var(--apple-surface);
  box-shadow: 0 2px 5px rgb(0 0 0 / 3%), 0 12px 28px -10px rgb(0 0 0 / 18%);
}
[data-skip="previous"] { --track-offset: -14px; }
.player-track { display: flex; align-items: center; gap: 8px; }
.track-stack { flex: 1; display: grid; min-width: 0; }
.track-info { grid-area: 1 / 1; display: flex; align-items: center; gap: 12px; min-width: 0; }
.track-turntable { position: relative; flex: none; width: 56px; height: 56px; }
.record-tonearm { position: absolute; width: calc(100% + 8px); height: auto; top: -4px; left: -4px; overflow: visible; transform: rotate(-25deg); transform-origin: 85.9375% 14.0625%; }
.is-playing .record-tonearm { transform: rotate(0); }
[data-motion="full"] .record-tonearm { transition: transform 400ms cubic-bezier(.65, 0, .35, 1); }
.tonearm-shadow { stroke: rgb(0 0 0 / 24%); stroke-width: 2.2; stroke-linecap: round; transform: translate(.35px, .55px); }
.tonearm-rod { stroke: #f5f6f8; stroke-width: 1.4; stroke-linecap: round; }
.tonearm-pivot { fill: #f4f5f7; stroke: #b8bdc4; stroke-width: .5; }
.tonearm-cartridge { filter: drop-shadow(.4px .6px .4px rgb(0 0 0 / 25%)); }
.tonearm-head { fill: #f5f6f8; stroke: #bcc0c6; stroke-width: .45; }
.tonearm-needle { stroke: #a2a8b0; stroke-width: .7; }
.tonearm-detail { stroke: #c7cbd0; stroke-width: .4; }
.track-record { position: relative; display: grid; place-items: center; flex: none; width: 56px; height: 56px; border-radius: 50%; background: repeating-radial-gradient(circle, transparent 0 2px, rgb(255 255 255 / 9%) 2.5px 3px, transparent 3.5px 4px), conic-gradient(from 25deg, #111 0deg, #434347 45deg, #141416 90deg, #111 180deg, #434347 225deg, #141416 270deg, #111 360deg); box-shadow: 0 3px 8px rgb(0 0 0 / 20%); animation: record-spin 7s linear infinite; animation-play-state: paused; }
.track-record img { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; }
.track-record::after { content: ''; position: absolute; width: 5px; height: 5px; border-radius: 50%; background: #171719; box-shadow: 0 0 0 1px rgb(255 255 255 / 35%); }
[data-motion="full"].is-playing .track-record { animation-play-state: running; }
@keyframes record-spin { to { transform: rotate(360deg); } }
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
[data-motion="full"][data-skip="previous"] .player-previous svg,
[data-motion="full"][data-skip="next"] .player-next svg { animation: skip-feedback 300ms var(--apple-ease); }
@keyframes skip-feedback {
  0% { transform: scale(.86); }
  40% { transform: translateX(var(--skip-offset)) scale(1.04); }
  100% { transform: translateX(0) scale(1); }
}

@media (max-width: 360px) {
  .mini-player { padding-inline: 20px; }
  .track-info { gap: 9px; }
  .track-turntable, .track-record { width: 46px; height: 46px; }
}
</style>
