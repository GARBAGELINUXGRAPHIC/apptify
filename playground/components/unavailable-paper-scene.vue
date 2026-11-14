<template>
<figure ref="root" class="paper-503-shell unavailable-scene" :class="`is-${theme}`">
      <div class="unavailable-scene__window"><svg class="unavailable-scene__art" data-scene viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg" role="img" :aria-labelledby="`${uid}-title ${uid}-desc`">
  <title :id="`${uid}-title`">传送带、包裹山与熟睡的考拉</title>
  <desc :id="`${uid}-desc`">包裹沿传送带移动，落到积压的包裹山上。镜头拉远后，值班的考拉正窝在椅子里熟睡，任由包裹不断堆积。</desc>
  <defs>
    <linearGradient :id="`${uid}-wall`" x2=".25" y2="1"><stop stop-color="var(--scene-wall-top)"/><stop offset="1" stop-color="var(--scene-wall)"/></linearGradient>
    <linearGradient :id="`${uid}-window`" x2=".4" y2="1"><stop stop-color="#eee5c9"/><stop offset="1" stop-color="#d7dcc2"/></linearGradient>
    <filter :id="`${uid}-shadow`" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="1.2" dy="4.5" stdDeviation="2.4" flood-color="#4b4031" flood-opacity=".15"/></filter>
    <filter :id="`${uid}-soft`" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx=".8" dy="2.5" stdDeviation="1.2" flood-color="#4b4031" flood-opacity=".13"/></filter>
    <pattern :id="`${uid}-grain`" width="47" height="43" patternUnits="userSpaceOnUse"><path d="m4 8 1-.4m24 12 .7-.3m11 13 1-.2m-24 5 .6-.3" stroke="#665236" stroke-opacity=".12" stroke-width=".75"/><path d="m13 13 2-.6m19-7 1.2-.4m-10 24 1.8-.5" stroke="#fff9e5" stroke-opacity=".35" stroke-width=".9"/></pattern>
    <clipPath :id="`${uid}-frame`"><path d="M38 80Q38 40 80 36L1111 22Q1155 22 1162 71L1183 631Q1185 670 1139 682L87 704Q35 702 34 657Z"/></clipPath>
    <clipPath :id="`${uid}-belt-clip`"><path d="M-400 344H459a24 24 0 0 1 0 48H-400Z"/></clipPath>
    <clipPath :id="`${uid}-window-clip`"><path d="M120 107 370 100 372 263 120 267Z"/></clipPath>
    <g :id="`${uid}-box`">
      <path d="M-42-60 28-60V0H-42Z" fill="var(--box-front,#c39260)"/>
      <path d="m28-60 20-16v60L28 0Z" fill="var(--box-side,#a4754e)"/>
      <path d="m-42-60 20-16h70L28-60Z" fill="var(--box-top,#dfb57e)"/>
      <path d="M-12-60H2V0H-12Z" fill="#e6cca2"/>
      <path d="m-12-60 20-16h14L2-60Z" fill="#f0d9b2"/>
      <path d="m-40-58 66 0m4 1 16-13" stroke="#edca94" stroke-width="1.2" fill="none"/>
      <path d="m-41-1 67 0m21-15-17 14" stroke="#795c42" stroke-width="1.2" stroke-opacity=".38" fill="none"/>
      <path d="M9-41H24V-22H9Z" fill="#f0e5cb"/>
      <path d="M12-36h8m-8 3h5m-5 5h1m2 0h1m2 0h2" stroke="#938574" stroke-width="1.3" fill="none"/>
      <path d="m-34-17 0-10m-3 3 3-3 3 3m6 7v-10m-3 3 3-3 3 3" stroke="#816145" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".75"/>
      <path d="m-30-49 6-2m-12 40 7-1m67-43 3-2" stroke="#f3d4a3" stroke-width="1.1" stroke-opacity=".5"/>
    </g>
    <g :id="`${uid}-leaf`"><path d="M0 0C-18-5-27-22-18-40 0-33 8-15 0 0Z" fill="currentColor"/><path d="M0 0-15-32" stroke="#d2d6b7" stroke-width="1" stroke-opacity=".55"/></g>
  </defs>
  <path d="M47 92Q46 49 88 47L1120 33Q1167 35 1175 84L1194 642Q1196 686 1146 694L94 715Q44 713 44 665Z" fill="var(--scene-frame-shadow)"/>
  <g :clip-path="`url(#${uid}-frame)`">
    <path d="M0 0H1200V720H0Z" :fill="`url(#${uid}-wall)`"/>
    <g data-part="camera">
      <!-- Everything in the depot shares one camera. -->
      <path d="M-1800-700H2800V1200H-1800Z" :fill="`url(#${uid}-wall)`"/>
      <path d="M-1400 530 2400 475V1400H-1400Z" fill="var(--scene-floor)"/>
      <path d="M-1400 544 2400 489" stroke="var(--scene-floor-edge)" stroke-width="5"/>
      <path d="M-100 603 1270 576M230 528-65 790m460-266-49 255m239-258 148 260m159-269 331 266" stroke="var(--scene-floor-line)" stroke-width="1.6" stroke-opacity=".52" fill="none"/>
      <path d="m46 34 1098-17 10 54L42 92Z" fill="var(--scene-timber)"/>
      <path d="m50 36 1094-17 4 14L46 53Z" fill="#c3aa85"/>
      <path d="m1034 64 31-1 17 453-29 5Z" fill="var(--scene-timber)"/>
      <path d="m1034 64 11 1 18 451-10 5Z" fill="#ceb58d"/>
      <path d="m1048 82-126 111 9 13 123-103Z" fill="#b69c77"/>
      <path d="m450 76 16-1 0 211-16 0Z" fill="#cabb99"/>
      <path d="m450 76 6 0 1 207-7 3Z" fill="#d4c5a5"/>
      <!-- A paper landscape through the workshop window. -->
      <path d="m104 91 281-9 4 198-284 9Z" fill="#baa98b"/>
      <path d="m112 99 265-8 2 181-266 8Z" fill="#8c9781"/>
      <g :clip-path="`url(#${uid}-window-clip)`">
        <path d="M110 91H386V280H110Z" :fill="`url(#${uid}-window)`"/>
        <circle cx="294" cy="149" r="27" fill="#faf0c9"/>
        <path d="m82 239 83-64 53 37 62-36 115 65v58H82Z" fill="#bcc5a6"/>
        <path d="m165 175 53 37 62-36-23 43-57 10Z" fill="#d0d2b1"/>
        <path d="M91 256 161 226 226 247 303 217 402 255V292H91Z" fill="#9eaf90"/>
        <path d="M98 272Q181 246 252 264T402 256V300H98Z" fill="#b8bf95"/>
        <path d="m137 268 3-41m0 24-15-18m16 5 10-20" stroke="#849579" stroke-width="4" fill="none"/>
        <path d="m113 228 6-18 18-8 17 4 14 16-6 17-22 3-21-5Z" fill="#839979"/>
        <path d="m119 210 18-8 17 4 5 13-20 10-26-1Z" fill="#a7b48c"/>
      </g>
      <path d="M240 102v163m-119-82 250-6" stroke="#d9c8a6" stroke-width="9"/>
      <path d="M243 103v161m-121-80 248-6" stroke="#8e927a" stroke-width="2"/>
      <path d="m97 279 294-9 10 13-305 10Z" fill="#d0b58d"/>
      <path d="m96 293 305-10-2 8-303 11Z" fill="#a8906d"/>
      <path d="M134 282 391 289 501 525 241 533Z" fill="#f9edc6" fill-opacity=".2"/>
      <!-- Clock and an untouched work sheet. No explanatory text in the art. -->
      <g transform="translate(676 156) rotate(-3)" :filter="`url(#${uid}-soft)`">
        <path d="M-48-9-33-42 1-49 34-35 48-3 38 30 9 47-26 40-47 15Z" fill="#b19b78"/>
        <path d="M-40-8-28-35 0-41 28-29 40-2 32 25 7 39-22 33-39 12Z" fill="#eee1be"/>
        <path d="M0-31v6m29 25h-6M0 30v-6m-29-24h6" stroke="#a29476" stroke-width="2"/>
        <path d="M0-19V0l15 8" stroke="#727562" stroke-width="3.2" stroke-linecap="round" fill="none"/>
        <circle r="3.8" fill="#727562"/>
      </g>
      <g transform="translate(835 236) rotate(3)">
        <path d="M-35-43 38-44 40 48-36 49Z" fill="#b49c76"/>
        <path d="M-29-36 32-37 32 41-30 42Z" fill="#ede1c5"/>
        <path d="M-12-44h27v8h-27Z" fill="#879487"/>
        <path d="M-17-22h34m-34 13h29m-29 13h34m-34 13h24" stroke="#c2baa0" stroke-width="2.2"/>
        <path d="m-21-22 3 0m-3 13h3m-3 13h3m-3 13h3" stroke="#9caa8b" stroke-width="3"/>
      </g>
      <!-- Belt legs remain attached to the moving upper belt. -->
      <path d="m53 589 392-1 22 18-430 1Z" fill="#6c7561" fill-opacity=".14"/>
      <path d="M103 394h24l-14 198H89Zm278 0h23l23 199h-24Z" fill="#748776"/>
      <path d="M103 394h8L99 592H89Zm278 0h8l23 199h-9Z" fill="#9ba88c"/>
      <path d="M116 473h281v15H115Z" fill="#a2ad91"/>
      <path d="m120 408 276 170m-5-170L112 577" stroke="#8e9d83" stroke-width="7"/>
      <path d="M82 589h39v8H82Zm315 0h39v8h-39Z" fill="#586b61"/>
      <!-- Belt top and ribs share the parcel velocity. -->
      <path d="M-450 343H459a25 25 0 0 1 0 50H-450Z" fill="#485e59"/>
      <g :clip-path="`url(#${uid}-belt-clip)`" stroke="#829383" stroke-width="2.2"><g data-part="belt-ribs"><path d="M-480 345v6"/><path d="M-456 345v6"/><path d="M-432 345v6"/><path d="M-408 345v6"/><path d="M-384 345v6"/><path d="M-360 345v6"/><path d="M-336 345v6"/><path d="M-312 345v6"/><path d="M-288 345v6"/><path d="M-264 345v6"/><path d="M-240 345v6"/><path d="M-216 345v6"/><path d="M-192 345v6"/><path d="M-168 345v6"/><path d="M-144 345v6"/><path d="M-120 345v6"/><path d="M-96 345v6"/><path d="M-72 345v6"/><path d="M-48 345v6"/><path d="M-24 345v6"/><path d="M0 345v6"/><path d="M24 345v6"/><path d="M48 345v6"/><path d="M72 345v6"/><path d="M96 345v6"/><path d="M120 345v6"/><path d="M144 345v6"/><path d="M168 345v6"/><path d="M192 345v6"/><path d="M216 345v6"/><path d="M240 345v6"/><path d="M264 345v6"/><path d="M288 345v6"/><path d="M312 345v6"/><path d="M336 345v6"/><path d="M360 345v6"/><path d="M384 345v6"/><path d="M408 345v6"/><path d="M432 345v6"/><path d="M456 345v6"/><path d="M480 345v6"/></g><g data-part="belt-bottom-ribs"><path d="M-480 385v6"/><path d="M-456 385v6"/><path d="M-432 385v6"/><path d="M-408 385v6"/><path d="M-384 385v6"/><path d="M-360 385v6"/><path d="M-336 385v6"/><path d="M-312 385v6"/><path d="M-288 385v6"/><path d="M-264 385v6"/><path d="M-240 385v6"/><path d="M-216 385v6"/><path d="M-192 385v6"/><path d="M-168 385v6"/><path d="M-144 385v6"/><path d="M-120 385v6"/><path d="M-96 385v6"/><path d="M-72 385v6"/><path d="M-48 385v6"/><path d="M-24 385v6"/><path d="M0 385v6"/><path d="M24 385v6"/><path d="M48 385v6"/><path d="M72 385v6"/><path d="M96 385v6"/><path d="M120 385v6"/><path d="M144 385v6"/><path d="M168 385v6"/><path d="M192 385v6"/><path d="M216 385v6"/><path d="M240 385v6"/><path d="M264 385v6"/><path d="M288 385v6"/><path d="M312 385v6"/><path d="M336 385v6"/><path d="M360 385v6"/><path d="M384 385v6"/><path d="M408 385v6"/><path d="M432 385v6"/><path d="M456 385v6"/><path d="M480 385v6"/><path d="M504 385v6"/><path d="M528 385v6"/></g></g>
      <path d="M-450 397H463l19-12 2 24-24 17H-450Z" fill="#879a83"/>
      <path d="M-450 397H463l19-12-8 15-15 9H-450Z" fill="#b3bea0"/>
      <path d="M-450 423H458" stroke="#5a7366" stroke-width="3"/>
      <g fill="#c6cbb0"><circle cx="78" cy="411" r="3"/><circle cx="247" cy="411" r="3"/><circle cx="427" cy="411" r="3"/></g>
      <g transform="translate(456 368)">
        <circle r="21" fill="#b3baa0"/><circle r="14" fill="#7d8d7a"/>
        <g data-part="roller"><path d="M-10 0H10M0-10V10" stroke="#cbd0b3" stroke-width="3"/><circle r="4" fill="#556e60"/></g>
      </g>
      <path d="m27 360 14 50H12L0 360Z" fill="#8b9a82"/>
      <!-- Rear cartons give the moving parcels a real contact surface. -->
      <g :filter="`url(#${uid}-soft)`" data-part="pile-back">
        <use :href="`#${uid}-box`" transform="translate(506 585) rotate(-9) scale(1.1)" style="--box-front:#b48d63;--box-side:#97754f;--box-top:#d3b07e"/>
        <use :href="`#${uid}-box`" transform="translate(680 551) rotate(13) scale(1.02)" style="--box-front:#bf9e71;--box-side:#a1835b;--box-top:#d9bf91"/>
        <use :href="`#${uid}-box`" transform="translate(615 499) rotate(-7) scale(.99)" style="--box-front:#b68d5e;--box-side:#946e4d;--box-top:#d9b17a"/>
        <use :href="`#${uid}-box`" transform="translate(750 582) rotate(18) scale(.96)" style="--box-front:#c4ae7e;--box-side:#9d8b64;--box-top:#e0cc9f"/>
        <path d="m563 448 38-7 28 20-50 10Z" fill="#dfba80"/>
      </g>
      <!-- Actors enter from outside the frame and leave behind opaque cartons. -->
      <g data-part="parcels" :filter="`url(#${uid}-soft)`"><g data-parcel="0" transform="translate(-1200 900)"><use :href="`#${uid}-box`"/></g><g data-parcel="1" transform="translate(-1200 900)"><use :href="`#${uid}-box`"/></g><g data-parcel="2" transform="translate(-1200 900)"><use :href="`#${uid}-box`"/></g><g data-parcel="3" transform="translate(-1200 900)"><use :href="`#${uid}-box`"/></g><g data-parcel="4" transform="translate(-1200 900)"><use :href="`#${uid}-box`"/></g></g>
      <!-- A foreground mountain conceals each reset, without fading any carton. -->
      <path d="m393 650 66-113 69-48 36-34 67-7 51 53 78 33 111 86 20 52Z" fill="#ac8b61"/>
      <g :filter="`url(#${uid}-soft)`">
        <use :href="`#${uid}-box`" transform="translate(474 589) rotate(-15) scale(1.02)" style="--box-front:#b9a272;--box-side:#96875d;--box-top:#d3c195"/>
        <use :href="`#${uid}-box`" transform="translate(553 560) rotate(-8) scale(1.13)" style="--box-front:#cfac76;--box-side:#aa8456;--box-top:#e3c393"/>
        <g data-part="impact-carton"><use :href="`#${uid}-box`" transform="translate(594 511) rotate(5) scale(.91)" style="--box-front:#cba06a;--box-side:#a87f53;--box-top:#e8c58f"/></g>
        <use :href="`#${uid}-box`" transform="translate(665 573) rotate(9) scale(1.13)" style="--box-front:#c29b69;--box-side:#9c7a51;--box-top:#ddbd88"/>
        <use :href="`#${uid}-box`" transform="translate(732 598) rotate(16) scale(1.05)" style="--box-front:#b49a6a;--box-side:#938158;--box-top:#d0b887"/>
      </g>
      <g data-part="impact-dust" fill="#efe0b9"><path d="m0-2 4-2 3 3-4 3Z"/><path d="m-19 2 4-3 2 3-3 2Z"/><path d="m17 1 3-3 3 3-3 2Z"/></g>
      <!-- The work is waiting; its operator is very much asleep. -->
      <g transform="translate(960 604)" :filter="`url(#${uid}-soft)`" data-part="koala-station"><!-- Paper-cut koala. Local ground: (0, 0). Suggested breath pivot: (8, -57).
     The chair and feet stay planted; only the nested breathing group moves. -->
