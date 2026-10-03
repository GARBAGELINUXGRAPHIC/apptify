<template>
  <figure ref="scene" class="paper-scene" :class="{ 'paper-scene--dark': dark }" :data-story="story" :data-playing="canAnimate && !suspended" :data-motion="motion">
    <div class="paper-scene__window">
      <svg ref="art" class="paper-scene__art" viewBox="0 0 1000 660" role="img" :aria-labelledby="`${uid}-title ${uid}-description`" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient :id="`${uid}-sky`" x2=".3" y2="1"><stop stop-color="var(--paper-sky-top)" /><stop offset="1" stop-color="var(--paper-sky)" /></linearGradient>
          <linearGradient :id="`${uid}-water`" gradientUnits="userSpaceOnUse" x1="520" y1="400" x2="930" y2="660"><stop stop-color="var(--paper-water-light)" /><stop offset="1" stop-color="var(--paper-water)" /></linearGradient>
          <linearGradient :id="`${uid}-bark`"><stop stop-color="#996442" /><stop offset=".48" stop-color="#b58052" /><stop offset="1" stop-color="#81543b" /></linearGradient>
          <linearGradient :id="`${uid}-hole`" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#302e29" /><stop offset="1" stop-color="#5b412d" /></linearGradient>
          <filter :id="`${uid}-paper-shadow`" x="-30%" y="-25%" width="170%" height="175%"><feDropShadow dx="1" dy="6" stdDeviation="3" flood-color="#39291e" flood-opacity=".13" /></filter>
          <pattern :id="`${uid}-grain`" width="41" height="37" patternUnits="userSpaceOnUse"><path d="M4 6h1m15 11h1m13-9h.7M9 29h1m26 3h.8" stroke="#5e472e" stroke-opacity=".14" stroke-width="1" /><path d="M8 11l3-1m13 16 3-1m-4-23 2-1" stroke="#fff8e5" stroke-opacity=".2" stroke-width=".7" /></pattern>
          <clipPath :id="`${uid}-frame`"><path d="M36 74Q37 38 75 35L909 20Q957 19 963 68L986 565Q987 608 942 614L84 635Q29 635 27 585Z" /></clipPath>
          <clipPath :id="`${uid}-river-clip`"><path d="M550 435C655 419 655 451 744 459S900 472 1020 449V663H261C297 557 379 522 465 506S516 459 550 435Z" /></clipPath>
          <clipPath :id="`${uid}-drift-clip`"><path d="M578 388C592 395 607 413 621 435S638 460 655 476L635 490C620 467 609 449 602 434S578 408 567 401Z" /><path d="M550 435C655 419 655 451 744 459S900 472 1020 449V663H261C297 557 379 522 465 506S516 459 550 435Z" /></clipPath>
          <mask :id="`${uid}-root-outlet`" maskUnits="userSpaceOnUse" x="300" y="0" width="450" height="480"><rect x="300" width="450" height="480" fill="white" /><path d="M586 410 599 407 628 437 648 459 620 460 602 435Z" fill="black" /></mask>
          <g :id="`${uid}-acorn`"><path d="M-12-3 11-5 12 6 5 16-1 19-10 12-14 4Z" fill="#bf8247" /><path d="M-12-3-1-2 0 18-10 12-14 4Z" fill="#dca661" /><path d="M-14-5-7-12 6-13 14-6 13-1-13 2Z" fill="#675137" /><path d="M-13-4 0-8 13-5M-7-10-4-5 1-9 6-5 9-8" fill="none" stroke="#a28b58" stroke-width="1.5" /><path d="M0-12 2-19 5-20 4-12Z" fill="#675137" /><path d="m3 3 5-2-2 8-3 3Z" fill="#ebbc78" opacity=".7" /></g>
          <g :id="`${uid}-leaf`"><path d="M0 0C-31-3-39-22-27-39-7-36 5-19 0 0Z" fill="currentColor" /><path d="M0 0-24-32" stroke="#f5e2ae" stroke-width="1" opacity=".6" /></g>
          <g :id="`${uid}-fir`"><path d="M0-132-50-48-30-50-67 2-39-4-72 46H64L36-5 59 1 26-51 43-46Z" fill="currentColor" /><path d="M0-132-2 46H64L36-5 59 1 26-51 43-46Z" fill="#fff" opacity=".07" /><path d="M-2 26v37" stroke="currentColor" stroke-width="8" /></g>
        </defs>
        <!-- The paper frame stays still while the whole diorama pulls back. -->
        <path d="M44 90Q43 52 83 49L915 33Q970 35 974 85L994 574Q996 620 945 628L86 647Q35 647 36 598Z" fill="var(--paper-frame-shadow)" />
        <g :clip-path="`url(#${uid}-frame)`">
          <path d="M0 0H1000V660H0Z" :fill="`url(#${uid}-sky)`" />
          <g data-part="camera" class="paper-camera">
            <circle cx="765" cy="167" r="54" fill="var(--paper-sun)" />
            <path d="M-220 313 63 177 156 221 314 141 432 244 593 215 793 316 1110 216V740H-220Z" fill="var(--paper-mountain-far)" />
            <path d="m63 177 93 44 158-80-55 103-65 23-118-31-169 118Z" fill="var(--paper-mountain-fold)" />
            <path d="M-160 359 67 281 248 313 382 263 487 307 646 283 823 344 1110 271V740H-160Z" fill="var(--paper-mountain-near)" />
            <g opacity=".5" color="var(--paper-fir-far)"><use :href="`#${uid}-fir`" transform="translate(145 360) scale(.74)" /><use :href="`#${uid}-fir`" transform="translate(241 330) scale(.48)" /><use :href="`#${uid}-fir`" transform="translate(803 360) scale(.7)" /><use :href="`#${uid}-fir`" transform="translate(873 340) scale(.48)" /><use :href="`#${uid}-fir`" transform="translate(919 374) scale(.86)" /></g>
            <path d="M-200 408Q77 331 316 378T729 366Q865 335 1170 403V740H-200Z" fill="var(--paper-ground-back)" />
            <path d="M-220 495Q151 351 432 431T1020 441V751H-220Z" fill="var(--paper-ground)" />
            <!-- The river is below the close-up crop until the reveal. -->
            <path d="M550 435C655 419 655 451 744 459S900 472 1020 449V663H261C297 557 379 522 465 506S516 459 550 435Z" :fill="`url(#${uid}-water)`" />
            <path d="M550 435C655 419 655 451 744 459S900 472 1020 449" fill="none" stroke="var(--paper-water-edge)" stroke-width="7" />
            <g :clip-path="`url(#${uid}-river-clip)`">
              <g data-part="current" fill="none" stroke="var(--paper-ripple)" stroke-linecap="round"><path d="M351 535q50-15 103-9m69-35q50-13 109 1m37-24q41 5 76 2m23 31q45 10 91 4m-455 63q50-11 104-4m53-16q47-7 93 2m33 32q45 12 91 5m54-41q50 12 100 1m-574 58q64-12 128-4m111 17q66 0 134 14m32-47q50 10 105 0m44-76q42 5 80-3" stroke-width="2.2" opacity=".62" /><path d="M592 466h29m72 70h57m-252 47h43m324-63h28m-481 33h28m425 61h57m-400 28h65m326-71h27" stroke-width="1" opacity=".68" /></g>
            </g>
            <!-- Bank layers hide the drifting resets. -->
            <path d="M-210 479Q74 375 303 411L485 417 586 432 562 460 511 469 497 493 386 526 242 565-203 594Z" fill="var(--paper-bank-shadow)" />
            <path d="M-210 456Q38 371 267 399L485 409 587 432 553 444 500 447 472 476 373 502 238 537-200 574Z" fill="var(--paper-bank)" />
            <path d="m224 472 105-16 59 9-118 27Z" fill="var(--paper-bank-fold)" />
            <path d="M40 457q61-12 126-11m88-12 66-8m-164 57 42-7m167-33 25-6" fill="none" stroke="var(--paper-grass)" stroke-width="2" opacity=".5" />
            <path d="M578 388C592 395 607 413 621 435S638 460 655 476L635 490C620 467 609 449 602 434S578 408 567 401Z" :fill="`url(#${uid}-water)`" />
            <!-- Drifters are above water but behind the trunk; the tree masks their entry. -->
            <g data-part="drifters" :clip-path="`url(#${uid}-drift-clip)`">
              <g v-for="(nut, index) in driftwood" :key="index" :data-drifter="index" :transform="`translate(${nut.x} ${nut.y})`"><ellipse cx="2" cy="13" rx="22" ry="3" fill="var(--paper-ripple)" opacity=".3" /><g :transform="`rotate(${nut.angle}) scale(${nut.scale})`"><use :href="`#${uid}-acorn`" /></g></g>
            </g>
            <!-- The cut in the root exposes the same water and acorns underneath. -->
            <g data-part="tree" :filter="`url(#${uid}-paper-shadow)`" :mask="`url(#${uid}-root-outlet)`">
              <path d="M456 44 570 33 582 161 649 109 682 114 591 224 591 327 612 400 651 434 572 432 548 417 493 435 426 439 465 402 477 327 468 229 427 186 375 179 351 145 440 156 467 177Z" :fill="`url(#${uid}-bark)`" />
              <path d="m456 44 26 133 13 154-23 79-46 29 67-4 28-47-6-202-19-148Z" fill="#cf9b67" />
              <path d="m545 37 14 147-7 103 23 91-3 54 79 2-39-34-21-73V224l91-110-33-5-67 52-12-128Z" fill="#865939" />
              <path d="m516 47 14 145-7 51m-35-39 14 77-5 51m83-131 25-20 31-41m-168 46-25-16-27-7m114 91-2 29" fill="none" stroke="#5e422f" stroke-width="3" opacity=".42" />
              <path d="m481 60 12 108m14 31 4 37m-27 126-10 42m114-11 19 25" stroke="#e2b77d" stroke-width="2" opacity=".65" />
              <path d="M522 269Q560 253 576 289L582 352 568 387 510 386 497 362 502 297Z" fill="#70452f" />
              <path d="M528 281Q555 265 567 297L574 350 562 374 514 374 507 353 511 303Z" :fill="`url(#${uid}-hole)`" />
              <path d="m516 303 12-22 15-6-17 25-8 51 7 24-11-1-7-21Z" fill="#432f24" />
              <path d="m569 377 15 6 4 15 15 9-14 8-20-19Z" fill="#352f27" /><path d="m577 381 5 11 16 17-8 2-12-14-9-20Z" fill="#c39666" />
            </g>
            <ellipse data-part="actor-shadow" class="paper-actor-shadow" cx="-35" cy="0" rx="70" ry="8" fill="#503c28" opacity=".13" />
            <!-- One articulated squirrel, from the first hop to the last sigh. -->
            <g data-part="squirrel" class="paper-squirrel">
              <!-- Planted feet live outside the torso and its breathing motion. -->
              <g data-part="back-foot" class="paper-back-foot"><path d="m-56-28 23 3-5 20-11 7-13-8Z" fill="#a25a39" /><path d="m-57-13-5 10 9 6 30-1 3-8-19-11Z" fill="#874b32" /></g>
              <g data-part="front-foot" class="paper-front-foot"><path d="m-24-27 17 1 7 22-13 3-12-13Z" fill="#ba6c42" /><path d="m-9-15 4 8 23 5 3 7-36-1-9-9Z" fill="#aa5d3b" /></g>
              <!-- One torso transform carries the neck, head, arms and held acorn. -->
              <g data-part="body" class="paper-body"><g data-part="breath" class="paper-breath">
              <g data-part="tail" class="paper-tail">
                <path d="M-53-25-84-15-116-30-137-61-141-99-128-137-99-161-65-159-46-139-49-115-70-100-91-102-101-90-96-73-77-58-55-50Z" fill="#ac5739" />
                <path d="m-137-61-4-38 13-38 29-24 34 2-28 18-20 31-3 29 14 34 25 17-7 15-32-15Z" fill="#da8954" />
                <path d="m-99-161 34 2 19 20-3 24-21 15-21-2 25-19-4-20Z" fill="#efb979" />
                <path d="m-93-141-20 31-3 29 14 34 25 17-19-43-5-17 10-12 21 2-13-13Z" fill="#c66c42" />
                <path d="m-128-132 15 22m-3 29-21 20m44-80 23 0m-32 94-14 17" stroke="#ffe0a2" stroke-width="1.2" fill="none" opacity=".5" />
              </g>
              <g data-part="torso"><path d="M-49-91-19-87 0-62 4-34-12-11-41-9-65-28-68-56Z" fill="#d8864f" /><path d="m-49-91-19 35 3 28 24 19-3-32 7-35 18-11Z" fill="#bb653e" /><path d="m-20-86 18 23 6 29-16 23-14-4-9-26 4-27Z" fill="#f5d39a" /><path d="m-37-76-7 35 3 32 15-6-9-26 4-27Z" fill="#eaa668" /><path d="m-66-54 22 13-4 20m46-42-22 19" fill="none" stroke="#f7bf7d" stroke-width="1.1" opacity=".8" /></g>
              <path data-part="neck" d="M-35-91-20-98 3-84 4-70-13-65-36-77Z" fill="#d8864f" />
              <g data-part="head" class="paper-head">
                <path d="m-32-111-3-36 17 15 8 27Z" fill="#c87748" /><path d="m-25-121-6-20 10 11 7 20Z" fill="#f0b780" /><path d="m-9-115 8-32 12 13-3 27Z" fill="#e8a267" /><path d="m-3-122 4-19 6 10-4 16Z" fill="#8d5139" />
                <path d="M-32-112-10-126 11-118 22-99 41-91 30-78 5-76-17-85-33-96Z" fill="#e39a5d" /><path d="m-32-112 22-14-7 41-16-11Z" fill="#bd6940" /><path d="m11-118 11 19 19 8-11 13-25 2 2-14 10-7Z" fill="#f7d7a1" /><path d="m-10-126 21 8 6 21-17-9Z" fill="#efb577" /><path d="m35-95 9 3-3 7-7-3Z" fill="#45372e" />
                <ellipse cx="11" cy="-105" rx="4.1" ry="5" fill="#342e27" /><circle cx="12" cy="-106.5" r="1.3" fill="#fff8df" />
                <path data-part="eyelid" class="paper-eyelid" d="m5-112 12 2-2 6-10-4Z" fill="#d48954" /><path data-part="brow" class="paper-brow" d="m7-114 8 2" stroke="#754c34" stroke-width="1.7" stroke-linecap="round" /><path d="m22-83 7-1m-32-9-11-2" fill="none" stroke="#9d6945" stroke-width="1.2" stroke-linecap="round" />
              </g>
              <g data-part="cradle" class="paper-cradle">
                <path d="M-5-69 6-63 13-46 27-42 25-35 7-38-9-55Z" fill="#ac5c3b" />
                <g data-part="held-acorn"><use :href="`#${uid}-acorn`" transform="translate(20 -54) rotate(14) scale(.94)" /></g>
                <g data-part="arm"><path d="m-10-75 12 7 8 12 17-2 4 7-22 8-17-11-10-11Z" fill="#bf6c43" /><path d="m-10-75 12 7 8 12-9 3-15-15Z" fill="#edab6e" /><path d="m18-56 3 6m-7-5 3 6" stroke="#7f4a32" stroke-width="1" /></g>
              </g>
            </g></g></g>
            <!-- The hollow stays empty throughout the story. -->
            <path d="m569 282 8 10 5 60-14 35-11-1 10-22 3-28-4-34Z" fill="#b58052" /><path d="m513 374 21 6 23-3 11 10-22 9-39-9-7-13Z" fill="#c89662" /><path d="m507 387 39 9 22-9-10 13-36-4Z" fill="#805538" />
            <!-- Overlapping canopy pieces with visible folds and paper shadows. -->
            <g :filter="`url(#${uid}-paper-shadow)`">
              <path d="m315 4 79-52 101 20 57 67-29 104-126 27-108-62Z" fill="var(--paper-leaf-dark)" /><path d="m552-31 97 12 70 76-21 89-100 18-83-54-18-68Z" fill="var(--paper-leaf-dark)" />
              <path d="m315 4 79-52 101 20-63 66-39 95-104-21Z" fill="var(--paper-leaf-mid)" /><path d="m432 38 63-66 57 67-29 104-130-14Z" fill="var(--paper-leaf-light)" /><path d="m552-31 97 12 70 76-109 32-95 21-18-68Z" fill="var(--paper-leaf-mid)" /><path d="m719 57-21 89-100 18 12-75Z" fill="var(--paper-leaf-light)" />
              <path d="m259 91 57-69 104 11 45 60-31 87-110 19-70-44Z" fill="var(--paper-leaf-gold)" /><path d="m259 91 165 14 10 75-110 19-70-44Z" fill="var(--paper-leaf-mid)" /><path d="m316 22 108 83-165-14Z" fill="var(--paper-leaf-pale)" />
              <path d="m434 102 71-55 88 29 21 68-64 70-93-27-37-45Z" fill="var(--paper-leaf-gold)" /><path d="m505 47 9 100 36 67 64-70-21-68Z" fill="var(--paper-leaf-pale)" /><path d="m434 102 80 45 36 67-93-27-37-45Z" fill="var(--paper-leaf-mid)" />
              <path d="m617 108 44-51 80 23 39 61-19 58-95 23-71-53Z" fill="var(--paper-leaf-mid)" /><path d="m661 57 43 91 57 51-95 23-71-53 22-61Z" fill="var(--paper-leaf-gold)" /><path d="m704 148 76-7-19 58Z" fill="var(--paper-leaf-pale)" />
              <path d="m316 22 108 83 10 75m71-133 9 100 36 67m147-72-31 80" fill="none" stroke="#ffebbc" stroke-width="1.5" opacity=".38" />
            </g>
            <g color="var(--paper-leaf-gold)"><use :href="`#${uid}-leaf`" transform="translate(346 438) rotate(120) scale(.62)" /></g>
            <g fill="var(--paper-grass)"><path d="m228 435-6-31 15 26 2-40 8 42 19-15-10 26Z" /><path d="m663 436 3-27 7 25 12-14-7 22Z" /><path d="m362 456-3-19 9 15 5-24 4 24Z" /></g>
            <path d="M-200 634Q47 543 223 590L349 650 1113 680V880H-200Z" fill="var(--paper-foreground)" />
            <g color="var(--paper-foreground)"><use :href="`#${uid}-fir`" transform="translate(46 562) scale(1.48)" /></g>
            <g color="var(--paper-leaf-mid)"><use :href="`#${uid}-leaf`" transform="translate(197 603) rotate(38) scale(1.3)" /><use :href="`#${uid}-leaf`" transform="translate(212 612) rotate(100) scale(1.1)" /></g>
            <path d="M-100-100H1200V800H-100Z" :fill="`url(#${uid}-grain)`" pointer-events="none" />
          </g>
          <path d="M40 78 43 581Q44 614 80 613" fill="none" stroke="#fff8de" stroke-width="2" opacity=".35" />
        </g>
        <g class="paper-scene__edition" fill="var(--apple-secondary)" font-size="10" letter-spacing="2"><text x="44" y="20">ACORN AWAY</text><text x="942" y="650" text-anchor="end">PAPER TALES — 01</text></g>
      </svg>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Pause, Play, RotateCcw } from 'lucide-vue-next'
