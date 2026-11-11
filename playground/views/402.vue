<template>
  <main class="main-content paper-402-page">
    <apple-card class="paper-402-card" shadow="none" zoom="none">
      <template #title>
        <div class="paper-402-heading">
          <p class="paper-402-number" aria-hidden="true">402</p>
          <h1><span class="paper-402-sr-only">402 · </span>需要付款</h1>
          <p class="paper-402-english" lang="en">Payment Required</p>
        </div>
      </template>
      <p class="paper-402-copy">这位浣熊正看着你。<br />它觉得，你应该懂它的意思。</p>
      <div class="paper-402-actions">
        <router-link v-slot="{ href, navigate }" to="/" custom>
          <apple-button :href="href" @click="navigate">返回首页</apple-button>
        </router-link>
        <apple-link as="button" @click="goBack"><ArrowLeft :size="16" aria-hidden="true" /> 返回上一页</apple-link>
      </div>
    </apple-card>

    <figure class="raccoon-scene" :class="{ 'is-dark': scheme === 'dark' }">
      <div class="raccoon-scene__window">
        <svg class="raccoon-scene__art" viewBox="0 0 1000 650" role="img" xmlns="http://www.w3.org/2000/svg" :aria-labelledby="`${uid}-title ${uid}-desc`">
          <title :id="`${uid}-title`">一只向你讨钱的酷浣熊</title>
          <desc :id="`${uid}-desc`">一只正面看着观众的浣熊，戴着围巾，伸出一只手掌讨钱。它眨眼、呼吸，尾巴轻轻摆动，动画持续循环。</desc>
          <defs>
            <linearGradient :id="`${uid}-wall`" x2="0" y2="1">
              <stop stop-color="#eee6d4"/>
              <stop offset="1" stop-color="#ddd8c2"/>
            </linearGradient>
            <linearGradient :id="`${uid}-fur`" x2=".8" y2="1">
              <stop stop-color="#9ca69a"/>
              <stop offset="1" stop-color="#69786e"/>
            </linearGradient>
            <linearGradient :id="`${uid}-mask`" x2="0" y2="1">
              <stop stop-color="#424d49"/>
              <stop offset="1" stop-color="#273631"/>
            </linearGradient>
            <filter :id="`${uid}-shadow`" x="-30%" y="-30%" width="160%" height="170%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#514b3d" flood-opacity=".17"/>
            </filter>
            <filter :id="`${uid}-small-shadow`" x="-30%" y="-30%" width="160%" height="170%">
              <feDropShadow dx="1" dy="4" stdDeviation="3" flood-color="#514b3d" flood-opacity=".15"/>
            </filter>
            <pattern :id="`${uid}-grain`" width="38" height="38" patternUnits="userSpaceOnUse">
              <path d="m5 9 1-.4m18 17 .8-.3m9-18 1-.3m-22 26 .7-.3" stroke="#665b45" stroke-opacity=".12" stroke-width="1"/>
              <path d="m12 17 2-.5m16 13 1.5-.5" stroke="#fff9e8" stroke-opacity=".4" stroke-width="1"/>
            </pattern>
          </defs>

          <!-- Quiet, warm paper backdrop. -->
          <path d="M48 53 948 34Q969 34 973 57L957 588Q955 610 932 612L62 624Q35 622 36 598L27 79Q26 57 48 53Z" fill="#d2c9b5" opacity=".48"/>
          <path d="M48 43 948 25Q970 25 974 49L959 579Q957 601 934 603L62 615Q35 613 36 589L27 69Q26 47 48 43Z" :fill="`url(#${uid}-wall)`"/>
          <path d="M48 43 948 25Q970 25 974 49L959 579Q957 601 934 603L62 615Q35 613 36 589L27 69Q26 47 48 43Z" fill="none" stroke="#c7b99d" stroke-width="2"/>
          <path d="M75 92 924 75M74 548 916 535" stroke="#c8bda5" stroke-width="1.5" opacity=".55"/>
          <circle cx="834" cy="156" r="95" fill="#d6d4bd" opacity=".55"/>
          <circle cx="834" cy="156" r="70" fill="#e8dfc7" opacity=".52"/>
          <path d="M95 512Q190 480 292 505T500 501T710 498T905 507V600H95Z" fill="#c8c4a9" opacity=".52"/>
          <path d="M90 520Q260 495 430 518T770 513T920 520" fill="none" stroke="#b5b297" stroke-width="2" opacity=".6"/>

          <!-- A little coin glints beside the paw, never replacing the main gesture. -->
          <g class="raccoon-coin" transform="translate(730 346)" :filter="`url(#${uid}-small-shadow)`">
            <ellipse cx="0" cy="0" rx="27" ry="27" fill="#a98245"/>
            <ellipse cx="-2" cy="-3" rx="23" ry="23" fill="#d5b36f"/>
            <ellipse cx="-2" cy="-3" rx="16" ry="16" fill="none" stroke="#f1d89b" stroke-width="2"/>
            <path d="M3-15Q-8-18-10-9Q-11-3 1 1Q12 5 7 13Q3 19-9 13M-1-21V19" fill="none" stroke="#98713e" stroke-width="3" stroke-linecap="round"/>
            <path d="m-14-16 5-4m23 39 5-4" stroke="#f4e2b5" stroke-width="2" stroke-linecap="round"/>
          </g>

          <!-- Tail sits behind the body; the dark rings are broad paper shapes. -->
          <g class="raccoon-tail" transform="translate(500 474)" :filter="`url(#${uid}-shadow)`">
            <path d="M-8 5Q-123 54-174-12Q-219-71-163-132Q-115-181-57-139Q-18-111-35-71Q-50-39-89-54Q-119-66-108-91Q-101-108-81-100Q-70-96-72-85Q-68-119-103-124Q-146-130-166-91Q-190-44-150-9Q-102 33-13-25Z" fill="#879489"/>
            <path d="M-155-122Q-178-92-173-60Q-166-22-127-5Q-107 3-85-4Q-111-21-117-48Q-124-75-101-96Q-123-119-155-122Z" fill="#3f4b46"/>
            <path d="M-91-139Q-63-119-61-91Q-61-68-78-55Q-105-58-115-79Q-123-105-91-139Z" fill="#e0d7c2"/>
            <path d="M-170-77Q-160-35-125-22Q-108-17-91-24Q-103-38-104-54Q-134-49-151-82Z" fill="#3b4742"/>
            <path d="M-158-112Q-131-151-93-126" fill="none" stroke="#b9c1ad" stroke-width="3" stroke-linecap="round" opacity=".6"/>
          </g>

          <!-- Body breathes as one piece; the head and limbs remain anchored. -->
          <g class="raccoon-breath" transform-origin="500px 430px">
            <g :filter="`url(#${uid}-shadow)`">
              <!-- Legs and boots. -->
              <path d="M405 454Q390 493 389 535L380 565Q378 582 397 587L468 588Q485 582 478 565L465 529L470 465Z" fill="#66766d"/>
              <path d="M530 464 535 529 520 565Q513 582 532 588L603 587Q621 581 613 564L603 534Q603 492 586 454Z" fill="#748277"/>
              <path d="M386 559Q420 547 473 562L480 579Q483 593 463 597L394 596Q373 591 380 574Z" fill="#394641"/>
              <path d="M520 579Q548 548 610 559L619 575Q625 591 604 597L535 596Q512 593 520 579Z" fill="#394641"/>
              <path d="m398 569 62 1m-54 12 50 1m75-13 62-1m-53 14 49-1" stroke="#849083" stroke-width="2" opacity=".7"/>

              <!-- Jacket/body silhouette with restrained faceted fur. -->
              <path d="M371 282Q389 250 435 241L500 230 566 241Q611 252 629 290L660 439Q665 474 631 491Q570 519 500 518Q428 518 368 491Q335 476 341 439Z" fill="url(#${uid}-fur)"/>
              <path d="M371 282Q398 253 441 245L464 251 436 302 418 439 433 502Q382 493 354 470Q335 453 341 439Z" fill="#78877c"/>
              <path d="M629 282Q602 253 559 245L536 251 564 302 582 439 567 502Q618 493 646 470Q665 453 660 439Z" fill="#596a61"/>
              <path d="M436 302 500 281 564 302 578 450 540 500 500 511 460 500 422 450Z" fill="#d5d1bb"/>
              <path d="M500 281 536 251 564 302 578 450 540 500 500 511Z" fill="#c1c5ae"/>
              <path d="M436 302 464 251 500 281 460 329 445 443 460 500 422 450Z" fill="#e0dbc5"/>
              <path d="M394 321 420 309 410 379 387 399Z" fill="#91a092" opacity=".7"/>
              <path d="M606 321 580 309 590 379 613 399Z" fill="#4d5d55" opacity=".65"/>

              <!-- Jacket lapels and a small brass clasp. -->
              <path d="m432 263 68 46-40 73-40-62Z" fill="#53645b"/>
              <path d="m568 263-68 46 40 73 40-62Z" fill="#46564e"/>
              <path d="m500 309 12 22-12 16-12-16Z" fill="#b78f55"/>
              <circle cx="500" cy="332" r="5" fill="#e3c27f"/>
              <path d="M430 386 445 472M570 386 555 472" stroke="#9ca995" stroke-width="2" opacity=".65"/>

              <!-- Arms: one rests at the hip, the other reaches toward the viewer. -->
              <path d="M386 298Q353 311 348 354L340 418Q337 449 360 454Q384 455 391 429L405 365 427 328Z" fill="#718176"/>
              <path d="M614 298Q650 308 660 345L683 383Q697 408 675 425Q654 439 637 414L601 367 580 327Z" fill="#839185"/>
              <path d="M360 426Q374 434 389 423L385 454Q369 466 350 453Z" fill="#c2c8b4"/>
              <path d="M658 404Q674 406 685 392L700 415Q695 437 673 438L653 421Z" fill="#c9cbb6"/>

              <!-- Near hand is palm-up, deliberately readable as a request. -->
              <g class="raccoon-asking-paw" transform="translate(687 407)">
                <path d="M-5 2Q9-13 24-10L52-4Q66 0 70 13Q73 25 60 31L29 40Q13 45 1 32L-13 19Z" fill="#aab3a3"/>
                <path d="M9 5Q19-5 31-2L53 4Q62 8 61 17Q59 24 48 25L23 30Q11 31 4 20Z" fill="#d7d7c0"/>
                <path d="M10 7Q21 1 31 4M18 17Q30 12 43 17" fill="none" stroke="#8b9789" stroke-width="2" stroke-linecap="round"/>
                <path d="M-4 3Q-14-9-24-5Q-34-1-26 11L-11 27Q-2 34 8 27" fill="#8d9b8d"/>
                <path d="m-20-2 10 13" stroke="#c7cbb7" stroke-width="2" stroke-linecap="round"/>
                <path d="M27-2 40 2" stroke="#f1ead6" stroke-width="2" stroke-linecap="round" opacity=".8"/>
              </g>

              <!-- Neck scarf adds a deliberate, slightly streetwise silhouette. -->
              <path d="M426 252Q500 276 574 252L565 291Q500 318 435 291Z" fill="#8b7659"/>
              <path d="M435 270Q500 292 565 270L559 289Q500 309 441 289Z" fill="#b59a70"/>
              <path d="m535 289 37 11-13 74-36-29Z" fill="#8b7659"/>
              <path d="m541 301 22 7-9 46-22-17Z" fill="#c0a77d"/>

              <!-- Head and ears face straight toward the viewer. -->
              <g class="raccoon-head" transform-origin="500px 225px">
                <path d="M387 176Q363 117 386 91Q414 64 452 113L472 151Z" fill="#718075"/>
                <path d="M613 176Q637 117 614 91Q586 64 548 113L528 151Z" fill="#637268"/>
                <path d="M392 130Q396 91 421 91Q443 96 452 133L431 153Z" fill="#d5c7ad"/>
                <path d="M608 130Q604 91 579 91Q557 96 548 133L569 153Z" fill="#d5c7ad"/>
                <path d="M410 145Q426 113 450 145L443 171 419 169Z" fill="#a87f72"/>
                <path d="M590 145Q574 113 550 145L557 171 581 169Z" fill="#a87f72"/>
                <path d="M500 72Q431 70 394 119Q365 158 379 224Q392 285 449 306Q500 326 551 306Q608 285 621 224Q635 158 606 119Q569 70 500 72Z" fill="url(#${uid}-fur)"/>
                <path d="M500 72Q431 70 394 119Q365 158 379 224Q392 285 449 306L500 309Z" fill="#9da99b"/>
                <path d="M500 72Q569 70 606 119Q635 158 621 224Q608 285 551 306L500 309Z" fill="#78877c"/>
                <!-- Signature raccoon mask, symmetrical and graphic. -->
                <path d="M382 174Q413 132 461 153L500 174 539 153Q587 132 618 174L603 226Q576 252 535 230L500 207 465 230Q424 252 397 226Z" fill="url(#${uid}-mask)"/>
                <path d="M390 177Q421 151 458 166L486 181 463 213Q432 232 405 213Z" fill="#303b37"/>
                <path d="M610 177Q579 151 542 166L514 181 537 213Q568 232 595 213Z" fill="#303b37"/>
                <path d="M409 180Q436 164 459 177L451 202Q430 215 414 201Z" fill="#e2d9c4"/>
                <path d="M591 180Q564 164 541 177L549 202Q570 215 586 201Z" fill="#e2d9c4"/>
                <g class="raccoon-eyes">
                  <ellipse cx="435" cy="190" rx="10" ry="12" fill="#303b35"/>
                  <ellipse cx="565" cy="190" rx="10" ry="12" fill="#303b35"/>
                  <circle cx="438" cy="186" r="3" fill="#f3ead5"/>
                  <circle cx="568" cy="186" r="3" fill="#f3ead5"/>
                </g>
                <path d="M463 227Q478 213 500 215Q522 213 537 227Q530 258 500 265Q470 258 463 227Z" fill="#e2d9c4"/>
                <path d="M486 228Q500 215 514 228Q511 241 500 243Q489 241 486 228Z" fill="#303a35"/>
                <path d="M500 242Q499 253 487 257M500 242Q501 253 513 257" fill="none" stroke="#566259" stroke-width="2.4" stroke-linecap="round"/>
                <path d="M477 270Q500 280 523 270" fill="none" stroke="#566259" stroke-width="2" stroke-linecap="round"/>
                <path d="M398 245Q421 269 449 274M602 245Q579 269 551 274" fill="none" stroke="#c4cbb9" stroke-width="3" opacity=".6"/>
                <!-- Fur tufts and cheek facets. -->
                <path d="m389 210-18 13 20 4m220-17 18 13-20 4" fill="#7d8d81"/>
                <path d="m410 254 25 17m155-17-25 17" stroke="#d5d7c3" stroke-width="2" opacity=".55"/>
                <path d="m424 111 15 12m137-12-15 12" stroke="#c8d0bd" stroke-width="2" opacity=".65"/>
              </g>
            </g>
          </g>

          <!-- The coin's small bob and the raccoon's idle motions never stop. -->
          <path d="M708 294q14-12 28 0" fill="none" stroke="#a78c5d" stroke-width="2" stroke-linecap="round" opacity=".55"/>
          <path d="M748 320q8-7 16 0" fill="none" stroke="#a78c5d" stroke-width="1.5" stroke-linecap="round" opacity=".45"/>
          <path d="M246 402q-9-10-18 0m19 18q-7-7-14 0" fill="none" stroke="#9e9a7f" stroke-width="2" stroke-linecap="round" opacity=".5"/>
          <path d="M0 0H1000V650H0Z" :fill="`url(#${uid}-grain)`" pointer-events="none"/>
        </svg>
      </div>
      <figcaption class="raccoon-scene__caption">
        <span>它在等你的答复。</span>
        <span class="raccoon-scene__status" aria-hidden="true"><i></i> still waiting</span>
      </figcaption>
    </figure>
  </main>