<g data-part="koala-chair">
  <ellipse cx="9" cy="4" rx="104" ry="10" fill="#5b513f" fill-opacity=".12"/>
  <!-- Splayed rear legs and the far side of the timber frame. -->
  <path d="m50-97 17-3 24 103-13 3Z" fill="#8e684b"/>
  <path d="m-46-91 15 1-38 95-13-2Z" fill="#997453"/>
  <path d="m-64-194 12-12 132-20 12 10-16 141-14 7Z" fill="#ad825b"/>
  <path d="m-52-206 132-20 12 10-133 23Z" fill="#d3ac78"/>
  <path d="m80-226 12 10-16 141-14 7Z" fill="#855f46"/>
  <path d="m-53-190 128-22-13 119-118 15Z" fill="#7d8e78"/>
  <path d="m-53-190 38-6-8 108-33 10Z" fill="#8e9c83"/>
  <path d="m-15-196 90-16-13 119-45 6Z" fill="#78856f"/>
  <path d="m-45-183 111-20-2 15-110 20Z" fill="#a8b196"/>
  <path d="m-49-141 111-19-2 16-110 18Z" fill="#9ca78d"/>
  <path d="m-54-98 111-19-2 15-109 17Z" fill="#8e9b81"/>
  <!-- Seat with a visible front edge; every leg meets its underside. -->
  <path d="m-75-77 126-14 36 23-137 17Z" fill="#a5ac8a"/>
  <path d="m-75-77 25 26 137-17-1 12-136 18-26-25Z" fill="#af835c"/>
  <path d="m-50-51 137-17-1 12-136 18Z" fill="#c29769"/>
  <path d="m-67-67 15 1-5 69-14 1Z" fill="#a87851"/>
  <path d="m64-67 14-1 13 71-14 2Z" fill="#aa7952"/>
  <path d="m-59-28 137-11 2 8-139 12Z" fill="#b88c60"/>
  <path d="m-59-28 137-11 2 3-139 12Z" fill="#d0a572"/>
  <!-- Far armrest, including its upright rather than a floating plank. -->
  <path d="m74-121 10-2-4 67-9 2Z" fill="#976c4b"/>
  <path d="m44-130 43-7 15 9-50 10Z" fill="#d0a575"/>
  <path d="m52-118 50-10-1 8-48 11Z" fill="#a47a56"/>
  <path d="m-49-202 118-20m-117 35 2 29m-13 103 2 38m135-27 5 31" fill="none" stroke="#ecd0a1" stroke-width="1.3" stroke-opacity=".48"/>
