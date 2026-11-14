<template>
  <figure ref="scene" class="fire-scene" :class="{ 'fire-scene--dark': dark }" :data-story="phase" :data-playing="canAnimate && !suspended">
    <div class="fire-scene__window">
<svg ref="art" class="fire-scene__art" viewBox="0 0 1000 660" role="img" :aria-labelledby="`${uid}-title ${uid}-desc`" xmlns="http://www.w3.org/2000/svg">
  <title :id="`${uid}-title`">猴子的最后一单</title>
  <desc :id="`${uid}-desc`">猴子抱着包裹送进服务器。镜头拉远，服务器突然爆炸。猴子双手抱头，望着持续燃烧的服务器。</desc>
  <defs>
    <clipPath :id="`${uid}-frame`"><path d="M36 74Q37 38 75 35L909 20Q957 19 963 68L986 565Q987 608 942 614L84 635Q29 635 27 585Z" /></clipPath>
    <clipPath :id="`${uid}-window`"><path d="M108 332V202C108 83 306 83 306 202V332Z" /></clipPath>
    <clipPath :id="`${uid}-packet-clip`"><path d="M-1200-800H662V1400H-1200Z" /></clipPath>
    <filter :id="`${uid}-shadow`" x="-30%" y="-25%" width="170%" height="175%"><feDropShadow dx="1" dy="5" stdDeviation="2.5" flood-color="#3d3429" flood-opacity=".14" /></filter>
    <pattern :id="`${uid}-grain`" width="41" height="37" patternUnits="userSpaceOnUse"><path d="M4 6h1m15 11h1m13-9h.7M9 29h1m26 3h.8" stroke="#5e472e" stroke-opacity=".11" stroke-width="1" /><path d="M8 11l3-1m13 16 3-1m-4-23 2-1" stroke="#fff8e5" stroke-opacity=".24" stroke-width=".7" /></pattern>
    <g :id="`${uid}-leaf`"><path d="M0 0C-37-5-50-27-37-54-10-49 6-25 0 0Z" fill="currentColor" /><path d="M-1-3-31-46" fill="none" stroke="#eee2b8" stroke-width="1.4" opacity=".5" /></g>
    <g :id="`${uid}-smoke-shape`"><path d="M-36 12C-60 8-57-20-38-24-44-47-13-58-1-40 12-65 45-51 43-29 67-25 65 3 48 11 54 32 25 40 12 28-6 47-34 36-36 12Z" fill="var(--fire-smoke)" /><path d="M-38-24C-44-47-13-58-1-40 12-65 45-51 43-29 16-38 16-15-2-8-19-1-26-18-38-24Z" fill="var(--fire-smoke-light)" opacity=".55" /></g>
  </defs>
  <path d="M44 90Q43 52 83 49L915 33Q970 35 974 85L994 574Q996 620 945 628L86 647Q35 647 36 598Z" fill="var(--fire-frame)" />
  <g :clip-path="`url(#${uid}-frame)`">
    <path d="M0 0H1000V660H0Z" fill="var(--fire-wall)" />
    <g data-part="camera">
      <path d="M-1000-800H2000V1100H-1000Z" fill="var(--fire-wall)" />
      <path d="M-1000 365H827L1180 243V980H-1000Z" fill="var(--fire-panel)" />
      <path d="M827-800H2000V1100H827Z" fill="var(--fire-sidewall)" opacity=".52" />
      <path d="M-1000 444H827L2000 206V1200H-1000Z" fill="var(--fire-floor)" />
      <path d="M-1000 443H827L2000 205" fill="none" stroke="var(--fire-baseboard)" stroke-width="12" />
      <path d="M-300 541 827 444 1275 603M48 690 827 444M510 750 827 444" fill="none" stroke="var(--fire-floor-line)" stroke-width="1.4" opacity=".38" />
      <path d="M85 338V202C85 54 329 54 329 202V346Z" fill="var(--fire-window-dark)" :filter="`url(#${uid}-shadow)`" />
      <path d="M96 334V202C96 70 318 70 318 202V338Z" fill="var(--fire-window-frame)" />
      <g :clip-path="`url(#${uid}-window)`">
        <path d="M92 84H320V348H92Z" fill="var(--fire-window-sky)" />
        <circle cx="247" cy="168" r="30" fill="var(--fire-sun)" />
        <path d="M78 265 130 208 193 248 242 220 333 281V352H78Z" fill="var(--fire-hill-far)" />
        <path d="m130 208 63 40-38 15-25-12-52 14Z" fill="var(--fire-hill-fold)" />
        <path d="M82 304 167 261 231 288 279 263 333 304V352H82Z" fill="var(--fire-hill-near)" />
        <path d="m116 262-21 38h12l-25 31h62l-22-31h12Zm156 13-25 42h15l-21 29h61l-20-29h13Z" fill="var(--fire-leaf-dark)" />
      </g>
      <path d="M202 102V333M108 244H306" fill="none" stroke="var(--fire-window-frame)" stroke-width="10" />
      <path d="M105 334H315L327 349H94Z" fill="var(--fire-window-frame)" /><path d="M94 349H327V358H94Z" fill="var(--fire-window-dark)" />
      <path d="M478-50V119" stroke="var(--fire-cable)" stroke-width="3" />
      <path d="m454 115 48 0 30 34-107 0Z" fill="var(--fire-metal)" /><path d="m454 115 24 0-2 34-51 0Z" fill="var(--fire-metal-light)" /><ellipse cx="478" cy="150" rx="53" ry="7" fill="var(--fire-lamp)" />
      <path d="M718-80V132Q718 149 735 149H816Q833 149 833 168V192" fill="none" stroke="var(--fire-conduit)" stroke-width="7" />
      <path d="M718-80V132Q718 149 735 149H816Q833 149 833 168" fill="none" stroke="var(--fire-conduit-light)" stroke-width="2" />
      <path d="M811 145v9m-92-67h-7m113 55-6 11" stroke="var(--fire-conduit-dark)" stroke-width="4" />
      <path d="M667 511C625 541 634 566 685 567H749" fill="none" stroke="var(--fire-cable)" stroke-width="6" stroke-linecap="round" />
      <path d="m747 560 18 1v13l-18-1Z" fill="var(--fire-metal-dark)" /><path d="m765 563 9 0m-9 7h9" stroke="var(--fire-metal-dark)" stroke-width="3" />
      <g transform="translate(129 525)" :filter="`url(#${uid}-shadow)`">
        <path d="M-35-57H34L25 0-18 4Z" fill="var(--fire-pot)" /><path d="m-35-57 20 0 9 60-12 1Z" fill="var(--fire-pot-light)" /><ellipse cy="-57" rx="35" ry="8" fill="var(--fire-pot-dark)" />
        <path d="M0-55-10-164m9 109 21-123m-21 121-41-90m41 85 44-66" fill="none" stroke="var(--fire-leaf-dark)" stroke-width="4" />
        <g color="var(--fire-leaf-dark)"><use :href="`#${uid}-leaf`" transform="translate(-9 -129) rotate(-25) scale(.65)" /><use :href="`#${uid}-leaf`" transform="translate(15 -142) rotate(59) scale(.8)" /><use :href="`#${uid}-leaf`" transform="translate(-25 -104) rotate(-46) scale(.78)" /></g>
        <g color="var(--fire-leaf-light)"><use :href="`#${uid}-leaf`" transform="translate(-6 -116) rotate(75) scale(.72)" /><use :href="`#${uid}-leaf`" transform="translate(27 -99) rotate(88) scale(.88)" /><use :href="`#${uid}-leaf`" transform="translate(-7 -80) rotate(-65) scale(.76)" /></g>
      </g>
      <ellipse cx="765" cy="544" rx="136" ry="19" fill="var(--fire-ground-shadow)" opacity=".16" />
      <ellipse data-part="monkey-shadow" cx="190" cy="540" rx="80" ry="12" fill="var(--fire-ground-shadow)" opacity=".17" />
      <ellipse data-part="fire-glow" cx="757" cy="529" rx="143" ry="31" fill="#e5aa52" opacity="0" />
      <g data-part="smoke" opacity="0">
        <g data-smoke="0"><use :href="`#${uid}-smoke-shape`" /></g><g data-smoke="1"><use :href="`#${uid}-smoke-shape`" /></g><g data-smoke="2"><use :href="`#${uid}-smoke-shape`" /></g><g data-smoke="3"><use :href="`#${uid}-smoke-shape`" /></g><g data-smoke="4"><use :href="`#${uid}-smoke-shape`" /></g><g data-smoke="5"><use :href="`#${uid}-smoke-shape`" /></g>
      </g>
      <g data-part="server" :filter="`url(#${uid}-shadow)`">
        <path d="m652 506 45 25v18l-45-25Zm47 27h164v16H699Z" fill="var(--fire-metal-dark)" />
        <path d="M650 180 698 207V536L650 509Z" fill="var(--fire-metal-dark)" />
        <path d="M650 180 664 189V512L650 509Z" fill="var(--fire-metal)" />
        <path d="M698 207H862V536H698Z" fill="var(--fire-metal)" />
        <path d="M698 207H710V536H698Z" fill="var(--fire-metal-light)" /><path d="M848 207H862V536H848Z" fill="var(--fire-metal-dark)" />
        <g data-part="server-lid"><path d="M650 180 814 180 862 207H698Z" fill="var(--fire-metal-light)" /><path d="m650 180 164 0 11 6-164 0Z" fill="var(--fire-metal-pale)" /><path d="m706 193 72 0 7 4-73 0Z" fill="var(--fire-metal)" /></g>
        <path d="M718 257H843V508H718Z" fill="var(--fire-cavity)" />
        <g data-part="rack-upper"><path d="M717 261H844V305H717Z" fill="var(--fire-panel-front)" /><path d="M726 270h65m-65 8h65m-65 8h65" stroke="var(--fire-vent)" stroke-width="3" stroke-linecap="round" /><circle data-led="0" cx="826" cy="279" r="4.3" fill="#b8ce8b" /><circle cx="812" cy="279" r="2.1" fill="var(--fire-metal-pale)" /></g>
        <g data-part="rack-lower"><path d="M717 452H844V497H717Z" fill="var(--fire-panel-front)" /><path d="M726 463h64m-64 8h64m-64 8h64" stroke="var(--fire-vent)" stroke-width="3" stroke-linecap="round" /><circle data-led="1" cx="826" cy="472" r="4.3" fill="#b8ce8b" /><circle cx="812" cy="472" r="2.1" fill="var(--fire-metal-pale)" /></g>
        <g data-part="server-damage" opacity="0">
          <path d="m710 324 21-12 10 12 19-16 18 11 26-12 20 14 18-8 8 39-12 25 13 28-17 36-30-4-22 11-20-10-24 9-23-23Z" fill="#302f27" />
          <path d="m735 324 11 25-10 26 24 17-4 40m45-115-13 32 19 20-11 24 7 37" fill="none" stroke="#98836a" stroke-width="4" />
          <path data-part="wire-one" d="M754 348Q714 344 716 390T684 414" fill="none" stroke="#b99b60" stroke-width="5" stroke-linecap="round" />
          <path data-part="wire-two" d="M806 367Q851 361 855 391T881 423" fill="none" stroke="#b67851" stroke-width="4" stroke-linecap="round" />
          <path d="m724 247 7-9 6 12 9-6m88 249-9 16 6 8-10 17" fill="none" stroke="var(--fire-cavity)" stroke-width="2.5" />
        </g>
        <g data-part="server-door"><path d="M716 318H845V441H716Z" fill="var(--fire-panel-front)" /><path d="M718 320H843V327H718Z" fill="var(--fire-metal-light)" /><path d="M727 336h68m-68 8h68m-68 8h68m-68 21h68m-68 8h68m-68 8h68m-68 21h68m-68 8h68m-68 8h68" stroke="var(--fire-vent)" stroke-width="3" stroke-linecap="round" /><circle data-led="2" cx="826" cy="346" r="4.3" fill="#b8ce8b" /><circle data-led="3" cx="826" cy="383" r="4.3" fill="#b8ce8b" /><circle data-led="4" cx="826" cy="420" r="4.3" fill="#b8ce8b" /><path d="m835 362 0 34" stroke="var(--fire-metal-pale)" stroke-width="3" stroke-linecap="round" /></g>
        <path d="m645 370 49 27v77l-49-27Z" fill="var(--fire-metal-pale)" /><path d="m650 380 44 24v60l-44-24Z" fill="var(--fire-cavity)" />
        <path d="m652 440 42 24v10l-49-27Z" fill="var(--fire-metal-dark)" />
        <path d="m658 272 27 16m-27-7 27 16m-27-7 27 16" stroke="var(--fire-vent)" stroke-width="3" />
        <text x="779" y="241" text-anchor="middle" fill="var(--fire-label)" font-family="ui-monospace, SFMono-Regular, Consolas, monospace" font-size="18" letter-spacing="1.6">server</text>
        <g fill="var(--fire-metal-pale)"><circle cx="707" cy="217" r="2" /><circle cx="853" cy="217" r="2" /><circle cx="707" cy="524" r="2" /><circle cx="853" cy="524" r="2" /></g>
      </g>
      <g :clip-path="`url(#${uid}-packet-clip)`">
        <g data-part="packet" transform="translate(265 427)">
          <path d="m-44-30 73-4 17 15-73 5Z" fill="#e9c68c" /><path d="m-27-14 73-5v59l-73 4Z" fill="#c59459" /><path d="m-44-30 17 16v58l-17-17Z" fill="#ae7c48" />
          <path d="m-17-32 14-1 17 16-14 1Z" fill="#f4dfb2" /><path d="m0-16 14-1v59l-14 1Z" fill="#e5c18b" />
          <path d="m-44-30 17 16 73-5M-27-14v58" fill="none" stroke="#8d643e" stroke-width="1.2" opacity=".38" />
          <path d="m-18-7 44-2v18l-44 2Z" fill="#f2e0b9" /><text x="4" y="5" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Consolas, monospace" font-size="10.8" fill="#765c40">packet</text>
          <path d="m27 27 11-1m-11 4 11-1m-11 4 7-.5" fill="none" stroke="#8d653f" stroke-width="1.4" opacity=".65" />
        </g>
      </g>
      <g data-part="monkey" transform="translate(190 536)">
        <g data-part="leg-back"><path d="M-36-67-10-65-7-34-19-7-42-7-40-20-26-39Z" fill="#8e6144" /><path d="M-40-17Q-50-15-52-5L-46 0-12 0-12-9-27-15Z" fill="#c49468" /><path d="m-42-7 0 6m9-7 0 7" stroke="#8e6144" stroke-width="1.5" stroke-linecap="round" /></g>
        <g data-part="leg-front"><path d="M7-67 35-63 36-37 24-10 4-10 12-39Z" fill="#ad7951" /><path d="M17-17Q25-20 35-13L49-8 49-1 11 0 5-7Z" fill="#d0a575" /><path d="m34-8 0 7m8-6 0 6" stroke="#9d704d" stroke-width="1.5" stroke-linecap="round" /></g>
        <g data-part="monkey-upper">
          <g data-part="tail"><path d="M-35-68C-75-52-118-62-122-105-125-146-86-164-68-141-51-118-80-103-89-124" fill="none" stroke="#8e6144" stroke-width="18" stroke-linecap="round" /><path d="M-40-69C-79-58-116-68-117-106-118-139-88-153-74-138" fill="none" stroke="#bd8b5f" stroke-width="7" stroke-linecap="round" /></g>
          <path d="M-29-144Q-48-136-48-103L-41-66Q-23-45 4-48 30-47 42-69L38-123Q31-145 12-149Z" fill="#ad7951" />
          <path d="M-29-144-39-110-33-74-16-52-41-66Q-54-109-45-129Z" fill="#8e6144" /><path d="m12-149 26 26 4 54-17 17 2-37-11-40Z" fill="#c49468" />
          <path d="M-10-132Q-30-120-27-94L-18-67Q1-55 22-72L27-102Q23-129 8-135Z" fill="#e4be88" /><path d="M-10-132-15-102-8-77 8-63-18-67-27-94Q-30-120-10-132Z" fill="#d0a575" />
          <path d="m-34-91 15 9-5 15m45-37 11 10" fill="none" stroke="#e0b17a" stroke-width="1.3" opacity=".65" />
          <path d="M-25-148-7-156 26-147 28-132-8-127-28-137Z" fill="#78958a" /><path d="m-27-139 18 5-13 33-11-10Z" fill="#8da89a" /><path d="m-6-139 31-7 3 14-36 5Z" fill="#5e7c70" />
          <g data-part="arm-back"><path data-part="arm-back-main" d="M-32-128Q-48-89 31-78" fill="none" stroke="#8e6144" stroke-width="23" stroke-linecap="round" stroke-linejoin="round" /><path data-part="arm-back-fold" d="M-32-130-32-96 31-82" fill="none" stroke="#ad7951" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /></g>
          <g data-part="arm-front"><path data-part="arm-front-main" d="M33-128Q50-83 108-87" fill="none" stroke="#ad7951" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" /><path data-part="arm-front-fold" d="M34-133 54-95 108-91" fill="none" stroke="#c49468" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /></g>
          <g data-part="monkey-head">
            <path d="M-44-209C-79-225-91-189-70-171L-46-169Z" fill="#ad7951" /><path d="M-52-201C-72-211-78-189-63-180L-48-179Z" fill="#deb280" />
            <path d="M44-209C77-224 88-188 67-171L45-170Z" fill="#b98559" /><path d="M52-201C71-210 76-188 62-180L48-180Z" fill="#e4be88" />
            <path d="M-47-210Q-50-237-22-243L-12-255-1-246 14-249 27-239Q52-231 50-207L49-178Q46-150 22-142L-14-143Q-44-151-48-176Z" fill="#ad7951" />
            <path d="M-47-210Q-50-237-22-243L-12-255-1-246-19-228-28-190-18-149-14-143Q-44-151-48-176Z" fill="#8e6144" />
            <path d="m-1-246 15-3 13 10Q52-231 50-207L40-194 29-219 6-230-19-228Z" fill="#c49468" />
            <path d="M0-216C-23-239-51-217-39-193-59-174-36-146-8-149L12-149C40-146 58-173 39-192 48-219 22-238 0-216Z" fill="#f1d9b1" />
            <path d="M-39-193C-53-177-38-153-14-150L-8-149-23-163-27-186Q-40-218-18-225C-41-225-48-211-39-193Z" fill="#e4be88" />
            <g data-part="face">
              <path data-part="brow-left" d="M-29-211Q-20-216-12-212" fill="none" stroke="#805c42" stroke-width="3" stroke-linecap="round" /><path data-part="brow-right" d="M12-212Q21-216 29-210" fill="none" stroke="#805c42" stroke-width="3" stroke-linecap="round" />
              <g data-part="eye-left"><ellipse cx="-20" cy="-194" rx="9" ry="11.5" fill="#fff5dc" /><ellipse data-part="pupil-left" cx="-17" cy="-193" rx="4.5" ry="6.7" fill="#493e33" /><circle cx="-15.6" cy="-196" r="1.5" fill="#fff7e8" /></g>
              <g data-part="eye-right"><ellipse cx="20" cy="-194" rx="9" ry="11.5" fill="#fff5dc" /><ellipse data-part="pupil-right" cx="23" cy="-193" rx="4.5" ry="6.7" fill="#493e33" /><circle cx="24.4" cy="-196" r="1.5" fill="#fff7e8" /></g>
              <path d="M-5-180Q0-184 5-180L3-175-3-175Z" fill="#9e7352" />
              <path data-part="mouth" d="M-10-165Q0-157 11-164" fill="none" stroke="#76503b" stroke-width="2.8" stroke-linecap="round" />
              <path data-part="tongue" d="M-6-154Q0-160 6-154" fill="none" stroke="#c99177" stroke-width="4" opacity="0" stroke-linecap="round" />
              <path d="m-33-173 6 2m54-2 6-2" fill="none" stroke="#d5ac7c" stroke-width="2" stroke-linecap="round" />
            </g>
          </g>
          <g data-part="hand-back" transform="translate(31 -78) rotate(-5)"><path d="M-10-6Q-12-14-6-14L8-12Q16-10 14-3L10 5Q4 12-6 8L-12 4Z" fill="#deb280" /><path d="m-6-7 13 2m-14 3 13 2" stroke="#a57550" stroke-width="1.2" stroke-linecap="round" fill="none" /></g>
          <g data-part="hand-front" transform="translate(108 -87) rotate(-12)"><path d="M-11-6Q-11-15-4-14L9-11Q16-8 13-1L9 7Q2 12-8 6L-13 2Z" fill="#e4be88" /><path d="m-6-7 13 2m-14 3 13 2" stroke="#a57550" stroke-width="1.2" stroke-linecap="round" fill="none" /></g>
          <g data-part="panic-lines" opacity="0" fill="none" stroke="#ae8154" stroke-width="2.6" stroke-linecap="round"><path d="m-69-245-9-8m22-1-4-10m132 22 8-8m-24-1 2-11" /></g>
          <g data-part="sweat" opacity="0"><path d="M0 0Q-15 16-2 20 12 21 0 0Z" fill="#8eb5b2" /><path d="m-1 9-3 6" fill="none" stroke="#d6e4d5" stroke-width="2" stroke-linecap="round" /></g>
        </g>
      </g>
      <g data-part="port-rim"><path d="m662 385 3 2v59l-3-2Z" fill="var(--fire-metal-light)" /><path d="m644 446 49 27v5l-49-27Z" fill="var(--fire-metal-dark)" /></g>
      <g data-part="fire" opacity="0">
        <g data-flame="0"><path class="flame-outer" fill="#d77e3e" /><path class="flame-inner" fill="#f2bc60" /><path class="flame-core" fill="#f8dda0" /></g>
        <g data-flame="1"><path class="flame-outer" fill="#c86b38" /><path class="flame-inner" fill="#eaa34d" /><path class="flame-core" fill="#f6d68a" /></g>
        <g data-flame="2"><path class="flame-outer" fill="#df8942" /><path class="flame-inner" fill="#f4c469" /><path class="flame-core" fill="#f9e2aa" /></g>
        <g data-flame="3"><path class="flame-outer" fill="#d77e3e" /><path class="flame-inner" fill="#f2bc60" /><path class="flame-core" fill="#f8dda0" /></g>
        <g data-flame="4"><path class="flame-outer" fill="#d17438" /><path class="flame-inner" fill="#edb255" /><path class="flame-core" fill="#f8dda0" /></g>
        <g data-flame="5"><path class="flame-outer" fill="#df8942" /><path class="flame-inner" fill="#f4c469" /><path class="flame-core" fill="#f9e2aa" /></g>
        <g data-flame="6"><path class="flame-outer" fill="#c86b38" /><path class="flame-inner" fill="#eaa34d" /><path class="flame-core" fill="#f6d68a" /></g>
      </g>
      <g data-part="embers" fill="#efb457" opacity="0"><path data-ember="0" d="m0-5 3 5-3 5-3-5Z" /><path data-ember="1" d="m0-4 2 4-2 4-2-4Z" /><path data-ember="2" d="m0-5 3 5-3 5-3-5Z" /><path data-ember="3" d="m0-4 2 4-2 4-2-4Z" /><path data-ember="4" d="m0-5 3 5-3 5-3-5Z" /><path data-ember="5" d="m0-4 2 4-2 4-2-4Z" /><path data-ember="6" d="m0-5 3 5-3 5-3-5Z" /><path data-ember="7" d="m0-4 2 4-2 4-2-4Z" /></g>
      <g data-part="blast" opacity="0" transform="translate(778 367)">
        <path d="m0-127 24 56 54-25-8 54 63 4-39 42 42 39-64 4 10 59-57-26-25 61-24-62-58 27 8-58-64-4 42-42-39-39 61-8-7-53 53 29Z" fill="#e5a44e" /><path d="m0-88 18 44 37-17-5 37 45 3-29 30 30 25-45 3 6 39-39-17-18 40-16-42-40 18 6-38-44-4 29-28-27-28 42-4-4-37 37 20Z" fill="#f7dc96" />
      </g>
      <g data-part="debris" opacity="0"><path data-debris="0" d="m-10-5 18-2 4 9-20 3Z" fill="var(--fire-metal-dark)" /><path data-debris="1" d="m-8-7 16 4-3 10-14-4Z" fill="var(--fire-metal-light)" /><path data-debris="2" d="m-5-6 12 1 2 10-10 2Z" fill="#b49c70" /><path data-debris="3" d="m-8-4 15-2 4 8-16 3Z" fill="var(--fire-panel-front)" /><path data-debris="4" d="m-6-8 10 3-2 13-9-4Z" fill="#9a8260" /></g>
      <path d="M-1000-800H2000V1200H-1000Z" :fill="`url(#${uid}-grain)`" pointer-events="none" />
    </g>
    <path d="M40 78 43 581Q44 614 80 613" fill="none" stroke="#fff8de" stroke-width="2" opacity=".35" />
  </g>
