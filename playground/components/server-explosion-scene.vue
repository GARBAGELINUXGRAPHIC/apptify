<template>
  <figure ref="root" class="server-explosion-scene" :class="{ 'is-dark': dark, 'is-sent': sent, 'is-exploded': exploded, 'is-shocked': shocked, 'is-static': reduced }">
    <div class="scene-window">
      <svg ref="art" class="scene-art" viewBox="48 112 790 490" role="img" aria-labelledby="server-story-title server-story-desc" xmlns="http://www.w3.org/2000/svg">
        <title id="server-story-title">猴子送包裹导致服务器爆炸</title>
        <desc id="server-story-desc">猴子把包裹送进服务器，服务器爆炸起火，猴子震惊地双手抱头。</desc>
        <defs>
          <linearGradient id="srv-wall" x2="0" y2="1"><stop stop-color="var(--srv-wall-top)"/><stop offset="1" stop-color="var(--srv-wall)"/></linearGradient>
          <linearGradient id="srv-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b9b8a6"/><stop offset=".5" stop-color="#858e83"/><stop offset="1" stop-color="#6e7a73"/></linearGradient>
          <linearGradient id="srv-box" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8c995"/><stop offset="1" stop-color="#bd9361"/></linearGradient>
          <filter id="srv-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="1" dy="7" stdDeviation="5" flood-color="#514a3c" flood-opacity=".2"/></filter>
          <filter id="srv-soft"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#514a3c" flood-opacity=".18"/></filter>
          <pattern id="srv-grain" width="43" height="39" patternUnits="userSpaceOnUse"><path d="m5 8 .7-.3m22 17 .8-.3m9-14 .6-.3M13 33l.7-.3" stroke="#65583f" stroke-opacity=".12"/><path d="m18 5 1-.4m17 27 .8-.3" stroke="#fff8e8" stroke-opacity=".35"/></pattern>
          <clipPath id="srv-frame"><path d="M30 55Q30 24 65 23L1130 17Q1170 17 1176 56L1191 656Q1191 689 1150 695L67 704Q29 704 29 665Z"/></clipPath>
        </defs>
        <path d="M39 61Q39 31 72 30L1136 24Q1177 24 1183 63L1198 661Q1198 697 1157 703L74 712Q38 712 38 672Z" fill="var(--srv-frame-shadow)"/>
        <g clip-path="url(#srv-frame)">
          <path d="M0 0H1200V720H0Z" fill="url(#srv-wall)"/>
          <circle cx="1000" cy="120" r="90" fill="var(--srv-light)" opacity=".45"/>
          <path d="M0 490Q230 450 460 485T900 470T1200 485V720H0Z" fill="var(--srv-floor)"/>
          <path d="M0 548Q300 512 610 540T1200 520" fill="none" stroke="var(--srv-floor-line)" stroke-width="3" opacity=".55"/>
          <path d="M0 595Q350 560 700 585T1200 570" fill="none" stroke="var(--srv-floor-line)" stroke-width="2" opacity=".3"/>
          <g opacity=".45" fill="none" stroke="var(--srv-wall-line)" stroke-width="2">
            <path d="M0 160H1200M0 178H1200M0 196H1200"/>
            <path d="M110 0V430M1080 0V430"/>
          </g>
          <g class="server-shadow"><ellipse cx="835" cy="604" rx="245" ry="34" fill="#625b49" opacity=".18"/></g>

          <!-- Server cabinet -->
          <g class="server-cabinet" filter="url(#srv-shadow)">
            <path d="M700 126 950 113 1067 153 1067 576 950 619 700 590Z" fill="#6e786e"/>
            <path d="M700 126 950 113 950 577 700 590Z" fill="url(#srv-metal)"/>
            <path d="M950 113 1067 153 1067 576 950 619Z" fill="#727e75"/>
            <path d="M716 145 934 134 934 557 716 572Z" fill="#46534e"/>
            <path d="M950 136 1050 169 1050 555 950 584Z" fill="#59675e"/>
            <path d="M729 160 920 151 920 245 729 254Z" fill="#34443f"/>
            <path d="M729 268 920 260 920 354 729 362Z" fill="#34443f"/>
            <path d="M729 377 920 370 920 464 729 472Z" fill="#34443f"/>
            <path d="M729 486 920 479 920 544 729 551Z" fill="#34443f"/>
            <g fill="#8b9b85">
              <path d="M746 176h150v5H746Zm0 12h150v5H746Zm0 12h150v5H746Zm0 12h150v5H746Z"/>
              <path d="M746 284h150v5H746Zm0 12h150v5H746Zm0 12h150v5H746Zm0 12h150v5H746Z"/>
              <path d="M746 393h150v5H746Zm0 12h150v5H746Zm0 12h150v5H746Zm0 12h150v5H746Z"/>
              <path d="M746 501h150v5H746Zm0 12h150v5H746Z"/>
            </g>
            <g fill="#d6c18d"><circle cx="904" cy="168" r="4"/><circle cx="904" cy="277" r="4"/><circle cx="904" cy="386" r="4"/><circle cx="904" cy="495" r="4"/></g>
            <g fill="#a5b69a"><circle cx="747" cy="239" r="4"/><circle cx="747" cy="348" r="4"/><circle cx="747" cy="457" r="4"/><circle cx="747" cy="536" r="4"/></g>
            <path d="M700 126 950 113 950 133 700 147Z" fill="#d0c7ad"/>
            <path d="M700 590 950 577 950 600 700 614Z" fill="#7c877c"/>
            <path d="M950 577 1067 535 1067 576 950 619Z" fill="#5d6b62"/>
            <path d="M712 148 712 566" stroke="#e1d8bc" stroke-width="3" opacity=".45"/>
            <path d="M942 128 942 591" stroke="#d9d0b8" stroke-width="3" opacity=".4"/>
          </g>

          <!-- Monkey -->
          <g class="monkey" filter="url(#srv-soft)">
            <ellipse cx="305" cy="590" rx="124" ry="17" fill="#665944" opacity=".16"/>
            <path d="M240 486Q209 515 218 569L228 596 379 596 391 562Q398 510 365 478Z" fill="#9a7654"/>
            <path d="M253 502Q240 546 257 585L292 590 286 513Z" fill="#b18b64"/>
            <path d="M344 503Q372 543 356 587L325 590 331 512Z" fill="#89694d"/>
            <path d="M230 580 286 581 293 604 224 604Z" fill="#6c5848"/>
            <path d="M322 581 378 578 386 603 318 604Z" fill="#6c5848"/>
            <path d="M236 398Q216 351 234 310Q251 272 303 274Q361 270 382 317Q402 364 372 424L365 493Q307 529 245 487Z" fill="#a87c55"/>
            <path d="M240 388Q226 335 259 302Q286 280 321 290Q273 314 269 371L278 479 248 477Z" fill="#c09367"/>
            <path d="M335 294Q382 316 379 369L365 474 339 486 349 376Q354 331 335 294Z" fill="#896849"/>
            <path d="M250 425Q303 452 366 422L359 480Q305 514 249 480Z" fill="#d4b58b"/>
            <!-- head and ears -->
            <circle cx="238" cy="248" r="39" fill="#956d4d"/>
            <circle cx="367" cy="248" r="39" fill="#956d4d"/>
            <circle cx="238" cy="248" r="23" fill="#d5a77d"/>
            <circle cx="367" cy="248" r="23" fill="#d5a77d"/>
            <path d="M238 240Q235 177 300 170Q370 169 374 242Q382 314 308 333Q239 323 238 240Z" fill="#a97d56"/>
            <path d="M257 250Q266 211 307 211Q350 211 360 253Q359 304 307 313Q258 306 257 250Z" fill="#e1c39b"/>
            <ellipse cx="282" cy="245" rx="7" ry="11" fill="#493d32"/>
            <ellipse cx="333" cy="245" rx="7" ry="11" fill="#493d32"/>
            <circle cx="284" cy="241" r="2.5" fill="#fff5dc"/><circle cx="335" cy="241" r="2.5" fill="#fff5dc"/>
            <ellipse cx="307" cy="276" rx="13" ry="9" fill="#554438"/>
            <path d="M294 292Q307 300 320 292" fill="none" stroke="#795a45" stroke-width="2.5" stroke-linecap="round"/>
            <!-- arms in delivery pose -->
            <g class="monkey-arm monkey-arm-left">
              <path d="M249 372Q215 387 204 421L187 452" fill="none" stroke="#a97d56" stroke-width="27" stroke-linecap="round"/>
              <path d="M249 372Q215 387 204 421" fill="none" stroke="#c09367" stroke-width="8" stroke-linecap="round"/>
              <ellipse cx="187" cy="452" rx="19" ry="14" fill="#d9ad83"/>
            </g>
            <g class="monkey-arm monkey-arm-right">
              <path d="M365 373Q401 383 422 412L450 399" fill="none" stroke="#a97d56" stroke-width="27" stroke-linecap="round"/>
              <path d="M365 373Q401 383 422 412" fill="none" stroke="#c09367" stroke-width="8" stroke-linecap="round"/>
              <ellipse cx="450" cy="399" rx="19" ry="14" fill="#d9ad83"/>
            </g>
            <path d="M258 339Q307 357 356 339" fill="none" stroke="#8d684a" stroke-width="3" opacity=".5"/>
            <!-- tail -->
            <path d="M370 510Q449 523 452 570Q453 612 416 608Q394 605 406 585" fill="none" stroke="#946d4d" stroke-width="17" stroke-linecap="round"/>
          </g>

          <!-- Packet -->
          <g class="packet" filter="url(#srv-soft)">
            <path d="M0 16 69 0 111 20 42 40Z" fill="#f0d8a9"/>
            <path d="M0 16 42 40 42 113 0 89Z" fill="#bd9464"/>
            <path d="M42 40 111 20 111 92 42 113Z" fill="url(#srv-box)"/>
            <path d="M42 40 57 35 57 105 42 113Z" fill="#d5ae79"/>
            <path d="m0 16 69-16 42 20-69 20Z" fill="#f2dcb4"/>
            <path d="m57 3 10 0 13 24-10 4Z" fill="#a77c54"/>
            <path d="M68 57h31v22H68Z" fill="#f3e8cd" opacity=".9"/>
            <path d="M72 63h22m-22 5h18m-18 5h14" stroke="#927653" stroke-width="2"/>
          </g>

          <!-- Explosion, revealed only on impact -->
          <g class="explosion">
            <path d="M936 247 964 207 984 248 1024 217 1019 268 1060 271 1028 309 1062 344 1010 351 1020 403 979 379 951 423 933 379 890 402 901 355 858 343 894 310 870 271 916 270Z" fill="#d98c55" stroke="#a96e4b" stroke-width="5"/>
            <path d="m945 270 25-34 17 37 29-20-10 42 35 7-34 26 24 31-43 1-2 41-29-28-27 33-9-40-40 11 22-34-34-21 40-14-14-38 40 13Z" fill="#f0c17b"/>
            <path d="M962 282 977 263 991 290 1014 284 1004 307 1027 321 1000 332 1004 357 981 345 964 365 958 340 933 346 945 323 925 309 951 301Z" fill="#f7dfaa"/>
            <g fill="#d38c57"><path d="m887 222 17-25 5 33Zm129-36 22-13-6 33Zm-162 191-25 11 29 12Zm187 50 18 22-31-5Z"/></g>
          </g>
          <!-- Flames -->
          <g class="flames">
            <path d="M735 560Q704 520 746 473Q740 520 777 525Q796 480 821 445Q829 503 852 520Q884 484 887 457Q914 511 886 560Z" fill="#c56e48"/>
            <path d="M798 562Q777 526 806 493Q807 526 828 533Q846 503 853 481Q877 526 860 562Z" fill="#e4a35e"/>
            <path d="M912 585Q892 548 927 511Q922 545 948 551Q969 516 977 495Q997 543 977 585Z" fill="#c56e48"/>
            <path d="M958 578Q947 553 966 536Q968 556 980 561Q992 544 997 530Q1009 559 995 578Z" fill="#edb66e"/>
            <path d="M710 566Q691 543 711 520Q716 543 729 547Q739 529 742 516Q759 546 746 566Z" fill="#e7a35d"/>
          </g>
          <g class="smoke">
            <circle cx="784" cy="428" r="27" fill="#8b8b7d"/><circle cx="831" cy="398" r="38" fill="#99988a"/><circle cx="887" cy="418" r="29" fill="#85887e"/>
          </g>
          <!-- Monkey hands rise to head -->
          <g class="shock-hands">
            <path d="M252 385Q218 349 239 304L260 274" fill="none" stroke="#a97d56" stroke-width="27" stroke-linecap="round"/>
            <path d="M252 385Q218 349 239 304" fill="none" stroke="#c09367" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="260" cy="274" rx="20" ry="16" fill="#d9ad83"/>
            <path d="M363 384Q396 345 374 304L354 274" fill="none" stroke="#956d4d" stroke-width="27" stroke-linecap="round"/>
            <path d="M363 384Q396 345 374 304" fill="none" stroke="#b88b62" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="354" cy="274" rx="20" ry="16" fill="#d9ad83"/>
            <path d="M250 267q-5-13 4-19m-1 27q-7-9-4-18m109 10q7-13-2-20m-1 28q8-9 5-18" fill="none" stroke="#8c6648" stroke-width="2.2" stroke-linecap="round"/>
          </g>
          <path d="M0 0H1200V720H0Z" fill="url(#srv-grain)" pointer-events="none"/>
        </g>
        <path d="M40 60 43 581Q44 614 80 613" fill="none" stroke="#fff8de" stroke-width="2" opacity=".35"/>
        <g fill="var(--srv-caption)" font-size="10" letter-spacing="2"><text x="56" y="42">UNEXPECTED DELIVERY</text><text x="1140" y="674" text-anchor="end">PAPER TALES — 03</text></g>
      </svg>
    </div>
    <button v-if="canAnimate" class="scene-pause" type="button" :aria-label="paused ? '继续动画' : '暂停动画'" :aria-pressed="paused" @click="paused = !paused">
      <Play v-if="paused" :size="12" aria-hidden="true" /><Pause v-else :size="12" aria-hidden="true" />
    </button>
  </figure>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Pause, Play } from 'lucide-vue-next'