import { useApple } from '../../src'
import { resolveMotion } from '../../src/core/context'
import { createPaperStory, type PaperStory } from './not-found-paper-story'

const uid = `paper-${useId().replace(/:/g, '')}`
const apple = useApple()
const scene = ref<HTMLElement>()
const art = ref<SVGSVGElement>()
const media = typeof window === 'undefined' ? undefined : window.matchMedia('(prefers-reduced-motion: reduce)')
const systemReduced = ref(media?.matches ?? false)
const motion = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced || systemReduced.value))
const canAnimate = computed(() => motion.value === 'full')
const dark = computed(() => apple.theme.value.current.scheme === 'dark')
const userPaused = ref(false)
const hidden = ref(typeof document !== 'undefined' && document.hidden)
const offscreen = ref(false)
const suspended = computed(() => userPaused.value || hidden.value || offscreen.value)
const story = ref<'intro' | 'settled' | 'static'>('static')
const driftwood = [{ x: 630, y: 482, angle: 18, scale: .68 }, { x: 737, y: 508, angle: -26, scale: .82 }, { x: 838, y: 543, angle: 51, scale: .72 }, { x: 933, y: 568, angle: -13, scale: .9 }, { x: 529, y: 550, angle: -39, scale: .65 }]
let player: PaperStory | undefined
let observer: IntersectionObserver | undefined
let mounted = false
function syncPlayback() { player?.setPaused(suspended.value) }
function stop() { player?.dispose(); player = undefined }
function play(intro: boolean) {
  stop()
  if (!mounted || !art.value || !scene.value || !canAnimate.value) { story.value = 'static'; return }
  story.value = intro ? 'intro' : 'settled'
  player = createPaperStory(art.value, scene.value, intro, () => { story.value = 'settled' })
  syncPlayback()
}
function replay() { userPaused.value = false; play(true) }
function togglePause() { userPaused.value = !userPaused.value }
function visibilityChanged() { hidden.value = document.hidden }
function mediaChanged() { systemReduced.value = media?.matches ?? false }
watch(suspended, syncPlayback, { flush: 'sync' })
watch(canAnimate, enabled => {
  if (!mounted) return
  // Changing a preference never forces the entrance story to repeat.
  if (enabled) play(false)
  else { stop(); story.value = 'static' }
}, { flush: 'post' })
onMounted(async () => {
  mounted = true
  document.addEventListener('visibilitychange', visibilityChanged)
  media?.addEventListener('change', mediaChanged)
  if (typeof IntersectionObserver !== 'undefined' && scene.value) {
    observer = new IntersectionObserver(([entry]) => { offscreen.value = !entry.isIntersecting }, { threshold: 0 })
    observer.observe(scene.value)
  }
  // The provider restores persisted motion preferences in its mounted hook.
  await nextTick()
  if (mounted) play(true)
})
onBeforeUnmount(() => {
  mounted = false
  stop()
  observer?.disconnect()
  media?.removeEventListener('change', mediaChanged)
  document.removeEventListener('visibilitychange', visibilityChanged)
})
</script>