</g>

<g data-part="koala-feet">
  <!-- Loose heels rest in front of the seat; neither foot changes with a breath. -->
  <path d="M-38-69Q-54-68-61-53L-69-27Q-69-17-58-12L-37-10Q-26-13-25-22L-22-47Z" fill="#979f99"/>
  <path d="M-52-55Q-61-37-62-25L-52-18-36-20-30-30-31-52Z" fill="#b5bcb1"/>
  <path d="M-63-27Q-75-24-76-17Q-77-9-64-6L-38-6Q-25-8-25-17L-35-24Z" fill="#b6bcb1"/>
  <path d="m-71-14 7-1m3 2 7-2m3 2 7-2" stroke="#777e76" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M28-65Q47-64 54-47L61-25Q62-16 52-11L31-10Q18-12 17-23L14-44Z" fill="#929d95"/>
  <path d="m30-56 17 10 6 22-10 8-16-4-5-17Z" fill="#b8c0b4"/>
  <path d="M31-25Q46-26 56-19L70-13Q75-7 67-3L37-2Q24-3 21-10L22-18Z" fill="#bfc5b9"/>
  <path d="m46-9 7 1m-18-1 7 1m14-2 7 2" stroke="#7d857c" stroke-width="1.5" stroke-linecap="round"/>
