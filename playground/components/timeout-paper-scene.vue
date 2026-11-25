<template>
  <figure ref="scene" class="timeout-scene" :class="{ 'timeout-scene--dark': props.theme === 'dark' }" :data-motion="props.motion">
    <div class="timeout-scene__window">
      <svg ref="art" class="timeout-scene__art" viewBox="0 0 1000 660" xmlns="http://www.w3.org/2000/svg" role="img" :aria-labelledby="`${uid}-title ${uid}-description`">
        <title :id="`${uid}-title`">等不到回应的狐狸信使</title>
        <desc :id="`${uid}-description`">狐狸抱着包裹走到路边的收费亭，发现柜台后只有空椅子，头上冒出问号。它用一只爪子托住包裹，另一只爪子隔一会儿敲三下窗户。亭内始终没有动物，横跨车道的闸杆始终关闭。</desc>
        <defs>
          <linearGradient :id="`${uid}-sky`" x2=".25" y2="1"><stop stop-color="var(--timeout-sky-top)" /><stop offset="1" stop-color="var(--timeout-sky)" /></linearGradient>
          <linearGradient :id="`${uid}-glass`" x2=".8" y2="1"><stop stop-color="var(--timeout-glass-top)" stop-opacity=".16" /><stop offset="1" stop-color="var(--timeout-glass-top)" stop-opacity=".03" /></linearGradient>
          <filter :id="`${uid}-shadow`" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx="1" dy="3" stdDeviation="1.6" flood-color="#302f25" flood-opacity=".13" /></filter>
          <pattern :id="`${uid}-grain`" width="41" height="37" patternUnits="userSpaceOnUse"><path d="M4 6h1m15 11h1m13-9h.7M9 29h1m26 3h.8" stroke="#5e472e" stroke-opacity=".15" stroke-width="1" /><path d="M8 11l3-1m13 16 3-1m-4-23 2-1" stroke="#fff8e5" stroke-opacity=".24" stroke-width=".7" /></pattern>
          <clipPath :id="`${uid}-frame`"><path d="M36 74Q37 38 75 35L909 20Q957 19 963 68L986 565Q987 608 942 614L84 635Q29 635 27 585Z" /></clipPath>
          <clipPath :id="`${uid}-window`"><path d="M605 237H727V382H605Z" /></clipPath>
          <clipPath :id="`${uid}-barrier`"><path d="M0 0H214V16H0Z" /></clipPath>
          <g :id="`${uid}-fir`"><path d="M0-110-37-53-23-55-52-9-31-13-56 31H52L30-12 49-7 22-54 35-50Z" fill="currentColor" /><path d="M0-110-1 31H52L30-12 49-7 22-54 35-50Z" fill="#fff7da" opacity=".09" /><path d="M-1 20v31" stroke="currentColor" stroke-width="7" /></g>
          <g :id="`${uid}-leaf`"><path d="M0 0Q-32-5-31-30-5-36 0 0Z" fill="currentColor" /><path d="M0 0-23-25" stroke="#f5e5bc" stroke-width="1.2" opacity=".6" /></g>
        </defs>

        <path d="M44 90Q43 52 83 49L915 33Q970 35 974 85L994 574Q996 620 945 628L86 647Q35 647 36 598Z" fill="var(--timeout-frame-shadow)" />
        <g :clip-path="`url(#${uid}-frame)`">
          <path d="M0 0H1000V660H0Z" :fill="`url(#${uid}-sky)`" />
          <circle cx="184" cy="157" r="39" fill="var(--timeout-sun)" />
          <path d="M-50 324 72 252 191 278 309 201 439 272 570 238 721 289 879 217 1050 268V540H-50Z" fill="var(--timeout-hill-far)" />
          <path d="m191 278 118-77 130 71-114-26-62 58Z" fill="var(--timeout-hill-fold)" />
          <path d="M-40 392 99 319 242 355 365 306 515 348 664 309 824 359 1020 296V550H-40Z" fill="var(--timeout-hill-near)" />
          <path d="m365 306 150 42-113 26-79-16Z" fill="#fff5d4" opacity=".1" />
          <g color="var(--timeout-fir-far)" opacity=".68">
            <use :href="`#${uid}-fir`" transform="translate(53 370) scale(.7)" /><use :href="`#${uid}-fir`" transform="translate(120 378) scale(.88)" /><use :href="`#${uid}-fir`" transform="translate(212 398) scale(.68)" />
            <use :href="`#${uid}-fir`" transform="translate(419 382) scale(.78)" /><use :href="`#${uid}-fir`" transform="translate(863 388) scale(.86)" /><use :href="`#${uid}-fir`" transform="translate(949 385) scale(1.02)" />
          </g>
          <path d="M-60 426Q157 391 331 426T668 424Q843 397 1070 412V680H-60Z" fill="var(--timeout-ground)" />
          <path data-part="road" d="M-50 529H1040V700H-50Z" fill="var(--timeout-road)" />
          <g data-part="roadside-curb">
            <path d="M-50 502H1040V523H-50Z" fill="var(--timeout-island)" />
            <path d="M-50 523H1040V530H-50Z" fill="var(--timeout-island-edge)" />
            <path d="M-50 523H1040" stroke="var(--timeout-road-edge)" stroke-width="2" />
            <path d="m66 503-33 20m161-20-33 20m161-20-33 20m161-20-33 20m161-20-33 20m161-20-33 20m161-20-33 20m161-20-33 20" stroke="var(--timeout-island-edge)" stroke-width="1.4" opacity=".55" />
          </g>
          <path d="M38 590h81m67 0h81m67 0h81m67 0h81m67 0h81m67 0h81m67 0h81" fill="none" stroke="var(--timeout-road-mark)" stroke-width="6" opacity=".75" />
          <path d="M-30 626Q187 612 390 630T1040 641V700H-30Z" fill="var(--timeout-foreground)" />
          <path d="m97 459 12-23 3 22 16-12-7 18m717-54 5-22 5 21 15-11-7 17" fill="var(--timeout-grass)" />

          <g color="var(--timeout-fir-near)"><use :href="`#${uid}-fir`" transform="translate(32 436) scale(1.33)" /></g>
          <path d="m162 425 3-62 10-1 3 64Z" fill="var(--timeout-post)" /><path d="m166 366 8-1 1 15-10 1Z" fill="#c08568" /><path d="m161 425 20 1 2 5-25-1Z" fill="var(--timeout-shadow)" opacity=".26" />

          <path data-part="booth-apron" d="M550 502H780L860 462H630Z" fill="var(--timeout-island)" />
          <path d="M550 502 630 462H860" fill="none" stroke="var(--timeout-island-edge)" stroke-width="2" />
          <path data-part="booth-contact-shadow" d="M580 493H750L812 463 826 470 763 504H583Z" fill="var(--timeout-shadow)" opacity=".23" />
          <g data-part="booth">
            <path data-part="booth-front" d="M580 200H750V496H580Z" fill="var(--timeout-booth)" />
            <path data-part="booth-side" d="M750 200 812 170V466L750 496Z" fill="var(--timeout-booth-side)" />
            <path d="M588 207H742V490H588Z" fill="var(--timeout-booth-inset)" />
            <path d="M580 200H588V496H580Z" fill="var(--timeout-booth-edge)" />
            <path d="M588 423H742M588 459H742M588 489H742" fill="none" stroke="var(--timeout-booth-line)" stroke-width="2" opacity=".65" />
            <path d="M759 219 802 198V462L759 483Z" fill="var(--timeout-door)" />
            <path d="M766 238 794 224V325L766 339Z" fill="var(--timeout-interior)" />
            <path d="M770 240 777 237V329L770 333Z" fill="var(--timeout-glass-top)" opacity=".12" />
            <path d="M766 359 771 357V380L766 382Z" fill="var(--timeout-hardware)" /><path d="m773 373 13-6" stroke="var(--timeout-booth-edge)" stroke-width="2" />
            <path d="M580 496H750V500H580Z" fill="var(--timeout-booth-edge)" />
            <path d="M750 496 812 466V470L750 500Z" fill="var(--timeout-hardware)" />
            <g data-part="booth-roof" :filter="`url(#${uid}-shadow)`">
              <path d="M556 177H763L825 147H618Z" fill="var(--timeout-roof-top)" />
              <path d="M556 177H763V199H556Z" fill="var(--timeout-roof)" />
              <path d="M763 177 825 147V169L763 199Z" fill="var(--timeout-roof-side)" />
              <path d="M556 177H763L825 147M618 147H825" fill="none" stroke="var(--timeout-roof-highlight)" stroke-width="2.2" />
              <path d="M560 194H759" stroke="var(--timeout-roof-highlight)" stroke-width="1.5" opacity=".4" />
            </g>

            <path d="M595 228H737V394H595Z" fill="var(--timeout-window-edge)" />
            <path d="M600 233H732V387H600Z" fill="var(--timeout-window-frame)" />
            <g :clip-path="`url(#${uid}-window)`" data-part="empty-booth">
              <path d="M600 232H735V390H600Z" fill="var(--timeout-interior)" />
              <path d="M605 237H727L702 251H605Z" fill="#253e35" opacity=".2" />
              <path d="M614 254H644V294H614Z" fill="var(--timeout-notice)" opacity=".45" /><path d="M619 262h18m-18 8h13m-13 8h17" stroke="var(--timeout-interior)" stroke-width="1.6" opacity=".6" />
              <circle cx="704" cy="263" r="12" fill="var(--timeout-clock-rim)" /><circle cx="704" cy="263" r="9.3" fill="var(--timeout-clock-face)" />
              <path d="m704 257v6l4 2" fill="none" stroke="var(--timeout-clock-rim)" stroke-width="1.7" stroke-linecap="round" />
              <g data-part="chair">
                <path data-part="chair-back" d="M652 312Q650 299 663 298H683Q695 298 696 311L700 380H655Z" fill="var(--timeout-chair-shadow)" />
                <path d="M657 312Q656 304 665 303H681Q690 303 691 312L695 371H660Z" fill="var(--timeout-chair)" />
                <path d="M663 336Q675 332 689 336" fill="none" stroke="var(--timeout-chair-shadow)" stroke-width="1.1" opacity=".3" />
                <path data-part="chair-seat" d="M651 390H697L704 400 660 404 650 400Z" fill="var(--timeout-chair)" />
                <path data-part="chair-legs" d="M678 403V438M678 433l-20 10m20-10 21 10" fill="none" stroke="var(--timeout-chair-shadow)" stroke-width="4" stroke-linecap="round" />
              </g>
              <path data-part="desk-top" d="M600 365H733L757 353H624Z" fill="var(--timeout-desk)" />
              <path data-part="desk-front" d="M600 365H733V395H600Z" fill="var(--timeout-desk-edge)" />
              <path d="m708 339 11 0-1 15-9 0Z" fill="var(--timeout-cup)" /><path d="m719 341q7 0 5 6l-5 1" fill="none" stroke="var(--timeout-cup)" stroke-width="2" />
              <path d="M600 232H735V390H600Z" :fill="`url(#${uid}-glass)`" />
              <path d="M607 240H634L605 312V278Zm54 0h12l-47 116h-12Z" fill="var(--timeout-glass-top)" opacity=".1" />
            </g>
            <path d="M605 237H727V382H605Z" fill="none" stroke="var(--timeout-window-inner)" stroke-width="2" />
            <path d="M588 398H737L749 392H600Z" fill="var(--timeout-sill)" /><path d="M588 398H737V404H588Z" fill="var(--timeout-sill-edge)" />
            <path d="M627 435H708V462H627Z" fill="var(--timeout-sign)" /><text x="667" y="453" text-anchor="middle" fill="var(--timeout-sign-ink)" font-size="13" font-family="Georgia, serif" letter-spacing="1.1">gateway</text>
            <path d="M594 489H737" stroke="var(--timeout-booth-edge)" stroke-width="2" opacity=".65" />
          </g>

          <g data-part="knock-rings" opacity="0" fill="none" stroke="var(--timeout-knock)" stroke-width="2" stroke-linecap="round">
            <path d="M612 342q10 9 0 19M618 337q16 14 0 29" />
          </g>

          <g data-part="barrier" aria-hidden="true">
            <path d="M856 525 643 628" fill="none" stroke="var(--timeout-shadow)" stroke-width="13" opacity=".14" />
            <path d="M824 520H865L879 513 888 521 868 532H826Z" fill="var(--timeout-shadow)" opacity=".19" />
            <path d="M831 422H866V519H831Z" fill="var(--timeout-barrier-post)" /><path d="M866 422 880 415V512L866 519Z" fill="var(--timeout-barrier-side)" />
            <path d="M831 462H866V478H831Z" fill="var(--timeout-barrier-stripe)" opacity=".65" />
            <path d="M828 421V409H868V421Z" fill="var(--timeout-barrier-cap)" /><path d="M828 409H868L883 402H843Z" fill="var(--timeout-barrier-light)" /><path d="M868 409 883 402V414L868 421Z" fill="var(--timeout-barrier-side)" />
            <path d="M827 519H870V524H827Z" fill="var(--timeout-hardware)" /><path d="M870 519 883 512V517L870 524Z" fill="var(--timeout-barrier-side)" />
            <circle cx="852" cy="431" r="12" fill="var(--timeout-hardware)" />
            <g data-part="barrier-arm" transform="matrix(1 -0.4813084 0 1 638 527)">
              <path d="M0 0H214V16H0Z" fill="var(--timeout-barrier-light)" />
              <g :clip-path="`url(#${uid}-barrier)`" fill="var(--timeout-barrier-stripe)"><path d="m8-4h17l-10 25H-2Zm37 0h17L52 21H35Zm37 0h17L89 21H72Zm37 0h17l-10 25h-17Zm37 0h17l-10 25h-17Zm37 0h17l-10 25h-17Z" /></g>
              <path d="M0 16H214V20H0Z" fill="var(--timeout-barrier-side)" />
              <path d="M0 0H214L219-3H5Z" fill="var(--timeout-barrier-cap)" /><path d="M5 1H209" stroke="#fff5d7" stroke-width="1.3" opacity=".6" />
            </g>
            <circle cx="852" cy="431" r="5" fill="var(--timeout-barrier-side)" />
          </g>

          <ellipse data-part="fox-shadow" cx="458" cy="546" rx="77" ry="10" fill="var(--timeout-shadow)" opacity=".18" />
          <g data-part="fox" transform="translate(462 542)">
            <g data-part="tail" transform="rotate(-2 -32 -76)">
              <path d="M-25-56C-71-53-125-87-155-128L-177-174-172-197-150-213-122-209-100-185-82-144-54-116-17-93Z" fill="#bd754d" />
              <path d="M-172-197-150-213-122-209-100-185-82-144-54-116-17-93-25-70-67-97-102-138-123-174Z" fill="#d69962" />
              <path d="M-155-128-177-174-172-197-145-180-125-148-85-110-52-87-25-70-25-56C-71-53-125-87-155-128Z" fill="#a86545" />
              <path d="M-177-174-172-197-150-213-122-209-104-189-124-190-132-171-151-173-159-153Z" fill="#f0ddaf" />
              <path d="M-177-174-172-197-150-213-151-193-145-180-151-173-159-153Z" fill="#e0c697" />
              <path d="m-145-180 20 32 40 38 33 23" fill="none" stroke="#efbe83" stroke-width="1.4" opacity=".48" />
            </g>
            <path data-part="back-leg" d="M-24-67-35-31-33-8" fill="none" stroke="#aa6546" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />
            <g data-part="back-foot" transform="translate(-33 -6)"><path d="m-10-10 18 1 7 8 16 3 4 7-47-1-4-5Z" fill="#655144" /><path d="m17 3 1 4m8-3 1 4" stroke="#ab9270" stroke-width="1.2" stroke-linecap="round" /></g>
            <path data-part="front-leg" d="M25-63 25-30 36-7" fill="none" stroke="#c18154" stroke-width="21" stroke-linecap="round" stroke-linejoin="round" />
            <g data-part="front-foot" transform="translate(36 -6)"><path d="m-10-10 18 1 8 9 16 3 3 6-46-1-4-5Z" fill="#685344" /><path d="m18 4 1 3m8-2 1 3" stroke="#b09876" stroke-width="1.3" stroke-linecap="round" /></g>
            <g data-part="upper-body">
              <path d="M-20-169 17-174 42-146 50-104 38-64 14-42-25-47-49-71-48-106-33-141Z" fill="#cc8754" />
              <path d="m-20-169-13 28-15 35-1 35 24 24 11-12-14-29 5-50 25-36Z" fill="#b6734b" />
              <path d="m17-174 25 28 8 42-12 40-24 22-8-31 7-35-8-32Z" fill="#f0d6a4" />
              <path d="m17-174 25 28 8 42-12 40-24 22 13-47 6-27-15-30Z" fill="#ddbd8d" />
              <path d="m-25-152 11 36-9 40 11 15" fill="none" stroke="#efb77b" stroke-width="1.3" opacity=".55" />
              <path d="m-15-163 28-8 23 23-8 15-33-9Z" fill="#7a8e78" /><path d="m-15-163 28-8 23 23-9 5-17-15-23 6Z" fill="#a3ac87" />
              <path d="m-17-151-19 11-5 36 16-12 12-34Z" fill="#778970" /><path d="m-36-140-5 36 8-7 9-32Z" fill="#8e9d7e" />

              <path d="M18-137 37-94 63-63 101-65" fill="none" stroke="#a96746" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" />
              <g data-part="packet">
                <path d="M31-123 54-143 116-149 94-132Z" fill="#dfc295" />
                <path d="m31-123 63-9 3 68-63 10Z" fill="#c5a171" />
                <path d="m94-132 22-17 3 67-22 18Z" fill="#a9855e" />
                <path d="m31-123 63-9 3 68-6-4-3-57-57 8Z" fill="#d3b184" />
                <path d="m61-127 23-19 13-1-23 18 3 69-13 2Z" fill="#ead4ad" />
                <path d="m74-129 23-18 0 5-22 17Z" fill="#f0ddb8" />
                <path d="m42-110 40-5 1 24-40 6Z" fill="#e9d9b8" /><text x="62" y="-95" text-anchor="middle" transform="rotate(-7 62 -100)" fill="#75634b" font-size="10" font-family="Georgia, serif" letter-spacing=".3">packet</text>
                <path d="m104-103 9-7m-9 13 9-7m-67 43 15-2" stroke="#765f44" stroke-width="1.2" opacity=".55" />
                <path d="m34-54 63-10 22-18" fill="none" stroke="#8d714f" stroke-width="1.3" />
              </g>
              <path d="M58-66 73-68 91-72 103-71 106-64 96-57 75-56 61-59Z" fill="#79533c" /><path d="m83-67 1 6m7-8 1 6m6-7 1 5" stroke="#c7a078" stroke-width="1.3" stroke-linecap="round" />

              <path data-part="knock-arm" d="M25-139Q27-97 47-86L88-97" fill="none" stroke="#bd794f" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" />
              <path data-part="arm-fold" d="M25-143Q30-100 48-91L85-101" fill="none" stroke="#e0a46c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <g data-part="knock-paw" transform="translate(89 -97)"><path d="m-9-8 11-3 8 3 3 7-2 8-8 5-13-4-3-8Z" fill="#79533d" /><path d="m5-6 6 2m-6 4 7 2M4 5l6 2" fill="none" stroke="#c59b71" stroke-width="1.25" stroke-linecap="round" /></g>

              <g data-part="head">
                <path d="m13-228 13-59 25 48-9 25Z" fill="#b7764f" /><path d="m23-238 6-32 13 31-6 10Z" fill="#80644e" />
                <path d="m-23-223-13-67 43 44-2 30Z" fill="#c78656" /><path d="m-19-237-10-38 28 31-1 16Z" fill="#efd3a1" /><path d="m-19-237-10-38 17 28 6 19Z" fill="#a47657" />
                <path d="M-23-229 8-247 38-240 59-215 72-203 99-194 96-183 73-172 45-169 22-154-6-163-27-188Z" fill="#ce8c58" />
                <path d="m-23-229 31-18-6 35-8 49-21-25Z" fill="#ba744a" />
                <path d="m8-247 30 7 21 25-20-9-21-3-16 15Z" fill="#e1a771" />
                <path d="M39-224 59-215 72-203 99-194 96-183 73-172 45-169 22-154-6-163 14-177 25-203Z" fill="#f1dbb1" />
                <path d="m14-177 31 8 28-3-28 11-23 7-28-9Z" fill="#ddbe90" />
                <path d="m59-215 13 12 27 9-16 1-23-9-21-22Z" fill="#e3be8b" />
                <path d="m92-198 13 5-2 8-8 3-7-7Z" fill="#4b453a" /><path d="m96-195 5 2" stroke="#9a8b6b" stroke-width="1.5" stroke-linecap="round" />
                <g data-part="eye" transform="translate(40 -218)"><ellipse rx="4.5" ry="5.4" fill="#40392f" /><circle cx="1.4" cy="-1.6" r="1.45" fill="#fff4d7" /></g>
                <path data-part="brow" d="m32-230 13 1" stroke="#8c5d3e" stroke-width="2.2" stroke-linecap="round" />
                <path data-part="mouth" d="M95-184Q81-177 59-179" fill="none" stroke="#705039" stroke-width="2.8" stroke-linecap="round" />
                <path d="m22-187-12-3" fill="none" stroke="#9d7a55" stroke-width="1.4" stroke-linecap="round" />
                <path d="m-17-218 11 4m-13 5 9 5" stroke="#e2a974" stroke-width="1.2" opacity=".6" />
              </g>
            </g>
          </g>

          <g data-part="question" transform="translate(518 232) scale(0)">
            <path d="M-25-10Q-26-25-10-27L16-26Q29-24 28-10L26 9Q25 20 10 21L-2 20-14 31-12 19Q-25 17-25 5Z" fill="var(--timeout-question-shadow)" transform="translate(1 3)" />
            <path d="M-25-10Q-26-25-10-27L16-26Q29-24 28-10L26 9Q25 20 10 21L-2 20-14 31-12 19Q-25 17-25 5Z" fill="var(--timeout-question)" />
            <path d="M-7-12C-7-24 13-24 13-13 13-5 2-5 2 2" fill="none" stroke="var(--timeout-question-ink)" stroke-width="4.2" stroke-linecap="round" /><circle cx="2" cy="11" r="2.6" fill="var(--timeout-question-ink)" />
          </g>

          <g color="var(--timeout-leaf)"><use :href="`#${uid}-leaf`" transform="translate(125 623) rotate(75) scale(.8)" /><use :href="`#${uid}-leaf`" transform="translate(148 628) rotate(132) scale(.7)" /><use :href="`#${uid}-leaf`" transform="translate(924 497) rotate(-63) scale(.56)" /></g>
          <g fill="var(--timeout-grass)"><path d="m68 631-5-37 15 27 5-42 7 41 17-19-7 30Z" /><path d="m944 500 1-22 7 16 6-25 1 24 11-8-7 16Z" /></g>
          <path d="M0 0H1000V660H0Z" :fill="`url(#${uid}-grain)`" pointer-events="none" />
          <path d="M40 78 43 581Q44 614 80 613" fill="none" stroke="#fff8de" stroke-width="2" opacity=".35" />
        </g>
      </svg>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { createTimeoutRenderer, createTimeoutStory, type TimeoutStory } from './timeout-paper-story'

