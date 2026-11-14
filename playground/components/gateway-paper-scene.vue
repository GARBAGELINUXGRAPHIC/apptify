<template>
  <figure class="gateway-scene" :class="{ 'gateway-scene--dark': dark }">
    <div class="gateway-scene__window">
<svg class="gateway-scene__art" ref="art" data-gateway-scene viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg" role="img" :aria-labelledby="`${uid}-title ${uid}-desc`">
<title :id="`${uid}-title`">青蛙与送往城镇的包裹</title>
<desc :id="`${uid}-desc`">飞虫带着包裹飞向城镇，守在城门里的青蛙伸出舌头，将飞虫和包裹一起吞下。</desc>
<defs>
  <linearGradient :id="`${uid}-sky`" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="var(--gateway-sky-top)"/><stop offset="1" stop-color="var(--gateway-sky)"/></linearGradient>
  <linearGradient :id="`${uid}-stone`" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="var(--gateway-stone)"/><stop offset="1" stop-color="var(--gateway-stone-shadow)"/></linearGradient>
  <linearGradient :id="`${uid}-wood`" x1="0" y1="0" x2="1" y2=".3"><stop stop-color="#cc9969"/><stop offset="1" stop-color="#a77750"/></linearGradient>
  <filter :id="`${uid}-shadow`" x="-25%" y="-25%" width="160%" height="165%"><feDropShadow dx="1.3" dy="5" stdDeviation="2.7" flood-color="#4b4031" flood-opacity=".16"/></filter>
  <filter :id="`${uid}-soft`" x="-25%" y="-30%" width="160%" height="175%"><feDropShadow dx=".6" dy="2.2" stdDeviation="1.35" flood-color="#4b4031" flood-opacity=".15"/></filter>
  <pattern :id="`${uid}-grain`" width="53" height="47" patternUnits="userSpaceOnUse"><path d="m5 8 .6-.2m27 13 .7-.4m13 15 .5-.2M16 40l.7-.2" stroke="#665236" stroke-width=".65" stroke-opacity=".1"/><path d="m12 15 1.3-.5m29-9 1-.4m-19 27 1.1-.4" stroke="#fff9e5" stroke-width=".8" stroke-opacity=".34"/></pattern>
  <clipPath :id="`${uid}-frame`"><path d="M38 80Q38 40 80 36L1111 22Q1155 22 1162 71L1183 631Q1185 670 1139 682L87 704Q35 702 34 657Z"/></clipPath>
  <g :id="`${uid}-pine`"><path d="M0-112-32-53-18-56-48-11-28-16-58 31H52L27-17 43-10 17-57 31-52Z" fill="currentColor"/><path d="M0-112V31H52L27-17 43-10 17-57 31-52Z" fill="#f6edcc" fill-opacity=".1"/><path d="M-2 18V49" stroke="currentColor" stroke-width="7"/></g>
  <g :id="`${uid}-bush`"><path d="M-49 0-46-23-28-30-19-47 6-48 21-34 41-36 55-16 52 0Z" fill="currentColor"/><path d="m-19-47 7 24 33-11-15-14Z" fill="#e9dbb0" fill-opacity=".12"/></g>