</svg>

    </div>
    <div class="fire-scene__controls">
      <button class="fire-scene__control" type="button" aria-label="重新播放动画" @click="replay"><RotateCcw :size="13" aria-hidden="true" /><span>重播</span></button>
      <button v-if="canAnimate" class="fire-scene__control" type="button" :aria-label="userPaused ? '继续动画' : '暂停动画'" :aria-pressed="userPaused" @click="userPaused = !userPaused"><Play v-if="userPaused" :size="13" aria-hidden="true" /><Pause v-else :size="13" aria-hidden="true" /></button>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Pause, Play, RotateCcw } from 'lucide-vue-next'
import { useApple } from '../../src'
import { resolveMotion } from '../../src/core/context'
import { createServerFireStory, type ServerFirePhase, type ServerFireStory } from './server-fire-paper-story'

const uid = `server-fire-${useId().replace(/:/g, '')}`
const apple = useApple()
const dark = computed(() => apple.theme.value.current.scheme === 'dark')
const scene = ref<HTMLElement>()
const art = ref<SVGSVGElement>()
const media = typeof window === 'undefined' ? undefined : window.matchMedia('(prefers-reduced-motion: reduce)')
const systemReduced = ref(media?.matches ?? false)
const canAnimate = computed(() => resolveMotion('inherit', apple.motion.value.mode, apple.motion.value.reduced || systemReduced.value) === 'full')
const userPaused = ref(false)
const hidden = ref(typeof document !== 'undefined' && document.hidden)
const offscreen = ref(false)
const suspended = computed(() => userPaused.value || hidden.value || offscreen.value)
const phase = ref<ServerFirePhase>('delivery')
let player: ServerFireStory | undefined
let observer: IntersectionObserver | undefined
let mounted = false