const props = withDefaults(defineProps<{ theme?: 'light' | 'dark'; motion?: 'full' | 'reduced' | 'none'; paused?: boolean }>(), { theme: 'light', motion: 'full', paused: false })
const uid = `timeout-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const scene = ref<HTMLElement>()
const art = ref<SVGSVGElement>()
const hidden = ref(typeof document !== 'undefined' && document.hidden)
const offscreen = ref(false)
const suspended = computed(() => props.paused || hidden.value || offscreen.value)
const animated = computed(() => props.motion === 'full')
let player: TimeoutStory | undefined
let observer: IntersectionObserver | undefined
let mounted = false

function syncPlayback() { player?.setPaused(suspended.value) }
function play(intro: boolean) {
  player?.dispose()
  player = undefined
  if (!mounted || !art.value) return
  if (!animated.value) { createTimeoutRenderer(art.value).still(); return }
  player = createTimeoutStory(art.value, intro)
  syncPlayback()
}
function visibilityChanged() { hidden.value = document.hidden }
watch(suspended, syncPlayback, { flush: 'sync' })
watch(animated, () => play(false), { flush: 'post' })
onMounted(async () => {
  mounted = true
  document.addEventListener('visibilitychange', visibilityChanged)
  if (typeof IntersectionObserver !== 'undefined' && scene.value) {
    observer = new IntersectionObserver(([entry]) => { offscreen.value = !entry.isIntersecting }, { threshold: 0 })
    observer.observe(scene.value)
  }
  await nextTick()
  if (mounted) play(true)
})
onBeforeUnmount(() => {
  mounted = false
  player?.dispose()
  observer?.disconnect()
  document.removeEventListener('visibilitychange', visibilityChanged)
})
defineExpose({ replay: () => play(true) })
</script>

<style scoped>
.timeout-scene {
  --timeout-sky-top: #f4ead8; --timeout-sky: #e8e3c9; --timeout-frame-shadow: #d4cbbb;
  --timeout-sun: #fcf2cf; --timeout-hill-far: #dadbc0; --timeout-hill-fold: #e5dfc4; --timeout-hill-near: #bdc6ab;
  --timeout-fir-far: #8d9f87; --timeout-fir-near: #7d9277; --timeout-ground: #b8c09c; --timeout-grass: #89946c;
  --timeout-road: #bfc2b1; --timeout-road-edge: #e8e2c8; --timeout-road-mark: #f0edd7; --timeout-foreground: #96a17d;
  --timeout-post: #e1d7b9; --timeout-shadow: #695c40; --timeout-leaf: #b49c60; --timeout-island: #ddd8bb; --timeout-island-edge: #b9b79b;
  --timeout-booth: #aab9a4; --timeout-booth-side: #8b9e89; --timeout-booth-inset: #bdc7ad; --timeout-booth-edge: #81947d; --timeout-booth-line: #a1ae94;
  --timeout-door: #91a28c; --timeout-hardware: #727e69; --timeout-roof-top: #a0b09a; --timeout-roof: #7d927b; --timeout-roof-side: #657c69; --timeout-roof-highlight: #bbc7aa;
  --timeout-window-edge: #738773; --timeout-window-frame: #d9d9b9; --timeout-window-inner: #697e6c; --timeout-interior: #829783;
  --timeout-notice: #d4d8b7; --timeout-chair: #b4b995; --timeout-chair-shadow: #617763; --timeout-desk: #d0bf91; --timeout-desk-edge: #9d9270; --timeout-cup: #dfdfbd;
  --timeout-glass-top: #f4f0d1; --timeout-sill: #e4dfc3; --timeout-sill-edge: #b1b699; --timeout-clock-rim: #536e5c; --timeout-clock-face: #d9ddbc;
  --timeout-sign: #dde0c1; --timeout-sign-ink: #596f59; --timeout-knock: #f6e7ba;
  --timeout-barrier-post: #d8cdb0; --timeout-barrier-side: #a99d7f; --timeout-barrier-cap: #dcd5ba; --timeout-barrier-light: #f0e4c6; --timeout-barrier-stripe: #b87e64;
  --timeout-question: #fbf0d5; --timeout-question-shadow: #beb99b; --timeout-question-ink: #74664d;
  position: relative; min-width: 0; margin: 0;
}
.timeout-scene--dark {
  --timeout-sky-top: #263838; --timeout-sky: #3b5149; --timeout-frame-shadow: #14201f;
  --timeout-sun: #d9cb9e; --timeout-hill-far: #3f574d; --timeout-hill-fold: #4b6253; --timeout-hill-near: #496653;
  --timeout-fir-far: #54715c; --timeout-fir-near: #304e40; --timeout-ground: #637a59; --timeout-grass: #4e6547;
  --timeout-road: #798570; --timeout-road-edge: #a3ad8d; --timeout-road-mark: #c7cfad; --timeout-foreground: #3e5b44;
  --timeout-post: #b5b18e; --timeout-shadow: #253c30; --timeout-leaf: #a99a61; --timeout-island: #a7ad8d; --timeout-island-edge: #6f8067;
  --timeout-booth: #7b9277; --timeout-booth-side: #536f5d; --timeout-booth-inset: #8b9f80; --timeout-booth-edge: #58755d; --timeout-booth-line: #708b6e;
  --timeout-door: #5d7a64; --timeout-hardware: #455f4d; --timeout-roof-top: #718b70; --timeout-roof: #4f705b; --timeout-roof-side: #385744; --timeout-roof-highlight: #91a586;
  --timeout-window-edge: #46624f; --timeout-window-frame: #a4b293; --timeout-window-inner: #3a5847; --timeout-interior: #4d6c58;
  --timeout-notice: #9eac89; --timeout-chair: #91a27c; --timeout-chair-shadow: #324e3f; --timeout-desk: #afa47b; --timeout-desk-edge: #6c7c5e; --timeout-cup: #c5cba5;
  --timeout-glass-top: #c4d4b6; --timeout-sill: #b8c19e; --timeout-sill-edge: #748c6e; --timeout-clock-rim: #2e4c3b; --timeout-clock-face: #c0c7a0;
  --timeout-sign: #b2bf97; --timeout-sign-ink: #3d5842; --timeout-knock: #e6d5a4;
  --timeout-barrier-post: #b4b28e; --timeout-barrier-side: #7c8b6a; --timeout-barrier-cap: #c0bf9b; --timeout-barrier-light: #d9d5b0; --timeout-barrier-stripe: #ac7a60;
  --timeout-question: #e2d8b6; --timeout-question-shadow: #435d45; --timeout-question-ink: #5e6246;
}
.timeout-scene__window { padding: 4px; overflow: hidden; }
.timeout-scene__art { display: block; width: 100%; height: auto; overflow: visible; }
@media (max-width: 880px) { .timeout-scene__window { margin-inline: -12px; } }
</style>