</defs>
<path d="M47 92Q46 49 88 47L1120 33Q1167 35 1175 84L1194 642Q1196 686 1146 694L94 715Q44 713 44 665Z" fill="var(--gateway-frame-shadow)"/>
<g :clip-path="`url(#${uid}-frame)`">
 <path d="M0 0H1200V720H0Z" :fill="`url(#${uid}-sky)`"/>
 <g data-part="camera">
  <circle cx="895" cy="143" r="48" fill="var(--gateway-sun)"/>
  <path d="M-1200 348 14 293 178 217 330 298 461 203 635 312 802 265 981 308 1173 232 2400 348V1000H-1200Z" fill="var(--gateway-mountain-far)"/>
  <path d="m178 217 152 81 131-95-92 116-128 12-91-52-145 63Z" fill="var(--gateway-mountain-fold)"/>
  <path d="M-1500 416 56 357 203 330 360 382 499 324 639 373 810 338 1011 364 1230 306 2500 410V1100H-1500Z" fill="var(--gateway-mountain-near)"/>
  <g color="var(--gateway-pine)"><use :href="`#${uid}-pine`" transform="translate(307 415) scale(.64)"/><use :href="`#${uid}-pine`" transform="translate(352 423) scale(.36)"/><use :href="`#${uid}-pine`" transform="translate(414 430) scale(.47)"/></g>
  <path d="M-1600 467Q-100 388 183 425T680 430Q983 386 2800 436V1800H-1600Z" fill="var(--gateway-ground-back)"/>
  <path d="M-1600 501Q18 441 267 459T738 465Q1000 441 2800 492V1800H-1600Z" fill="var(--gateway-ground)"/>

  <g data-part="town-far">
   <path d="M926 346V188l26-7v-19h24v18l29-3v-22h25v23l28 2v-20h23v24l19 3v165Z" fill="#b9b8a0"/>
   <path d="m926 188 25 9 149 4v-14l-19-3v-24h-23v20l-28-2v-23h-25v22l-29 3v-18h-24v19Z" fill="#d1ccb2"/>
   <path d="M926 188 950 198V349l-24-3Z" fill="#a5ac96"/>
   <path d="M950 212h150m-150 39h150m-150 40h150m-120-78v38m67-38v38m-35 1v40m63-40v40" stroke="#929a85" stroke-width="1.5" stroke-opacity=".25" fill="none"/>
   <g fill="#7b8977"><path d="M975 226q0-11 8-11t8 11v17h-16Z"/><path d="M1036 225q0-11 8-11t8 11v17h-16Z"/><path d="M1005 280q0-11 8-11t8 11v19h-16Z"/></g>
   <path d="M1083 341V249l25-5 27 8v97Z" fill="#b3b5a0"/>
   <path d="m1075 251 33-58 35 61-34-6Z" fill="#8e9180"/>
   <path d="m1108 193 35 61-34-6Z" fill="#a6a48d"/>
   <path d="M899 372V276l18-6 21 7v103Z" fill="#c6c3a8"/>
   <path d="m891 277 26-47 30 50-30-7Z" fill="#a39b85"/>
   <path d="M1013 157v-31" stroke="#8a826c" stroke-width="2.3"/>
   <g data-part="flag-keep"><path d="M1014 127q16-8 34 0l-7 8 7 8q-17-8-34 0Z" fill="#b8916d"/><path d="M1015 128q14-6 28-1" stroke="#d5b58a" stroke-width="1" fill="none"/></g>
  </g>

  <path d="M-1200 566Q25 492 351 506L674 512Q773 514 855 477L1035 420 1195 421 1230 464 1050 469Q902 517 816 549L675 570Q370 577 130 566L-1200 645Z" fill="var(--gateway-road)"/>
  <path d="M-1200 578Q25 505 351 518L674 524Q790 524 862 489L1042 435 1198 434" fill="none" stroke="var(--gateway-road-light)" stroke-width="3"/>
  <path d="M-1200 645 130 566Q370 577 675 570L816 549Q902 517 1050 469l180-5" fill="none" stroke="var(--gateway-road-edge)" stroke-width="2"/>
  <g fill="#c1b293"><path d="m794 529 38-10 27 3-43 11Z"/><path d="m863 506 30-10 28 1-33 12Z"/><path d="m936 479 28-10 26 0-33 12Z"/><path d="m1017 450 26-8 30 1-29 9Z"/></g>

  <g data-part="town" :filter="`url(#${uid}-soft)`">
   <path d="M799 427 793 337 839 300 885 336 888 432Z" fill="#dcccad"/>
   <path d="M839 300 885 336 888 432 850 430 846 340Z" fill="#c3b294"/>
   <path d="m780 340 58-51 67 51-24 6-43-37-46 39Z" fill="#ab795e"/>
   <path d="m838 289 67 51-24 6-43-37Z" fill="#8b6351"/>
   <path d="M803 337v88m33-111 3 114m-39-51 49 3m-47 18 45-1" stroke="#9d8768" stroke-width="4" fill="none"/>
   <path d="M810 351h17v18h-17Z" fill="#7d8170"/><path d="M811 352h7v15h-7Z" fill="#e0cb94"/>
   <path d="M815 427v-22q0-11 10-11t10 11v23Z" fill="#8c795f"/>

   <path d="M916 401V315l39-21 47 23v86Z" fill="#d8c5a2"/>
   <path d="M955 294 1002 317V403l-38-3Z" fill="#b7a388"/>
   <path d="m902 320 51-67 60 67-57-12Z" fill="#a47159"/>
   <path d="m953 253 60 67-57-12Z" fill="#bf9068"/>
   <path d="M928 349q0-9 8-9t8 9v21h-16Z" fill="#847c65"/>
   <path d="M931 348h5v19h-5Z" fill="#dfc994"/>
   <path d="M976 344h13v24h-13Z" fill="#756e5d"/>
   <path d="M954 257v-32" stroke="#88755b" stroke-width="2.5"/>
   <g data-part="flag-town"><path d="M955 225q16-6 28 0l-6 6 6 7q-13-5-28 0Z" fill="#a36f56"/></g>

   <path d="M1015 435 1012 351 1052 317 1109 350 1112 433Z" fill="#ddceb2"/>
   <path d="M1052 317 1109 350 1112 433 1070 433l-6-80Z" fill="#c3b296"/>
   <path d="m998 356 52-53 74 49-17 10-57-39-41 37Z" fill="#859183"/>
   <path d="m1050 303 74 49-17 10-57-39Z" fill="#687b73"/>
   <path d="M1022 359v71m33-104 5 107m-42-39 90-3m-87-24 29 14m28-15 24 21" stroke="#9d8c70" stroke-width="3.5" fill="none"/>
   <path d="M1030 366h15v20h-15Zm47 0h14v20h-14Z" fill="#8f927a"/>
   <path d="M1033 368h5v16h-5Z" fill="#ebd5a6"/>
   <path d="M1032 433v-24q0-11 10-11t10 11v24Z" fill="#9f8967"/>
   <path d="m1023 397 39-2 3 8-42 2Z" fill="#b49167"/>
   <path d="m1039 313-1-21 12-1 1 14Z" fill="#b1a48c"/>

   <path d="M878 455 876 378 919 349 960 379 964 452Z" fill="#ead9b6"/>
   <path d="M919 349 960 379 964 452 926 454 925 381Z" fill="#c6b394"/>
   <path d="m862 382 56-45 58 43-17 8-41-32-42 33Z" fill="#bc8c67"/>
   <path d="m918 337 58 43-17 8-41-32Z" fill="#966d54"/>
   <path d="M882 383h29v24h-29Z" fill="#878a71"/>
   <path d="m896 384 1 22m-13-11h25" stroke="#d7c495" stroke-width="2"/>
   <path d="M897 455v-28q0-11 10-11t10 11v27Z" fill="#9f8969"/>
   <path d="M886 454v-22h5v22" fill="#c4b08b"/>
   <path d="m881 419 40-3 5 9-45 2Z" fill="#8b987a"/>
  </g>
  <g color="#8b9b76"><use :href="`#${uid}-bush`" transform="translate(841 458) scale(.4)"/><use :href="`#${uid}-bush`" transform="translate(989 432) scale(.28)"/></g>
  <g data-part="courtyard-tree" transform="translate(-24 0)" :filter="`url(#${uid}-soft)`">
   <path d="m1124 461 4-75-19-24 5-9 20 23 6-39 10-1-4 45 19-14 8 4-24 25 2 63Z" fill="#a17a55"/>
   <path d="m1093 369-5-28 20-27 27-9 31 10 20 25-5 32-24 19-33 2Z" fill="#8fa07b"/>
   <path d="m1108 314 27-9 31 10 20 25-44 3-37 13-17-15Z" fill="#b4bb88"/>
   <path d="m1142 343 44-3-5 32-24 19-15-22Z" fill="#a1ae7d"/>
  </g>

  <g data-part="tree" :filter="`url(#${uid}-shadow)`">
   <path d="M139 500 150 405 149 332 114 300 82 290 65 263 80 254 113 278 145 291 139 212 177 205 185 314 216 276 235 242 251 245 241 285 193 350 200 423 211 498 178 510Z" :fill="`url(#${uid}-wood)`"/>
   <path d="m174 206 11 108 31-38 19-34 16 3-10 40-48 65 7 73 11 75-25 5-10-90-7-109-8-93Z" fill="#966947"/>
   <path d="m147 226 12 89 4 78-10 86m19-139 4 28m22-49 28-42m-80 42-26-29-34-16" stroke="#7c563d" stroke-width="2" fill="none" stroke-opacity=".46"/>
   <path d="m151 415-5 73m13-260 8 54" stroke="#e6bd86" stroke-width="2" fill="none" stroke-opacity=".55"/>
   <g data-part="canopy">
    <path d="M77 304 42 269 45 212 75 170 119 160 142 121 193 110 236 139 254 178 290 199 302 242 282 285 239 301 213 329 162 333 124 312Z" fill="var(--gateway-canopy-dark)"/>
    <path d="M45 212 75 170 119 160 155 189 140 235 100 256 42 269Z" fill="var(--gateway-canopy-edge)"/>
    <path d="m119 160 23-39 51-11 43 29 18 39-47 23-52-12Z" fill="var(--gateway-canopy-light)"/>
    <path d="m193 110 43 29 18 39-47 23-25-46Z" fill="var(--gateway-canopy-fold)"/>
    <path d="m254 178 36 21 12 43-20 43-43 16-30-49-2-51Z" fill="var(--gateway-canopy-side)"/>
    <path d="m140 235 15-46 52 12 2 51 30 49-26 28-51 4-38-21-47-8-35-35 58-13Z" fill="var(--gateway-canopy-mid)"/>
    <path d="m140 235 69 17 30 49-26 28-51 4-38-21 22-31Z" fill="var(--gateway-canopy-front)"/>
    <path d="m42 269 58-13 46 25-22 31-47-8Z" fill="var(--gateway-canopy-shadow)"/>
    <path d="m75 170 61 24m6-73 40 34m57 146-30-49" stroke="#e9ddb4" stroke-width="1.5" stroke-opacity=".36" fill="none"/>
   </g>
  </g>
  <g color="#8c9d71"><use :href="`#${uid}-bush`" transform="translate(110 506) scale(.54)"/><use :href="`#${uid}-bush`" transform="translate(247 495) scale(.35)"/></g>
  <g color="#71896b"><use :href="`#${uid}-bush`" transform="translate(66 513) scale(.5)"/></g>

  <path d="m479 546 280-8 51 21-301 11Z" fill="#8c866a" fill-opacity=".22"/>
  <g data-part="gateway" :filter="`url(#${uid}-shadow)`">
   <path d="M498 539 503 300 734 292 761 304 764 538Z" fill="#b2a78a"/>
   <path d="M521 540 523 411Q525 345 587 331 653 317 702 352 733 375 733 415V539Z" fill="#7c8370"/>
   <path d="M539 540V414Q540 359 591 345 647 333 693 365 714 383 715 416V541Z" fill="#8f977b"/>
   <path d="M550 541V418Q550 371 596 356 650 345 690 378 706 395 706 420V543Z" fill="#9ca487"/>
   <path d="m563 409 53-38 41 13 23 42v116H559Z" fill="#a5ad8c"/>
   <path d="M531 503 722 496l12 45-211 0Z" fill="#b4b18f"/>
   <path d="m552 501 47-3m72-2 35-1" stroke="#d2c9a4" stroke-width="1.4" fill="none"/>
   <path d="M498 539 504 311 531 310 527 541Z" fill="#cbbb9b"/>
   <path d="M734 302 761 304 764 538l-26 7Z" fill="#aa9b81"/>
   <path d="M497 537 524 541l7-130q1-68 64-86 61-15 106 21 28 24 33 66l4 131 27-5-4-126q-3-81-65-110-63-31-121 0-71 32-74 107Z" :fill="`url(#${uid}-stone)`"/>
   <path d="M525 539 529 412Q529 346 590 326 647 309 697 347 728 370 734 413l4 129" fill="none" stroke="#e3d2af" stroke-width="5"/>
   <g fill="none" stroke="#a19176" stroke-width="1.6" stroke-opacity=".65"><path d="m499 459 28 1m-25-65 28 8m-17-54 28 12m6-52 24 25m22-38 12 29m43-31-4 28m47-15-12 26m43 4-21 18m38 21-27 12m33 64-28 2"/></g>
   <path d="m485 302 26-19 250-6 29 18-3 36-298 7Z" fill="#a6977b"/>
   <path d="M486 300v-33l29-2v-24l29-1v24l29-1v-25l31-1v24l31-1v-24l31-1v25l31-1v-23l30-1v23l30-1v-23l29-1v61l-4 26-296 7Z" fill="var(--gateway-stone-light)"/>
   <path d="m486 300 296-7-4 19-292 9Z" fill="#beab8b"/>
   <path d="m486 300 296-7" stroke="#ecddbc" stroke-width="2"/>
   <path d="m515 241 11 8v16l-11 0m58-26 11 9v15l-11 0m62-26 11 9v15l-11 0m61-23 10 8v15l-10 0m60-22 11 9v49l-11-3" fill="#b6a286"/>
   <path d="m573 285 111-3 10 29-124 3Z" fill="#ad8d64"/>
   <path d="m574 282 108-3 10 29-124 3Z" fill="#e0c396"/>
   <path d="m575 283 104-3m-107 28 115-3" stroke="#f6dfb5" stroke-width="1.2" fill="none"/>
   <circle cx="578" cy="293" r="1.7" fill="#a48961"/><circle cx="679" cy="291" r="1.7" fill="#a48961"/>
   <text x="628" y="302" font-family="Georgia, 'Times New Roman', serif" font-size="18" font-weight="600" text-anchor="middle" fill="#725a3d" letter-spacing=".5">gateway</text>
  </g>
  <g fill="#a6ad83"><path d="m477 548 22-2 13 6-37 6Z"/><path d="m756 538 24 0 18 12-41 5Z"/></g>
  <g fill="#83976d"><path d="m483 545-6-19 11 12 2-24 7 24 11-11-7 19Z"/><path d="m771 542-5-19 10 14 7-25 3 27 12-14-8 23Z"/></g>

  <g data-part="frog-root" transform="translate(636 539)">
   <ellipse cx="0" cy="2" rx="91" ry="11" fill="#515b43" fill-opacity=".2"/>
   <g data-part="frog-legs" :filter="`url(#${uid}-soft)`">
    <path d="M-40-56C-60-74-89-57-89-36-89-14-66 1-38-5L-19-26Z" fill="#829c65"/>
    <path d="M40-56C60-74 89-57 89-36 89-14 66 1 38-5L19-26Z" fill="#78935e"/>
    <path d="M-44-54C-62-68-80-51-80-36L-71-19-52-15Z" fill="#9fb37a"/>
    <path d="M45-54C63-67 80-50 80-36L72-23 52-16Z" fill="#92aa6e"/>
    <path d="M-66-14C-83-15-96-6-89-1L-78 0C-76 7-67 8-64 2-60 9-51 8-48 1L-38-5-42-17Z" fill="#91a971"/>
    <path d="M66-14C83-15 96-6 89-1L78 0C76 7 67 8 64 2 60 9 51 8 48 1L38-5 42-17Z" fill="#849e66"/>
   </g>
   <g data-part="frog-torso">
    <path d="M-43-87C-69-64-67-22-47-9-27 7 25 7 47-9 69-26 64-70 40-88Z" fill="#91a96f"/>
    <path d="M-39-80C-54-63-58-35-43-18-27-4 0 0 20-6-12 2-42-11-47-37-51-52-43-67-33-81Z" fill="#adc18a"/>
    <path d="M-32-67C-48-49-46-23-27-12-11-2 16-3 32-14 49-28 44-51 30-68Z" fill="#e5d7ab"/>
    <path d="M20-67C37-50 43-28 26-12L10-5Q23-5 32-14C49-28 44-51 30-68Z" fill="#d4c699"/>
    <g data-part="frog-throat"><path d="M-28-68Q0-84 29-67L22-47Q0-37-23-48Z" fill="#eddfb7"/></g>
   </g>
   <g data-part="frog-head" :filter="`url(#${uid}-soft)`">
    <path d="M-73-84C-90-96-88-119-70-129-75-150-59-168-42-165-25-165-16-151-15-143Q0-148 16-143C21-160 35-168 51-164 70-160 77-146 71-129 90-119 91-98 75-85 44-64-41-64-73-84Z" fill="#9eb77c"/>
    <path d="M-70-129C-75-150-59-168-42-165-25-165-16-151-15-143Q0-148 16-143C21-160 35-168 51-164 66-160 73-151 73-140 64-154 53-158 42-156 31-154 24-143 22-135 4-140-13-140-23-133-24-149-33-157-45-156-59-154-65-145-65-131Z" fill="#bbcb92"/>
    <path d="M-79-119C-86-102-73-91-51-85Q1-69 51-84 73-90 83-106C84-98 81-91 75-85 44-64-41-64-73-84-85-94-88-107-79-119Z" fill="#8ba46a"/>
    <path d="M-58-102Q-49-107-42-102Q-49-94-58-98Z" fill="#c4b58a" fill-opacity=".6"/>
    <path d="M44-102Q53-107 62-102Q54-95 46-98Z" fill="#c4b58a" fill-opacity=".6"/>
    <g data-part="eye-left" transform="translate(-44 -140)">
     <ellipse rx="17" ry="19" fill="#ecdfb9"/>
     <g data-part="pupil-left"><ellipse rx="10.7" ry="13.2" fill="#3e4635"/><ellipse cx="-2.5" cy="-4.5" rx="3" ry="3.4" fill="#faf0d6"/><circle cx="3.4" cy="3.8" r="1.15" fill="#b2bd91"/></g>
    </g>
    <g data-part="eye-right" transform="translate(44 -140)">
     <ellipse rx="17" ry="19" fill="#ecdfb9"/>
     <g data-part="pupil-right"><ellipse rx="10.7" ry="13.2" fill="#3e4635"/><ellipse cx="-2.5" cy="-4.5" rx="3" ry="3.4" fill="#faf0d6"/><circle cx="3.4" cy="3.8" r="1.15" fill="#b2bd91"/></g>
    </g>
    <g fill="#71885a"><ellipse cx="-7" cy="-113" rx="1.8" ry="1.4"/><ellipse cx="7" cy="-113" rx="1.8" ry="1.4"/></g>
    <path d="M-23-94Q0-84 24-94" data-part="mouth-closed" fill="none" stroke="#566f46" stroke-width="2.3" stroke-linecap="round"/>
    <g data-part="mouth-open" display="none"><path data-part="mouth-cavity" d="M-20-96Q0-101 20-96Q22-77 0-77Q-22-77-20-96Z" fill="#52483b"/><path data-part="mouth-inner" d="M-13-82Q0-88 13-82L10-77H-10Z" fill="#b7796b"/></g>
   </g>
   <g data-part="frog-hands">
    <path d="M-44-59Q-37-66-31-57L-24-18Q-11-11-15-4-19 0-25-4-27 7-34 4L-39-2Q-48 5-52-2L-49-12-53-43Z" fill="#a7bc80"/>
    <path d="M44-59Q37-66 31-57L24-18Q11-11 15-4 19 0 25-4 27 7 34 4L39-2Q48 5 52-2L49-12 53-43Z" fill="#99b175"/>
    <path d="M-46-48-40-17m86-31-6 31" stroke="#768f58" stroke-width="1.6" stroke-linecap="round" fill="none"/>
   </g>
  </g>
  <g data-part="tongue" display="none">
   <path data-part="tongue-edge" d="M636 449L636 449" fill="none" stroke="#a9685f" stroke-width="12" stroke-linecap="round"/>
   <path data-part="tongue-fill" d="M636 448L636 448" fill="none" stroke="#d99686" stroke-width="8.2" stroke-linecap="round"/>
   <path data-part="tongue-shine" d="M636 447L636 447" fill="none" stroke="#efbc9f" stroke-width="1.3" stroke-linecap="round"/>
   <g data-part="tongue-tip"><ellipse rx="10.5" ry="7.5" fill="#d99686"/><path d="M-5-1Q0-5 5-1" stroke="#efbc9f" stroke-width="1.2" fill="none"/></g>
  </g>
  <ellipse data-part="bug-shadow" cx="0" cy="539" rx="20" ry="3" fill="#81785a" fill-opacity=".14"/>
  <g data-part="bug" transform="translate(-180 400)">
   <g data-part="bug-pitch">
    <g data-part="wing-back" transform="rotate(12 -5 -8)"><path d="M-5-9C-23-28-16-48-4-49 10-49 13-30 2-9Z" fill="#c3d2ba"/><path d="M-5-14-3-41" stroke="#f8eed3" stroke-width="1.1" fill="none"/></g>
    <path d="M-19 8-28 19m18-9-2 13m20-12 8 10" data-part="bug-legs" fill="none" stroke="#796b4d" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M-24-8C-21-21 3-25 14-12 25 2 15 16-2 16-21 15-28 5-24-8Z" fill="#c99e5f"/>
    <path d="M-24-8C-21-21 3-25 14-12L8-6Q-5-18-24-8Z" fill="#e4c17e"/>
    <path d="M-12-18Q-3-1-10 14m14-32Q14-3 5 16" stroke="#8d7753" stroke-width="5" fill="none"/>
    <g data-part="bug-bag" transform="rotate(0 -22 -2)" :filter="`url(#${uid}-soft)`">
     <path d="M-26-6Q-27-18-39-17-48-16-48-9" fill="none" stroke="#a07a50" stroke-width="3"/>
     <path d="M-57-5Q-57-12-48-12L-28-10Q-21-9-22-1L-24 27Q-42 31-59 22Z" fill="#d5ac73"/>
     <path d="M-57-5-58 22-49 26-47-9Z" fill="#bb8f5d"/>
     <path d="M-57-7-29-8-24-2-27 5-55 3Z" fill="#e4c38c"/>
     <path d="M-56 3-27 5" stroke="#b48b58" stroke-width="1"/>
     <path d="m-50 24 20 2" stroke="#e9cc97" stroke-width="1"/>
     <text x="-40" y="18" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="8.4" font-weight="600" fill="#725437">packet</text>
    </g>
    <g data-part="wing-front" transform="rotate(-20 -5 -9)"><path d="M-5-9C-29-18-41-43-28-50-12-59 4-32 0-11Z" fill="#e1e4ce"/><path d="M-7-15-25-44m17 20-15-3" stroke="#a4b9a5" stroke-width="1" fill="none"/></g>
    <path d="M6-12C12-24 33-19 36-6 40 8 30 18 17 14 3 11-1-1 6-12Z" fill="#a4b17b"/>
    <path d="M8-13Q20-24 31-13" stroke="#cad29b" stroke-width="2.3" fill="none" stroke-linecap="round"/>
    <ellipse cx="26" cy="-4" rx="3" ry="3.9" fill="#3e4432"/><circle cx="26.8" cy="-5.2" r="1.1" fill="#faf0d5"/>
    <path d="M30 6q3 1 4-1" fill="none" stroke="#6e7950" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M13-18q-6-13-13-12m24 13q2-14 10-17" fill="none" stroke="#74805b" stroke-width="2" stroke-linecap="round"/>
    <circle cx="0" cy="-30" r="2.2" fill="#7c8860"/><circle cx="34" cy="-34" r="2.2" fill="#7c8860"/>
   </g>
  </g>
  <g data-part="lip-root" transform="translate(636 539)"><g data-part="lip-head">
   <path data-part="lip-front" d="M-23-94Q0-84 24-94" fill="none" stroke="#8ba46a" stroke-width="3" stroke-linecap="round"/>
  </g></g>

  <g fill="#aeaa83"><path d="m328 551 15-3 15 3-20 4Z"/><path d="m407 529 11-2 10 3-13 2Z"/><path d="m264 544 7-2 9 3-10 2Z"/></g>
  <g fill="none" stroke="#d9cda8" stroke-width="1.7"><path d="m236 568 90 0m40-18 42 1m334 13 31-4"/></g>
  <path d="M-1600 655Q10 570 192 599L355 659Q647 627 841 636L1196 584 2800 674V1800H-1600Z" fill="var(--gateway-foreground)"/>
  <path d="M-1600 688Q24 621 167 634L291 689 922 682 1227 640 2800 740V1800H-1600Z" fill="var(--gateway-foreground-near)"/>
  <g fill="#839767"><path d="m272 604-8-26 15 19 4-33 7 33 17-16-10 27Z"/><path d="m764 625-5-21 11 16 5-29 6 28 13-14-7 23Z"/><path d="m1077 590-8-26 14 19 5-35 7 35 16-20-9 29Z"/></g>
  <g fill="#c9c694"><path d="m99 643-8-23 13 13 4-29 6 30 15-14-9 25Z"/></g>
  <g color="#728a6a"><use :href="`#${uid}-bush`" transform="translate(1121 646) scale(.8)"/></g>
  <path d="M-1600-1000H2800V1800H-1600Z" :fill="`url(#${uid}-grain)`" pointer-events="none"/>
 </g>