function replay() { userPaused.value = false; player?.replay() }
function visibilityChanged() { hidden.value = document.hidden }
function motionChanged() { systemReduced.value = media?.matches ?? false }
watch(suspended, paused => player?.setPaused(paused), { flush: 'sync' })
watch(canAnimate, enabled => player?.setReduced(!enabled), { flush: 'post' })
onMounted(async () => {
  mounted = true
  document.addEventListener('visibilitychange', visibilityChanged)
  media?.addEventListener('change', motionChanged)
  if (typeof IntersectionObserver !== 'undefined' && scene.value) {
    observer = new IntersectionObserver(entries => { if (entries[0]) offscreen.value = !entries[0].isIntersecting }, { threshold: 0 })
    observer.observe(scene.value)
  }
  await nextTick()
  if (!mounted || !art.value) return
  player = createServerFireStory(art.value, { reduced: !canAnimate.value, onPhase: value => { phase.value = value } })
  player.setPaused(suspended.value)
})
onBeforeUnmount(() => {
  mounted = false
  player?.dispose()
  observer?.disconnect()
  media?.removeEventListener('change', motionChanged)
  document.removeEventListener('visibilitychange', visibilityChanged)
})
</script>

<style scoped>
.fire-scene {
  --fire-wall: #f1e8d5; --fire-panel: #d9dcc1; --fire-sidewall: #dddcc6;
  --fire-floor: #d8c6a3; --fire-floor-line: #ad9574; --fire-baseboard: #b9b698;
  --fire-frame: #d4cbbb; --fire-window-frame: #e2d3b0; --fire-window-dark: #c1b38f;
  --fire-window-sky: #e4e6ce; --fire-sun: #fff3cf; --fire-hill-far: #bdcbb0;
  --fire-hill-fold: #d1d7b9; --fire-hill-near: #9eb58f; --fire-leaf-dark: #6c896c;
  --fire-leaf-light: #94a77a; --fire-pot: #bd9170; --fire-pot-light: #d1a985;
  --fire-pot-dark: #876d50; --fire-metal: #7d9287; --fire-metal-light: #a8b5a1;
  --fire-metal-pale: #c4cbb1; --fire-metal-dark: #526e63; --fire-panel-front: #637f73;
  --fire-vent: #3e594e; --fire-cavity: #354a3d; --fire-label: #e6e6cc;
  --fire-lamp: #f4e7bb; --fire-cable: #69765f; --fire-conduit: #a7b09b;
  --fire-conduit-light: #d4d6bc; --fire-conduit-dark: #899884;
  --fire-smoke: #b6b5a3; --fire-smoke-light: #d2cebb; --fire-ground-shadow: #64563d;
  position: relative; min-width: 0; margin: 0;
}
.fire-scene--dark {
  --fire-wall: #293b3b; --fire-panel: #3c5147; --fire-sidewall: #263936;
  --fire-floor: #7b7a5d; --fire-floor-line: #565e46; --fire-baseboard: #586951;
  --fire-frame: #142224; --fire-window-frame: #85977b; --fire-window-dark: #526853;
  --fire-window-sky: #334e53; --fire-sun: #e2d6a2; --fire-hill-far: #506d5e;
  --fire-hill-fold: #637d64; --fire-hill-near: #3e5f4a; --fire-leaf-dark: #314e3c;
  --fire-leaf-light: #739365; --fire-pot: #a37e5c; --fire-pot-light: #b4946e;
  --fire-pot-dark: #69563e; --fire-metal: #648477; --fire-metal-light: #8da694;
  --fire-metal-pale: #b9c5a6; --fire-metal-dark: #345b4d; --fire-panel-front: #496e5e;
  --fire-vent: #24493a; --fire-cavity: #1c3027; --fire-label: #dee2c6;
  --fire-lamp: #e7d498; --fire-cable: #b2b18d; --fire-conduit: #647c69;
  --fire-conduit-light: #8c9f84; --fire-conduit-dark: #405b4c;
  --fire-smoke: #839486; --fire-smoke-light: #a5b19b; --fire-ground-shadow: #142920;
}
.fire-scene__window { overflow: hidden; padding: 4px; }
.fire-scene__art { display: block; width: 100%; height: auto; overflow: visible; }
.fire-scene__controls { display: flex; align-items: center; justify-content: flex-end; gap: 2px; margin: -3px 1.5% 0 0; }
.fire-scene__control { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 36px; min-width: 36px; padding: 6px 10px; color: var(--apple-secondary, #73796b); background: transparent; border: 0; border-radius: 18px; font: inherit; font-size: 11px; cursor: pointer; }
.fire-scene__control:hover { background: var(--apple-hover, #71816b12); }
.fire-scene__control:focus-visible { outline: 2px solid var(--apple-accent, #6f8e79); outline-offset: 3px; }
.fire-scene__control svg { width: 13px; height: 13px; }
.fire-scene__control[hidden] { display: none; }
@media (max-width: 880px) { .fire-scene__window { margin-inline: -10px; } }
@media (pointer: coarse) { .fire-scene__control { min-height: 44px; min-width: 44px; } }

</style>