</g>

<g data-part="koala-breath">
  <!-- The torso slumps into its seat, with an asymmetric paper-fold silhouette. -->
  <path d="M-29-173Q-53-166-58-142L-62-109Q-62-79-42-60L-16-48 22-48Q54-54 63-79L69-109Q71-141 49-159L16-173Z" fill="#a9b2a8"/>
  <path d="m-29-173-23 24-10 40q0 30 20 49l26 12-14-34-7-46 10-35Z" fill="#919e95"/>
  <path d="M-9-159Q15-167 35-146L45-115Q48-88 30-66L8-59-16-66Q-35-85-33-111L-26-139Z" fill="#dedfce"/>
  <path d="m-26-139-7 28q-2 26 17 45l24 7-17-18-9-35 7-47Z" fill="#c6cdbb"/>
  <path d="m4-154 23 7 9 27-7-9-4-15Z" fill="#f0ebd7"/>
  <!-- An unbuttoned faded work vest leaves the pale belly visible. -->
  <path d="m-30-174 21 11-12 29-3 42 10 39-26-8-17-28-4-28 9-32Z" fill="#81917a"/>
  <path d="m-30-174 10 6-13 27-6 39 9 33-10-8-11-31 7-36Z" fill="#9eac8c"/>
  <path d="m27-164 20 4 18 24 5 26-8 31-18 22-21 7 14-32 6-36-3-28Z" fill="#6f8470"/>
  <path d="m27-164 20 4-5 22 4 25-9 31 6-36-3-28Z" fill="#a0af91"/>
  <path d="m-44-115 19 3-1 21-16-1-5-8Z" fill="#6d806a"/>
  <path d="m-43-114 17 3m-15 17 13 1" fill="none" stroke="#bcc2a0" stroke-width="1.1" stroke-opacity=".7"/>
  <path d="m48-108 11-3-3 18-9 4Z" fill="#586f60"/>
  <path d="m-26-135 5 3m63-4 5-1" stroke="#e1d4aa" stroke-width="2.8" stroke-linecap="round"/>

  <!-- The far arm has gone completely limp over its armrest. -->
  <path d="M51-146Q63-149 72-135L81-117 89-105 91-84Q91-73 82-71L70-76 67-91 66-107 54-121Z" fill="#929f96"/>
  <path d="m56-143 11 7 7 21 9 16-1 18-7-1-2-20-11-17Z" fill="#b5bdb0"/>
  <path d="m76-79 1-8m5 10 1-9m4 6-1-8" stroke="#738073" stroke-width="1.4" stroke-linecap="round"/>

  <!-- Head hinge is intentionally outside the resting tilt, so animated nods
       can be tiny without overwriting the authored sleeping posture. -->
  <g data-part="koala-head">
    <g transform="rotate(13 21 -184)">
      <!-- Rounded scallops read as fur at scene scale, never as pointed ears. -->
      <path d="M-19-231Q-30-247-45-246Q-59-249-64-240Q-77-240-81-227Q-88-216-81-206Q-83-192-71-186Q-63-175-50-180Q-38-175-27-185L-16-211Z" fill="#99a69d"/>
      <path d="M-42-237Q-59-241-69-229Q-78-216-71-204L-63-194Q-49-190-37-201L-29-217Z" fill="#d0d1c1"/>
      <path d="m-53-232-13 11 2 15 10 7 12-4 7-15-6-12Z" fill="#bcc5b6"/>
      <path d="M61-231Q72-247 87-244Q101-246 107-235Q119-233 120-220Q126-208 118-198Q118-186 106-181Q96-172 84-179Q71-176 63-190L55-211Z" fill="#8d9c94"/>
      <path d="M79-235Q94-241 105-227Q113-215 107-202Q101-190 88-191L74-201 70-219Z" fill="#d4d4c3"/>
      <path d="m82-230 14 1 8 12-4 14-11 6-9-9-5-14Z" fill="#bfc8b9"/>
      <!-- Broad cheek shape with small flat facets along the cut-paper edge. -->
      <path d="M-26-218-10-234 11-241 38-239 60-227 73-208 78-185 69-164 49-151 21-147-7-154-27-170-36-191Z" fill="#b4bdb1"/>
      <path d="m-26-218 16-16 21-7-13 22-11 28 6 29 14 15-14-7-20-16-9-21Z" fill="#a0ada3"/>
      <path d="m11-241 27 2 22 12 13 19-26-14-27-3-22 6Z" fill="#ced0bf"/>
      <path d="m47-222 26 14 5 23-9 21-20 13-28 4 21-11 13-19 2-24Z" fill="#a2afa4"/>
      <!-- Soft pale cheeks meet underneath the large characteristic nose. -->
      <path d="M-17-185Q-5-196 11-185L22-169 40-170 56-185Q68-185 66-174L55-161 34-153 14-154-4-161-16-173Z" fill="#d4d7c5"/>
      <path d="m-15-178 14 7 15 3 7 11-7 3-18-7-12-12Z" fill="#c4cbb8"/>
      <ellipse cx="-10" cy="-177" rx="10" ry="5.5" fill="#c1aca0" fill-opacity=".55"/>
      <ellipse cx="61" cy="-177" rx="8" ry="4.5" fill="#c1aca0" fill-opacity=".48"/>
      <!-- Closed eyes curve downward. Tiny lashes rest rather than frown. -->
      <path d="M-18-194Q-10-185-1-192M47-192Q55-184 63-192" fill="none" stroke="#4d5a50" stroke-width="2.6" stroke-linecap="round"/>
      <path d="m-15-190-3 2m76-1 3 2" fill="none" stroke="#4d5a50" stroke-width="1.7" stroke-linecap="round"/>
      <!-- A charcoal pear-oval nose with one broad, subdued paper highlight. -->
      <path d="M14-213Q22-218 30-213Q39-206 40-192L38-177Q34-168 24-168Q13-169 9-177L8-193Q7-207 14-213Z" fill="#414b43"/>
      <path d="M15-211Q20-215 26-212L29-207 28-187 24-179 15-182 12-193Z" fill="#68776a"/>
      <path d="m15-207 3-4 5 1-1 7-4 4-3-2Z" fill="#8a9581"/>
      <path d="M24-165Q29-166 30-161Q30-157 26-157Q23-159 24-165Z" fill="#788472"/>
      <!-- A few light paper fibres; no outline around the head. -->
      <path d="m-22-213 5 3m5-14 7 3m50-1 5 4m-18 67 6-2m-86-78 4 6m146 2-3 6" fill="none" stroke="#f1eddb" stroke-width="1" stroke-opacity=".57"/>
    </g>
  </g>

  <!-- Near arm crosses its own vest seam, then hangs beyond the chair. -->
  <path d="M-34-147Q-49-151-58-136L-68-116-73-92-74-76Q-75-67-67-63L-56-65Q-49-70-52-80L-54-94-47-114-34-129Z" fill="#a4afa4"/>
  <path d="m-43-142-10 9-9 22-5 25 2 15 7-3-2-20 8-24 13-14Z" fill="#c5ccbd"/>
  <path d="m-68-70 1-9m5 10 1-10m5 7-1-9" stroke="#7e8b7d" stroke-width="1.5" stroke-linecap="round"/>