</template>

<route lang="json">
{ "alias": "/error/402", "meta": { "title": "需要付款" } }
</route>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useApple } from '../../src'

const router = useRouter()
const apple = useApple()
const scheme = computed(() => apple.theme.value.current.scheme)
const uid = `paper-402-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

function goBack() {
  if (typeof router.options.history.state.back === 'string') router.back()
  else void router.push('/')
}
</script>

<style scoped>
.paper-402-page { max-width: 1360px; display: grid; grid-template-columns: minmax(260px, .78fr) minmax(0, 1.65fr); align-content: center; align-items: center; column-gap: 16px; padding-top: 38px; padding-bottom: calc(38px + 64px); }
.paper-402-card { background: transparent; border: 0; overflow: visible; }
.paper-402-card :deep(.apple-card__body) { padding: 0 0 0 8px; }
.paper-402-card :deep(.apple-card__heading) { margin: 0; }
.paper-402-heading { width: 100%; }
.paper-402-number { color: var(--apple-text); font-family: Georgia, 'Times New Roman', serif; font-size: clamp(78px, 8.2vw, 118px); line-height: .9; letter-spacing: -.075em; margin: 0 0 28px; font-weight: 400; }
.paper-402-heading h1 { font-size: clamp(26px, 2.7vw, 35px); line-height: 1.35; letter-spacing: -.035em; font-weight: 600; margin: 0 0 9px; }
.paper-402-english { font-size: 11px; line-height: 1.6; letter-spacing: .015em; color: var(--apple-secondary); margin: 0 0 20px; font-weight: 400; }
.paper-402-copy { font-size: 13px; line-height: 1.95; color: var(--apple-secondary); margin: 0; text-wrap: pretty; }
.paper-402-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 27px; }
.paper-402-actions .apple-link { font-size: 12px; padding-inline: 8px; color: var(--apple-secondary); }
.paper-402-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.raccoon-scene { --raccoon-caption: #777d6e; margin: 0; min-width: 0; width: 100%; }
.raccoon-scene__window { padding: 4px; overflow: hidden; }
.raccoon-scene__art { display: block; width: 100%; height: auto; overflow: visible; }
.raccoon-scene__caption { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; margin: 9px 0 0; padding-inline: 4.5%; color: var(--apple-secondary, var(--raccoon-caption)); font-size: 11px; line-height: 1.6; }
.raccoon-scene__status { display: inline-flex; align-items: center; gap: 7px; letter-spacing: .04em; font-size: 10px; text-transform: uppercase; }
.raccoon-scene__status i { width: 6px; height: 6px; border-radius: 50%; background: #9b9b72; box-shadow: 0 0 0 3px #9b9b721c; }
.raccoon-breath { animation: raccoon-breathe 4.2s ease-in-out infinite; }
.raccoon-head { animation: raccoon-head 6.8s ease-in-out infinite; }
.raccoon-tail { transform-box: fill-box; transform-origin: 95% 80%; animation: raccoon-tail 5.4s ease-in-out infinite; }
.raccoon-asking-paw { transform-box: fill-box; transform-origin: 12% 40%; animation: raccoon-paw 3.6s ease-in-out infinite; }
.raccoon-coin { transform-box: fill-box; transform-origin: center; animation: raccoon-coin 2.8s ease-in-out infinite; }
.raccoon-eyes { transform-box: fill-box; transform-origin: center; animation: raccoon-blink 5.8s infinite; }
@keyframes raccoon-breathe { 0%,100% { transform: translateY(0) scaleY(1); } 50% { transform: translateY(-3px) scaleY(1.012); } }
@keyframes raccoon-head { 0%,35%,100% { transform: rotate(0deg); } 43% { transform: rotate(-1.3deg); } 50% { transform: rotate(.6deg); } 58% { transform: rotate(0deg); } }
@keyframes raccoon-tail { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(3deg); } }
@keyframes raccoon-paw { 0%,100% { transform: translateY(0) rotate(0deg); } 42% { transform: translateY(-5px) rotate(-2deg); } 58% { transform: translateY(-3px) rotate(1deg); } }
@keyframes raccoon-coin { 0%,100% { transform: translateY(0) rotate(-7deg); } 50% { transform: translateY(-8px) rotate(7deg); } }
@keyframes raccoon-blink { 0%,43%,47%,100% { transform: scaleY(1); } 45% { transform: scaleY(.08); } }
@media (prefers-reduced-motion: reduce) {
  .raccoon-breath, .raccoon-head, .raccoon-tail, .raccoon-asking-paw, .raccoon-coin, .raccoon-eyes { animation: none !important; }
}
@media (max-width: 880px) {
  .paper-402-page { grid-template-columns: minmax(0, 1fr); max-width: 680px; padding-top: 18px; }
  .raccoon-scene { grid-row: 1; }
  .paper-402-card { margin-top: 26px; }
  .paper-402-card :deep(.apple-card__body) { padding: 0; text-align: center; }
  .paper-402-number { font-size: 70px; margin-bottom: 18px; }
  .paper-402-heading h1 { font-size: 26px; margin-bottom: 8px; }
  .paper-402-english { margin-bottom: 15px; }
  .paper-402-actions { justify-content: center; margin-top: 18px; }
  .raccoon-scene__window { margin-inline: -10px; }
  .raccoon-scene__caption { margin-top: 0; padding-inline: 2%; }
}
@media (max-width: 420px) {
  .paper-402-page { padding-inline: 18px; padding-top: 12px; }
  .paper-402-copy { font-size: 12px; }
  .paper-402-card { margin-top: 22px; }
  .raccoon-scene__caption { padding-inline: 0; }
}
</style>