<style scoped>
.paper-scene { --paper-sky-top: #f4ead8; --paper-sky: #e8e3c9; --paper-sun: #fdf6d5; --paper-frame-shadow: #d4cbbb; --paper-mountain-far: #dadcc1; --paper-mountain-fold: #e5e2ca; --paper-mountain-near: #bcc7ac; --paper-fir-far: #869981; --paper-ground-back: #aebc91; --paper-ground: #c5c69d; --paper-bank: #d3c99e; --paper-bank-fold: #c2bb8c; --paper-bank-shadow: #9e9b79; --paper-water-light: #adcaca; --paper-water: #78a7ac; --paper-water-edge: #d6dfc7; --paper-ripple: #e2efdf; --paper-grass: #89966c; --paper-leaf-dark: #8e814a; --paper-leaf-mid: #b5a460; --paper-leaf-light: #c5b574; --paper-leaf-gold: #d2b16b; --paper-leaf-pale: #e2c384; --paper-foreground: #76866a; margin: 0; position: relative; }
.paper-scene--dark { --paper-sky-top: #253536; --paper-sky: #354a47; --paper-sun: #ddcd9d; --paper-frame-shadow: #121d1f; --paper-mountain-far: #3a5149; --paper-mountain-fold: #3f5850; --paper-mountain-near: #466357; --paper-fir-far: #78917b; --paper-ground-back: #60795c; --paper-ground: #788462; --paper-bank: #9c9d72; --paper-bank-fold: #868b61; --paper-bank-shadow: #606e54; --paper-water-light: #638e8f; --paper-water: #355e6a; --paper-water-edge: #a1b59b; --paper-ripple: #b1d1c7; --paper-grass: #526c4b; --paper-leaf-dark: #696b40; --paper-leaf-mid: #8b8c50; --paper-leaf-light: #a3a066; --paper-leaf-gold: #ae985c; --paper-leaf-pale: #c0ac71; --paper-foreground: #334e42; }
.paper-scene__window { overflow: hidden; padding: 4px; }
.paper-scene__art { display: block; width: 100%; height: auto; overflow: visible; }
.paper-camera { transform-origin: 0 0; }
.paper-squirrel { transform: translate(462px, 428px) scale(.8); }
.paper-actor-shadow { transform: translate(462px, 432px) scale(.8); transform-origin: 0 0; }
.paper-tail { transform: rotate(-51deg); transform-origin: -64px -21px; }
.paper-body { transform: translate(-7px, 2px) rotate(9deg) scale(1.04, .9); transform-origin: -38px 0; }
.paper-breath { transform-origin: -38px 0; }
.paper-head { transform: rotate(18deg); transform-origin: -19px -88px; }
.paper-cradle { transform: rotate(-6deg); transform-origin: -10px -66px; }
.paper-back-foot { transform-origin: -24px 3px; }
.paper-front-foot { transform: translate(9px, 0px); transform-origin: 18px 5px; }
.paper-eyelid { opacity: 1; }
.paper-brow { transform: rotate(12deg); transform-origin: 10px -113px; }
.paper-scene__caption { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 46px; padding-inline: 4.5%; margin-top: 10px; }
.paper-scene__story-label { position: relative; flex: 1; min-width: 0; height: 20px; font-size: 11px; color: var(--apple-secondary); letter-spacing: .015em; }
.paper-caption { position: absolute; inset: 0 auto auto 0; white-space: nowrap; opacity: 0; }
.paper-caption--last { opacity: 1; }
.paper-scene__controls { display: flex; align-items: center; gap: 0; flex-shrink: 0; }
.paper-scene__controls .apple-button { color: var(--apple-secondary); font-size: 10px; min-height: 44px; }
.paper-scene__controls .apple-button--icon { width: 36px; }
.paper-scene__replay { padding-inline: 7px; }
.paper-scene__controls :deep(svg) { width: 13px; height: 13px; }
.paper-scene__still { font-size: 10px; color: var(--apple-secondary); }
@media (max-width: 880px) { .paper-scene__window { margin-inline: -12px; } .paper-scene__caption { margin-top: 0; padding-inline: 2%; } }
@media (max-width: 420px) { .paper-scene__story-label { font-size: 9px; letter-spacing: 0; } .paper-scene__caption { padding-inline: 0; gap: 2px; } .paper-scene__edition { font-size: 12px; } .paper-scene__controls .apple-button { font-size: 9px; } }
</style>