</g>

<!-- The near chair upright stays in front of the wrist, with no impossible
     arm/wood intersections as the belly gently rises and falls. -->
<g data-part="koala-chair-front">
  <path d="m-83-119 9-1 4 64-10 1Z" fill="#a57b55"/>
  <path d="m-93-121 33-5 18 7-36 8Z" fill="#d7b07b"/>
  <path d="m-93-121 15 10 36-8-1 7-37 8-13-9Z" fill="#b2895e"/>
  <path d="m-83-114 6 4 3 51-4-1Z" fill="#cca070"/>
</g>
</g>
      <g data-part="workstation" :filter="`url(#${uid}-soft)`">
        <path d="m820 608 61-3 16 11-81 2Z" fill="#526454" fill-opacity=".17"/>
        <path d="M848 508h16l6 98h-24Z" fill="#728772"/>
        <path d="M845 604h29l9 7h-48Z" fill="#5c7363"/>
        <path d="m806 479 80-6 18 25-87 7Z" fill="#a2b197"/>
        <path d="m817 505 87-7-1 28-87 6Z" fill="#7f967f"/>
        <path d="m806 479 11 26-1 27-10-29Z" fill="#607c6b"/>
        <path d="m813 481 68-5 13 17-73 6Z" fill="#c1c9aa"/>
        <path d="m846 486 21-2 2 8-21 2Z" fill="#c88e6c"/>
        <ellipse cx="835" cy="490" rx="6" ry="4" fill="#6d8770"/>
        <path d="m873 480 9-1 5 7-9 1Z" fill="#e0d1a7"/>
        <path d="M820 518h29" stroke="#b2c1a1" stroke-width="3"/>
      </g>
      <!-- These nearest cartons occlude the station feet and the koala's feet. -->
      <g data-part="pile-front" :filter="`url(#${uid}-soft)`">
        <use :href="`#${uid}-box`" transform="translate(432 654) rotate(-12) scale(1.03)" style="--box-front:#c7a77b;--box-side:#a98c60;--box-top:#e2c795"/>
        <use :href="`#${uid}-box`" transform="translate(521 648) rotate(1) scale(1.24)" style="--box-front:#c7a06e;--box-side:#a77e51;--box-top:#e2bd83"/>
        <use :href="`#${uid}-box`" transform="translate(621 655) rotate(-8) scale(1.13)" style="--box-front:#b89a6c;--box-side:#9a7a50;--box-top:#d6b889"/>
        <use :href="`#${uid}-box`" transform="translate(719 663) rotate(6) scale(1.12)" style="--box-front:#cfab76;--box-side:#ac8958;--box-top:#e8c68f"/>
        <use :href="`#${uid}-box`" transform="translate(812 655) rotate(20) scale(.95)" style="--box-front:#b6a374;--box-side:#92835f;--box-top:#d5c396"/>
      </g>
      <!-- A scanner hangs unused beside the chair. -->
      <path d="M1005 535q27 22 11 41t20 29" stroke="#6f7968" stroke-width="2.5" fill="none"/>
      <path d="m1006 525 15 5-6 12-11-4-5 11-7-3Z" fill="#657c70"/>
      <path d="m1007 525 14 5-3 5-14-5Z" fill="#adc0a4"/>
      <g data-part="sleep-breath" fill="none" stroke="#889582" stroke-width="2.3" stroke-linecap="round">
        <path data-sleep="0" d="M1022 325q12-6 5-14t3-14"/>
        <path data-sleep="1" d="M1042 316q11-6 4-14t3-14"/>
      </g>
      <!-- Eucalyptus cutouts balance the far edge of the scene. -->
      <g transform="translate(1111 615)">
        <ellipse cx="0" cy="1" rx="45" ry="8" fill="#5f725c" fill-opacity=".16"/>
        <path d="m-27-61 57-2-9 60-41 3Z" fill="#b68f6e"/>
        <path d="m-27-61 13 6 5 54-11 1Z" fill="#c8a481"/>
        <path d="m-30-66 62-2 0 14-61 2Z" fill="#cfb28b"/>
        <path d="M0-65-5-162M-2-113-25-146M-3-130 23-169M-4-156-26-184" stroke="#88957b" stroke-width="3" fill="none"/>
        <g color="#8d9f83"><use :href="`#${uid}-leaf`" transform="translate(-5 -158) rotate(-12)"/><use :href="`#${uid}-leaf`" transform="translate(-22 -145) rotate(-56) scale(.88)"/><use :href="`#${uid}-leaf`" transform="translate(16 -159) rotate(60) scale(.92)"/><use :href="`#${uid}-leaf`" transform="translate(-24 -180) rotate(-35) scale(.8)"/></g>
        <g color="#a6b393"><use :href="`#${uid}-leaf`" transform="translate(-1 -114) rotate(58) scale(.86)"/><use :href="`#${uid}-leaf`" transform="translate(-3 -133) rotate(-64) scale(.83)"/><use :href="`#${uid}-leaf`" transform="translate(23 -168) rotate(10) scale(.82)"/></g>
      </g>
      <g fill="#cbb98f"><path d="m309 630 14-6 10 3-15 7Z"/><path d="m349 595 8-2 5 2-7 3Z"/><path d="m900 656 15-3 12 3-14 4Z"/></g>
      <path d="m288 634 30-3m580 31 25-2m143-25 16 1" stroke="#b5a886" stroke-width="1.3"/>
    </g>
    <path d="M0 0H1200V720H0Z" :fill="`url(#${uid}-grain)`" pointer-events="none"/>
  </g>