</g>
<path d="M42 83 40 645Q40 682 85 681" fill="none" stroke="#fff8e0" stroke-width="2" stroke-opacity=".48"/>
</svg>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { createGatewayStory, type GatewayStory } from './gateway-paper-story'

const uid = `gateway-${useId().replace(/:/g, '')}`
const props = defineProps<{ theme: 'light' | 'dark'; motion: 'full' | 'reduced' | 'none'; paused: boolean }>()
const art = ref<SVGSVGElement>()
const dark = computed(() => props.theme === 'dark')
const canAnimate = computed(() => props.motion === 'full')
let player: GatewayStory | undefined
let mounted = false

function syncPaused() {
  if (props.paused) player?.pause()
  else player?.play()
}
watch(() => props.paused, syncPaused)
watch(canAnimate, enabled => { player?.setReducedMotion(!enabled) }, { flush: 'post' })
onMounted(async () => {
  mounted = true
  await nextTick()
  if (!mounted || !art.value) return
  player = createGatewayStory(art.value, !canAnimate.value)
  syncPaused()
})
onBeforeUnmount(() => { mounted = false; player?.dispose() })
defineExpose({ replay: () => player?.replay() })
</script>

<style scoped>
.gateway-scene {
  --gateway-sky-top: #f4ead8;
  --gateway-sky: #e5e2c9;
  --gateway-frame-shadow: #d5ccba;
  --gateway-sun: #fbf1cf;
  --gateway-mountain-far: #d8d9bf;
  --gateway-mountain-fold: #e5e0c5;
  --gateway-mountain-near: #b9c3a5;
  --gateway-pine: #92a184;
  --gateway-ground-back: #aebb95;
  --gateway-ground: #c4c79f;
  --gateway-road: #d5c59e;
  --gateway-road-light: #eadabd;
  --gateway-road-edge: #b4ad87;
  --gateway-foreground: #a7b28b;
  --gateway-foreground-near: #819877;
  --gateway-canopy-dark: #82936e;
  --gateway-canopy-mid: #aab681;
  --gateway-canopy-light: #bcc18a;
  --gateway-canopy-fold: #a7b47c;
  --gateway-canopy-edge: #a8b17a;
  --gateway-canopy-side: #91a173;
  --gateway-canopy-front: #bbc18b;
  --gateway-canopy-shadow: #8a9b70;
  --gateway-stone: #d4c4a4;
  --gateway-stone-shadow: #b9aa8d;
  --gateway-stone-light: #d6c5a2;
  position: relative; min-width: 0; margin: 0;
}
.gateway-scene--dark {
  --gateway-sky-top: #253536;
  --gateway-sky: #354a47;
  --gateway-frame-shadow: #121d1f;
  --gateway-sun: #ddcd9d;
  --gateway-mountain-far: #3a5149;
  --gateway-mountain-fold: #3f5850;
  --gateway-mountain-near: #466357;
  --gateway-pine: #78917b;
  --gateway-ground-back: #60795c;
  --gateway-ground: #788462;
  --gateway-road: #9c9d72;
  --gateway-road-light: #c0b58a;
  --gateway-road-edge: #727a57;
  --gateway-foreground: #526c4b;
  --gateway-foreground-near: #334e42;
  --gateway-canopy-dark: #496549;
  --gateway-canopy-mid: #738958;
  --gateway-canopy-light: #94a66b;
  --gateway-canopy-fold: #7d9662;
  --gateway-canopy-edge: #81935a;
  --gateway-canopy-side: #59764d;
  --gateway-canopy-front: #8c9e65;
  --gateway-canopy-shadow: #546f48;
  --gateway-stone: #a49e7d;
  --gateway-stone-shadow: #817f64;
  --gateway-stone-light: #b0aa86;
}
.gateway-scene__window { overflow: hidden; padding: 4px; }
.gateway-scene__art { display: block; width: 100%; height: auto; overflow: visible; isolation: isolate; }
@media (max-width: 880px) { .gateway-scene__window { margin-inline: -12px; } }
</style>