import { useApple } from '../../src'
import { resolveMotion } from '../../src/core/context'

const uid = useId()
const apple = useApple()
const root = ref<HTMLElement>()
const art = ref<SVGSVGElement>()
const paused = ref(false)
const hidden = ref(typeof document !== 'undefined' && document.hidden)
const offscreen = ref(false)
const sent = ref(false)
const exploded = ref(false)
const shocked = ref(false)
const dark = computed(() => apple.theme.value.current.scheme === 'dark')
const media = typeof window === 'undefined' ? undefined : window.matchMedia('(prefers-reduced-motion: reduce)')
const systemReduced = ref(media?.matches ?? false)
const reduced = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced || systemReduced.value) !== 'full')
const canAnimate = computed(() => !reduced.value)
const suspended = computed(() => paused.value || hidden.value || offscreen.value)
let timers: ReturnType<typeof setTimeout>[] = []
let observer: IntersectionObserver | undefined
let mounted = false
let cameraFrame = 0

function later(fn: () => void, delay: number) {
  timers.push(setTimeout(() => { if (mounted) fn() }, delay))
}
function clearTimers() {
  timers.forEach(clearTimeout)
  timers = []
}
function setCameraZoom() {
  const svg = art.value
  if (!svg) return
  const from = { x: 48, y: 112, w: 790, h: 490 }
  const to = { x: 0, y: 0, w: 1200, h: 720 }
  const start = performance.now()
  const duration = 1800
  const tick = (now: number) => {
    if (!mounted || suspended.value) { cameraFrame = requestAnimationFrame(tick); return }
    const t = Math.min(1, (now - start) / duration)
    const eased = 1 - Math.pow(1 - t, 3)
    const x = from.x + (to.x - from.x) * eased
    const y = from.y + (to.y - from.y) * eased
    const w = from.w + (to.w - from.w) * eased
    const h = from.h + (to.h - from.h) * eased
    svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`)
    if (t < 1) cameraFrame = requestAnimationFrame(tick)
  }
  cancelAnimationFrame(cameraFrame)
  cameraFrame = requestAnimationFrame(tick)
}
function startStory() {
  clearTimers()
  sent.value = false
  exploded.value = false
  shocked.value = false
  art.value?.setAttribute('viewBox', '48 112 790 490')
  if (!canAnimate.value) {
    sent.value = true
    exploded.value = true
    shocked.value = true
    art.value?.setAttribute('viewBox', '0 0 1200 720')
    return
  }
  later(() => { sent.value = true }, 900)
  later(() => { exploded.value = true }, 2200)
  later(() => { shocked.value = true; setCameraZoom() }, 2500)
}
function visibilityChanged() { hidden.value = document.hidden }
function mediaChanged() { systemReduced.value = media?.matches ?? false }
watch(() => suspended.value, value => {
  if (value) clearTimers()
  else if (!sent.value || !exploded.value || !shocked.value) startStory()
}, { flush: 'sync' })
watch(canAnimate, () => startStory())
onMounted(() => {
  mounted = true
  document.addEventListener('visibilitychange', visibilityChanged)
  media?.addEventListener('change', mediaChanged)
  if (typeof IntersectionObserver !== 'undefined' && root.value) {
    observer = new IntersectionObserver(([entry]) => { offscreen.value = !entry.isIntersecting }, { threshold: 0 })
    observer.observe(root.value)
  }
  startStory()
})
onBeforeUnmount(() => {
  mounted = false
  clearTimers()
  cancelAnimationFrame(cameraFrame)
  observer?.disconnect()
  document.removeEventListener('visibilitychange', visibilityChanged)
  media?.removeEventListener('change', mediaChanged)
})
</script>

<style scoped>
.server-explosion-scene {
  --srv-wall-top:#f2ead9;--srv-wall:#e5dfc9;--srv-frame-shadow:#d2c9b7;--srv-wall-line:#c9c0aa;
  --srv-light:#fff1c8;--srv-floor:#cfc3a4;--srv-floor-line:#ad9e7d;--srv-caption:#77766b;
  position:relative;min-width:0;margin:0;
}
.server-explosion-scene.is-dark {
  --srv-wall-top:#263938;--srv-wall:#344943;--srv-frame-shadow:#172523;--srv-wall-line:#52665a;
  --srv-light:#d8bd80;--srv-floor:#77745d;--srv-floor-line:#5c5b48;--srv-caption:#aab2a0;
}
.scene-window{overflow:hidden;padding:4px}
.scene-art{display:block;width:100%;height:auto;overflow:visible}
.server-cabinet{transform-box:fill-box;transform-origin:50% 50%;transition:transform .2s ease}
.packet{transform:translate(430px,390px);opacity:1;transition:transform 1.1s cubic-bezier(.2,.7,.2,1),opacity .12s linear .98s}
.is-sent .packet{transform:translate(735px,305px) rotate(12deg) scale(.52);opacity:0}
.explosion{opacity:0;transform:scale(.3);transform-origin:970px 320px;transition:opacity .12s ease,transform .28s cubic-bezier(.15,.8,.2,1)}
.is-exploded .explosion{opacity:1;transform:scale(1)}
.is-exploded .server-cabinet{animation:server-rattle .48s ease-in-out 2}
.flames{opacity:0;transform-origin:850px 560px}
.is-exploded .flames{opacity:1;animation:flame-dance .85s ease-in-out infinite alternate}
.smoke{opacity:0}
.is-exploded .smoke{opacity:.52;animation:smoke-rise 2.8s ease-in-out infinite alternate}
.monkey-arm{transition:opacity .15s ease}
.shock-hands{opacity:0;transform:translateY(28px);transition:opacity .35s ease,transform .45s cubic-bezier(.2,.8,.2,1)}
.is-shocked .monkey-arm{opacity:0}
.is-shocked .shock-hands{opacity:1;transform:translateY(0)}
.scene-pause{position:absolute;right:1.5%;bottom:-5px;width:32px;height:32px;padding:0;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;color:var(--apple-secondary);cursor:pointer}
.scene-pause:hover{background:var(--apple-hover)}
.scene-pause:focus-visible{outline:2px solid var(--apple-accent);outline-offset:2px}
@keyframes server-rattle{0%,100%{transform:translateX(0) rotate(0)}20%{transform:translateX(-5px) rotate(-.6deg)}45%{transform:translateX(4px) rotate(.5deg)}70%{transform:translateX(-2px) rotate(-.2deg)}}
@keyframes flame-dance{from{transform:scaleY(.91) skewX(-2deg)}to{transform:scaleY(1.08) skewX(2deg)}}
@keyframes smoke-rise{from{transform:translateY(12px);opacity:.24}to{transform:translateY(-20px);opacity:.65}}
@media(prefers-reduced-motion:reduce){.server-explosion-scene *{animation:none!important;transition:none!important}}
@media(max-width:880px){.scene-window{margin-inline:-12px}.scene-pause{right:-1%}}
@media(max-width:420px){.scene-pause{bottom:-8px}}
</style>