</svg>
</div>
    </figure>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

const props = defineProps<{ theme: 'light' | 'dark'; motion: 'full' | 'reduced' | 'none'; paused: boolean }>()
const root = ref<HTMLElement | null>(null)
const uid = `paper-503-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
let player: ReturnType<typeof createUnavailableScene> | undefined

function createUnavailableScene(root: HTMLElement, reducedMotion: boolean) {
  const svg = root.querySelector<SVGSVGElement>('[data-scene]')!;
  const part = (name: string) => svg.querySelector<SVGGraphicsElement>(`[data-part="${name}"]`)!;
  const camera = part('camera');
  const parcels = [...svg.querySelectorAll('[data-parcel]')];
  const ribs = part('belt-ribs');
  const bottomRibs = part('belt-bottom-ribs');
  const roller = part('roller');
  const breath = part('koala-breath');
  const head = part('koala-head');
  const bump = part('impact-carton');
  const dust = part('impact-dust');
  const sleepLines = [...svg.querySelectorAll('[data-sleep]')];
  let time = 0, raf = 0, disposed = false, paused = false, offscreen = false;
  let last: number | null = null;
  const interval = 2.65, count = parcels.length, cycle = count * interval;
  // The back-right bottom corner is 16 units above the front bottom edge.
  // Put that back corner on the belt at y=343 so the whole carton sits on it.
  const beltParcelY = 359;
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  const smooth = (x: number) => { x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10); };
  const lerp = (a: number, b: number, t: number) => a + (b-a)*t;
  function pose(age: number) {
    if (age < 5) return { x: -160 + 126 * age, y: beltParcelY, angle: 0 };
    if (age < 5.7) {
      const u = (age - 5) / .7;
      return { x: 470 + 88.2 * u, y: beltParcelY + (431 - beltParcelY) * u * u, angle: 27 * u * u };
    }
    if (age < 6.18) {
      const u = (age - 5.7) / .48;
      return { x: 558.2 + 30 * u, y: 431 + 4 * u - 18 * Math.sin(Math.PI * u), angle: 27 - 17 * Math.sin(Math.PI * .5 * u) };
    }
    const u = clamp((age - 6.18) / 1.05);
    return { x: 588.2 + 62 * u, y: 435 + 205 * u * u, angle: 10 + 52 * u };
  }
  function draw(t: number, still = false) {
    const reveal = still ? 1 : smooth((t - 3.95) / 2.45);
    const tracking = smooth(t / 3.85);
    const scale = lerp(2.12, 1, reveal);
    const focusX = lerp(lerp(273, 510, tracking), 600, reveal);
    const focusY = lerp(lerp(311, 383, tracking), 360, reveal);
    camera.setAttribute('transform', `translate(${600 - focusX * scale} ${360 - focusY * scale}) scale(${scale})`);
    root.dataset.story = reveal >= .999 ? 'settled' : 'intro';
    ribs.setAttribute('transform', `translate(${(t * 126) % 24} 0)`);
    bottomRibs.setAttribute('transform', `translate(${-((t * 126) % 24)} 0)`);
    roller.setAttribute('transform', `rotate(${t * 126 / 21 * 180 / Math.PI})`);
    let latestImpact = Infinity;
    parcels.forEach((parcel, i) => {
      // Every reused actor begins beyond the left frame and finishes fully occluded.
      const elapsed = t + 2.05 - i * interval;
      if (elapsed < 0) { parcel.setAttribute('transform', 'translate(-1200 900)'); return; }
      const age = elapsed % cycle;
      if (age > 7.05) { parcel.setAttribute('transform', 'translate(-1200 900)'); return; }
      const p = pose(age);
      parcel.setAttribute('transform', `translate(${p.x.toFixed(3)} ${p.y.toFixed(3)}) rotate(${p.angle.toFixed(3)})`);
      if (age >= 5.7) latestImpact = Math.min(latestImpact, age - 5.7);
    });
    const hit = latestImpact < .48 ? Math.sin(latestImpact / .48 * Math.PI * 2) * (1 - latestImpact / .48) : 0;
    bump.setAttribute('transform', `rotate(${hit * 1.7} 594 511)`);
    if (latestImpact < .5) {
      const u = latestImpact / .5, s = Math.sin(Math.PI * u) * .85;
      dust.setAttribute('transform', `translate(${569 + u * 9} ${441 - u * 21}) scale(${s})`);
    } else dust.setAttribute('transform', 'translate(569 441) scale(0)');
    const inhale = (1 - Math.cos(t * Math.PI * 2 / 4.4)) / 2;
    if (breath) breath.setAttribute('transform', `translate(0 ${-inhale * 1.8}) translate(0 -49) scale(${1 + inhale * .009} ${1 + inhale * .014}) translate(0 49)`);
    if (head) head.setAttribute('transform', `rotate(${Math.sin(t * Math.PI * 2 / 4.4 - .3) * .6} 21 -184)`);
    sleepLines.forEach((line,i) => line.setAttribute('transform', `translate(${Math.sin(t * .7 + i) * 2} ${Math.sin(t * 1.1 + i) * 3})`));
    root.dataset.camera = reveal >= .999 ? 'wide' : 'close';
    root.dataset.time = t.toFixed(2);
  }
  function canRun() { return !disposed && !paused && !document.hidden && !offscreen && !reducedMotion; }
  function frame(now: number) {
    raf = 0;
    if (!canRun()) { last = null; return; }
    // Positions are analytic, so actual elapsed time stays correct at low frame rates.
    // Visibility/pause events reset `last` before resuming.
    if (last !== null) time += Math.max(0, (now - last) / 1000);
    last = now;
    draw(time);
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0; last = null;
    root.dataset.playing = String(canRun());
    if (canRun()) raf = requestAnimationFrame(frame);
  }
  function replay() { time = 0; draw(0); sync(); }
  document.addEventListener('visibilitychange', sync);
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    offscreen = !entries[0].isIntersecting; sync();
  }, {threshold: 0}) : null;
  observer?.observe(svg);
  if (reducedMotion) time = 8;
  draw(time, reducedMotion);
  sync();
  return {
    replay,
    setReducedMotion(value: boolean) {
      reducedMotion = value;
      if (value) time = 8;
      draw(time, value);
      sync();
    },
    setPaused(value: boolean) { paused = Boolean(value); sync(); },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    }
  };
}


onMounted(() => {
  if (!root.value) return
  player = createUnavailableScene(root.value, props.motion !== 'full')
  player.setPaused(props.paused)
})
watch(() => props.motion, motion => player?.setReducedMotion(motion !== 'full'))
watch(() => props.paused, paused => player?.setPaused(paused))
defineExpose({ replay: () => player?.replay() })
onBeforeUnmount(() => { player?.dispose() })
</script>

<style scoped>
.paper-503-shell {
  --page-bg: #f7f6f0; --page-text: #393e34; --page-secondary: #797d6e; --page-button: #697c63; --page-button-hover: #52694d;
  --scene-wall-top: #efe5d1; --scene-wall: #e3dcc2; --scene-floor: #cec7a3; --scene-floor-edge: #b8b597; --scene-floor-line: #b4ac87; --scene-frame-shadow: #d8d0be; --scene-timber: #b6a17e;
  color: var(--apple-text, var(--page-text)); background: transparent; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif; -webkit-font-smoothing: antialiased; box-sizing: border-box; width: 100%;
}
.paper-503-shell *, .paper-503-shell *::before, .paper-503-shell *::after { box-sizing: border-box; }
.paper-503-shell.is-dark {
  --page-bg: #222c29; --page-text: #ede9d8; --page-secondary: #b2b9a6; --page-button: #83957a; --page-button-hover: #98aa8c;
  --scene-wall-top: #4b5648; --scene-wall: #56614d; --scene-floor: #777d5e; --scene-floor-edge: #535f4b; --scene-floor-line: #59674f; --scene-frame-shadow: #16251f; --scene-timber: #9a896a;
}
@media (prefers-color-scheme: dark) {
  .paper-503-shell:not(.is-light) {
    --page-bg: #222c29; --page-text: #ede9d8; --page-secondary: #b2b9a6; --page-button: #83957a; --page-button-hover: #98aa8c;
    --scene-wall-top: #4b5648; --scene-wall: #56614d; --scene-floor: #777d5e; --scene-floor-edge: #535f4b; --scene-floor-line: #59674f; --scene-frame-shadow: #16251f; --scene-timber: #9a896a;
  }
}
.unavailable-scene { margin: 0; position: relative; min-width: 0; }
.unavailable-scene__window { overflow: hidden; padding: 4px; }
.unavailable-scene__art { width: 100%; height: auto; display: block; overflow: visible; }
.unavailable-scene__art [data-part='camera'] { transform-origin: 0 0; }
@media (max-width: 880px) {
  .unavailable-scene { grid-row: 1; }
  .unavailable-scene__window { margin-inline: -10px; }
}

</style>
