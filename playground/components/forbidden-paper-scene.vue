<template>
  <figure ref="scene" class="meal-scene" :class="{ 'meal-scene--dark': dark }" :data-story="story" :data-playing="canAnimate && !suspended" :data-motion="motion">
    <div class="meal-scene__window">
<svg xmlns="http://www.w3.org/2000/svg" ref="art" class="meal-scene__art" viewBox="0 0 1000 660" role="img" :aria-labelledby="`${uid}-title ${uid}-description`">
  <title :id="`${uid}-title`">小狗与够不到的鸡腿</title>
  <desc :id="`${uid}-description`">饥饿的小狗坐在餐桌旁，肚子咕噜作响，镜头逐渐拉远。主人开始吃饭，小狗伸爪去够鸡腿，主人轻轻挡开它的爪子；小狗收回爪子，过一会儿又试一次。</desc>
  <defs>
    <linearGradient :id="`${uid}-wall`" x2=".3" y2="1"><stop stop-color="var(--dinner-wall-top)"></stop><stop offset="1" stop-color="var(--dinner-wall)"></stop></linearGradient>
    <linearGradient :id="`${uid}-wood`" x2=".9" y2=".3"><stop stop-color="#d6b17e"></stop><stop offset="1" stop-color="#bc9166"></stop></linearGradient>
    <linearGradient :id="`${uid}-chicken`" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#da9b51"></stop><stop offset=".55" stop-color="#c7813e"></stop><stop offset="1" stop-color="#a86035"></stop></linearGradient>
    <filter :id="`${uid}-shadow`" x="-35%" y="-30%" width="180%" height="185%"><feDropShadow dx="1" dy="6" stdDeviation="3" flood-color="#39291e" flood-opacity=".13"></feDropShadow></filter>
    <filter :id="`${uid}-soft-shadow`" x="-30%" y="-30%" width="170%" height="175%"><feDropShadow dx="1" dy="3" stdDeviation="2" flood-color="#39291e" flood-opacity=".12"></feDropShadow></filter>
    <pattern :id="`${uid}-grain`" width="41" height="37" patternUnits="userSpaceOnUse"><path d="M4 6h1m15 11h1m13-9h.7M9 29h1m26 3h.8" stroke="#5e472e" stroke-opacity=".14" stroke-width="1"></path><path d="M8 11l3-1m13 16 3-1m-4-23 2-1" stroke="#fff8e5" stroke-opacity=".2" stroke-width=".7"></path></pattern>
    <pattern :id="`${uid}-weave`" width="11" height="11" patternUnits="userSpaceOnUse"><path d="M0 4h11M4 0v11" fill="none" stroke="#f6ebd7" stroke-opacity=".16" stroke-width=".7"></path></pattern>
    <clipPath :id="`${uid}-frame`"><path d="M36 74Q37 38 75 35L909 20Q957 19 963 68L986 565Q987 608 942 614L84 635Q29 635 27 585Z"></path></clipPath>
    <clipPath :id="`${uid}-window`"><path d="m80 108 244-9 2 180-246 2Z"></path></clipPath>
    <clipPath :id="`${uid}-photo-clip`" clipPathUnits="userSpaceOnUse"><path d="m452 117 97-3 1 85-96 4Z"></path></clipPath>
  </defs>
  <path d="M44 90Q43 52 83 49L915 33Q970 35 974 85L994 574Q996 620 945 628L86 647Q35 647 36 598Z" fill="var(--dinner-frame-shadow)"></path>
  <g :clip-path="`url(#${uid}-frame)`">
    <path d="M0 0H1000V660H0Z" :fill="`url(#${uid}-wall)`"></path>
    <g data-part="camera" transform="translate(0 0) scale(1)">

      <path d="m0 338 1000 6v328H0Z" fill="var(--dinner-panel)"></path>
      <path d="M0 350 1000 358M105 348l-1 94m132-91 3 88m130-90 6 84m126-80 12 80m124-79 9 77m115-76 17 83m116-82 6 83" fill="none" stroke="var(--dinner-panel-line)" stroke-width="2" opacity=".45"></path>
      <path d="m0 425 1000 11v245H0Z" fill="var(--dinner-floor)"></path>
      <path d="M0 425 1000 436" fill="none" stroke="var(--dinner-baseboard)" stroke-width="10"></path>
      <path d="m154 429-91 226m298-223-27 223m231-221 62 227m152-225 140 225M0 503l1000 10M0 603l1000 6" fill="none" stroke="var(--dinner-floor-line)" stroke-width="1.5" opacity=".4"></path>
      <path d="m81 278 243-2 231 162-411-9Z" fill="var(--dinner-daylight)" opacity=".28"></path>
      <g :filter="`url(#${uid}-shadow)`">
        <path d="m69 97 268-11 2 210-272 3Z" fill="var(--dinner-window-frame)"></path>
        <g :clip-path="`url(#${uid}-window)`">
          <path d="M70 93H333V286H70Z" fill="var(--dinner-window-sky)"></path>
          <circle cx="259" cy="150" r="29" fill="var(--dinner-sun)"></circle>
          <path d="m60 231 76-61 70 42 52-26 89 46v62H60Z" fill="var(--dinner-hill-far)"></path>
          <path d="m136 170 4 51 66-9Z" fill="var(--dinner-hill-fold)"></path>
          <path d="M57 250q76-29 125-3t165-17v80H57Z" fill="var(--dinner-hill-near)"></path>
          <path d="m92 276 23-38-9 1 18-34 19 32-8-1 25 39Z" fill="var(--dinner-tree)" opacity=".8"></path>
          <path d="M202 102v181M80 194l246-5" stroke="var(--dinner-window-frame)" stroke-width="9"></path>
        </g>
        <path d="m62 296 282-5-7 13-273 5Z" fill="#b09a77"></path>
        <path d="m64 288 274-6 6 9-282 5Z" fill="#ece0c2"></path>
      </g>

      <g data-part="wall-photo" :filter="`url(#${uid}-shadow)`">
        <path d="m445 100 55-36 61 35" fill="none" stroke="#9b896a" stroke-width="1.6"></path>
        <circle cx="500" cy="64" r="2.5" fill="#8c7c60"></circle>
        <path d="m429 94 143-3 4 129-144 5Z" fill="#ad9570"></path>
        <path d="m435 100 131-3 3 118-131 5Z" fill="#ceb994"></path>
        <path d="m444 108 113-3 2 102-112 4Z" fill="#f0e4c9"></path>
        <g data-part="photo-art" :clip-path="`url(#${uid}-photo-clip)`">
  <path data-part="photo-sky" d="m452 117 97-3 1 85-96 4Z" fill="var(--dinner-photo-sky)"></path>
  <g data-part="photo-night" class="dinner-photo-night" fill="#ece1b4">
    <path d="M530 126A11 11 0 1 0 530 145A9 9 0 0 1 530 126Z"></path>
    <circle cx="465" cy="130" r="1"></circle><circle cx="492" cy="125" r="1.2"></circle>
    <circle cx="503" cy="143" r=".9"></circle><circle cx="540" cy="149" r="1"></circle>
  </g>
  <g data-part="photo-day" class="dinner-photo-day">
    <circle cx="523" cy="135" r="10" fill="#f7e8ac"></circle>
    <path d="M463 131h14m6-7h12" stroke="#f8f0dd" stroke-width="3" stroke-linecap="round" opacity=".7"></path>
  </g>
  <path d="M453 159Q477 145 504 158T550 152L550 176 453 177Z" fill="var(--dinner-photo-shore)"></path>
  <path d="m453 171 97-7v35l-96 4Z" fill="var(--dinner-photo-lake)"></path>
  <path d="m513 177 20-1m-25 8 18-1m-9 8 21-1" stroke="var(--dinner-photo-reflection)" stroke-width="1.4" opacity=".6"></path>
  <path d="m454 175 26-8 24 11-26 9-24 2Z" fill="var(--dinner-photo-bank)"></path>
  <path d="M473 158 480 152 490 157 491 171 472 172Z" fill="#b79973"></path>
  <path d="m469 159 11-11 14 9-4 3-11-7-6 7Z" fill="#7c6658"></path>
  <path d="m478 162 6-.5v6l-6 .5Z" fill="var(--dinner-photo-window)"></path>
  <path d="M457.5 163H460.5V175H457.5Z" fill="#806044"></path>
  <path d="M459 149 454 161 456 161 452 169 467 168 462 161 465 161Z" fill="var(--dinner-photo-tree)" stroke="var(--dinner-photo-tree)" stroke-width="1" stroke-linejoin="round"></path>
</g><path d="m454 108 103-3m-113 3 3 103" fill="none" stroke="#fff8e3" opacity=".4"></path>
      </g>

      <path d="m102 266 35-1-5 22-22 1Z" fill="#aa7958"></path><path d="m103 266 17 1 2 20-14 1Z" fill="#bd8e68"></path>
      <path d="m119 269-3-52m2 35-12-18m12 4 15-15" fill="none" stroke="#75836a" stroke-width="2.4"></path>
      <path d="M116 235q-19 0-22-17 20 0 22 17m3 9q0-19 20-23-2 18-20 23m-3-17q-10-8-3-23 11 9 3 23" fill="#899776"></path>

      <g :filter="`url(#${uid}-shadow)`">
        <path d="m747 81 151 4 17 316-177-2Z" fill="var(--dinner-chair-dark)"></path>
        <path d="m760 92 125 4 12 292-147-3Z" fill="var(--dinner-chair)"></path>
        <path d="m719 388 183 2 20 24-216-2Z" fill="#9e7b55"></path>
        <path d="m720 409 23 1-9 147-15 2Zm165 1 21-1 20 142-16 4Z" fill="var(--dinner-chair-dark)"></path>
      </g>
      <g :filter="`url(#${uid}-shadow)`">
        <path d="M728-56 806-57 808 42 776 72 728 44Z" fill="#d8a477"></path>
        <path d="M781-50 806-57 808 42 776 72 766 55 779 25Z" fill="#bd845e"></path>
        <path data-part="person-torso" d="M702 47 728 37 752 58 776 68 810 27 860 64Q889 78 888 110L864 198 878 297 689 305 671 204 668 153Q634 149 635 123Q637 73 702 47Z" fill="var(--dinner-shirt)"></path>
        <path d="M702 47 728 37 752 58 722 87 692 58 672 66Z" fill="var(--dinner-shirt-light)"></path>
        <path d="M810 27 776 68 805 86 832 52 860 64Z" fill="var(--dinner-shirt-light)"></path>
        <path d="m752 58 24 10-6 231-15 2Z" fill="var(--dinner-shirt-dark)" opacity=".7"></path>
        <path d="m848 115 18 48-4 68 16 66-53 2 8-86Z" fill="var(--dinner-shirt-dark)"></path>

        <path d="m785 129 47 3-5 39-23 8-21-17Z" fill="var(--dinner-shirt-dark)" opacity=".38"></path>
        <path d="m785 129 47 3m-90-20 4 57m-50 36 24 12" fill="none" stroke="var(--dinner-shirt-light)" stroke-width="2" opacity=".5"></path>
        <g fill="#d5d5b9"><circle cx="764" cy="120" r="2.2"></circle><circle cx="762" cy="163" r="2.2"></circle><circle cx="761" cy="208" r="2.2"></circle></g>
      </g>

      <path d="m483 548 409-5 79 35-440 13Z" fill="#594531" opacity=".12"></path>
      <g :filter="`url(#${uid}-shadow)`">
        <path d="m499 356 35 3-15 223-18 2Z" fill="#95714f"></path><path d="m499 356 13 2-1 224-10 2Z" fill="#c59965"></path>
        <path d="m889 355 33-5 23 229-18 4Z" fill="#8b684b"></path><path d="m910 355 12-5 23 229-10 1Z" fill="#bb925f"></path>
        <path d="m457 325 553-4-5 56-542 9Z" fill="#a47d55"></path>
        <path d="m463 343 542-6v40l-542 9Z" fill="#b58b5e"></path>
        <path d="m480 280 503-4 38 49-569 14Z" :fill="`url(#${uid}-wood)`"></path>
        <path d="m452 327 569-12v13l-569 15Z" fill="#dec08c"></path>
        <path d="m500 294 176-4m-161 19 135-3m259-15 58-2m-124 26 136-3" fill="none" stroke="#8d6748" stroke-width="1.4" opacity=".23"></path>
      </g>
      <g data-part="tablecloth" :filter="`url(#${uid}-shadow)`">
        <path data-part="cloth-silhouette" d="M636 281 931 277 958 324 958 566 899 581 805 575 695 585 659 575 652 330Z" fill="var(--dinner-cloth)"></path>
        <path d="m652 330 22-1 8 226 14 30-37-10Z" fill="var(--dinner-cloth-fold)"></path>
        <path d="m780 327 18-1 7 249-21 2Z" fill="var(--dinner-cloth-fold)" opacity=".3"></path>
        <path d="m910 325 25-1 7 246-43 11Z" fill="var(--dinner-cloth-fold)" opacity=".52"></path>
        <path d="M636 281 931 277 958 324 958 566 899 581 805 575 695 585 659 575 652 330Z" :fill="`url(#${uid}-weave)`"></path>
        <path d="m669 562 27 9 109-10 94 6 48-13" fill="none" stroke="#e5e4c6" stroke-width="2" opacity=".65"></path>
        <path d="m659 332 291-6" fill="none" stroke="#d9ddd0" stroke-width="1.3" opacity=".38"></path>
      </g>

      <ellipse cx="577" cy="313" rx="68" ry="10" fill="#6a5137" opacity=".15"></ellipse>
      <g :filter="`url(#${uid}-soft-shadow)`">
        <path d="M505 303q71-26 144-5l-8 17q-70 21-129 0Z" fill="#c9cbb7"></path>
        <ellipse cx="576" cy="300" rx="72" ry="19" fill="#eee8cc"></ellipse>
        <ellipse cx="577" cy="300" rx="56" ry="12" fill="#d8d8bd"></ellipse>
        <path d="M533 303q40 12 82 0" fill="none" stroke="#fbf3d7" stroke-width="2"></path>
        <path d="m587 303 20-22 4 9 18-12-7 17 12 2-24 15Z" fill="#84916a"></path>
        <path d="m594 307 21-17m-8 10 12 2" stroke="#c8cd97" stroke-width="1"></path>
        <g data-part="chicken">
          <path d="m557 292-22 9-8-5-7 3-1 8 8 4 8-4 24-5Z" fill="#f1e3be"></path>
          <path d="m534 303 23-8 2 7-24 5-8 4-6-3Z" fill="#d8c69f"></path>
          <path d="M546 291q13-5 20-23 6-19 29-18l22 9 11 17-5 17-18 12-22 0-22-7-12 3Z" :fill="`url(#${uid}-chicken)`"></path>
          <path d="M554 290q15-4 23-24 9-13 26-10l14 7-23-3-13 14-7 15-13 5Z" fill="#e7b267"></path>
          <path d="m584 298 21 1 18-12-5 13-13 5-22 0-22-7-12 3-3-6 14-2Z" fill="#a96335" opacity=".6"></path>
          <path d="m587 268 3-2m11 9 3-1m-19 10 3-2m25-7 2 1m-16 10 3-1" stroke="#885231" stroke-linecap="round" stroke-width="2.2" opacity=".5"></path>
        </g>
        <ellipse cx="789" cy="289" rx="55" ry="17" fill="#eee8cf"></ellipse><ellipse cx="790" cy="289" rx="43" ry="11" fill="#d1d2b7"></ellipse>
        <path d="m766 290 8-12 14 2 4 9-12 5Z" fill="#b47f42"></path><g data-part="food-pile-back">
  <path d="m751 285 5-12 14 1 6 11-13 9Z" fill="#aa7943"></path>
  <path d="m756 273 14 1-5 5-12 3Z" fill="#cba466"></path>
  <path d="m765 271 9-13 14 5 2 12-13 5Z" fill="#bc9350"></path>
  <path d="m774 258 14 5-7 6-12-2Z" fill="#debd79"></path>
  <path d="m786 271 3-14 13-5 10 9-7 16Z" fill="#c5a05b"></path>
  <path d="m789 257 13-5 10 9-15 2Z" fill="#e2c581"></path>
  <path d="m811 270 7-6 9 5-2 10-13 6-6-7Z" fill="#86956a"></path>
  <path d="m808 280 13-6 8 8-3 10-16 2-6-6Z" fill="#a3ad78"></path>
  <path d="m817 270 2 8m-7 6 9-2" fill="none" stroke="#c7ce95" stroke-width="1.3"></path>
</g>
        <g data-part="water-cup">
          <ellipse cx="952" cy="312" rx="18" ry="4" fill="#775c3e" opacity=".1"></ellipse>
          <path d="m938 269 30-1-4 42q-12 7-23 0Z" fill="#d6e0cc" opacity=".78"></path>
          <path d="m941 287 24-1-2 21q-10 5-20 0Z" fill="#94b3a8"></path>
          <ellipse cx="953" cy="269" rx="15" ry="4.2" fill="#d7dfca" stroke="#edf0d9" stroke-width="1.8"></ellipse>
          <path d="m943 277 1 21" fill="none" stroke="#f6ecd5" stroke-width="1.8" opacity=".8"></path>
        </g>
      </g>

      <path d="m151 565 143-39 167 16 49 43-145 28-169-13Z" fill="var(--dinner-rug)"></path>
      <path d="m173 566 124-29 151 16 40 27-128 23-153-13Z" fill="none" stroke="var(--dinner-rug-line)" stroke-width="2" opacity=".6"></path>
      <path d="m170 570-22 4m25 3-22 4m28 4-20 5m302-16 21 7m-28 1 20 7m-32-3 19 8" stroke="var(--dinner-rug)" stroke-width="3"></path>
      <ellipse data-part="dog-shadow" cx="342" cy="570" rx="82" ry="11" fill="#655036" opacity=".18" transform="translate(0 0)"></ellipse>
      <g data-part="dog" transform="translate(354 567)">
        <g data-part="tail" transform="rotate(0 -61 -75)"><path d="M-57-73C-91-57-126-80-132-113L-128-145-116-155-117-130C-111-106-90-101-64-109Z" fill="#bd8a55"></path><path d="M-117-130C-111-106-90-101-64-109L-57-96C-91-83-118-100-124-121Z" fill="#e2b783"></path></g>
        <path data-part="dog-arm" d="M21.5938 -138.0749L115.8004 -150.964Q125.9094 -142.7904 124.6906 -155.7331L192.7762 -244.7126L177.2238 -257.2874L104.4725 -172.0803Q103.2537 -185.023 113.3627 -176.8494L18.4062 -171.9251Z" fill="#c99760"></path>
        <path data-part="dog-arm-fold" d="M25 -155L118.5816 -163.9067L188 -252" fill="none" stroke="#e3b882" stroke-width="8" stroke-linecap="round"></path>

        <g data-part="dog-paw" transform="translate(185 -251) rotate(-15)">
          <path d="m-14-11 19-4 14 8 4 11-6 8-29-1-7-9Z" fill="#ecd0a0"></path><path d="m-12 5 28 0 7-1-6 8-29-1Z" fill="#d3aa75"></path>
          <path d="m5-5 3 8m5-5 3 7" fill="none" stroke="#ab8158" stroke-width="1.4" stroke-linecap="round"></path>
        </g>
        <g :filter="`url(#${uid}-soft-shadow)`" data-part="dog-body">
          <path d="M-58-110C-89-103-94-56-79-31L-61-8-6-5 5-15-15-32-15-86Z" fill="#b6804f"></path>
          <path d="m-69-21 29-2 15 13 32 4 3 9-71 1-15-7Z" fill="#c89960"></path>
          <path d="M-66-42C-87-86-61-129-40-155L-16-203 17-214 41-195 49-161 32-113 29-70 8-38-25-22Z" fill="#c99760"></path>
          <path d="M-66-42C-83-88-58-128-37-150L-12-194-16-149-39-117-49-66-35-30Z" fill="#ddb17a"></path>
          <path d="m17-214 24 19 8 34-17 48-3 43L12-43-6-62 8-112 0-151Z" fill="#eed4a0"></path>
          <path d="m4-103 24 4 4 73 20 15 13 4 1 11-44 0-12-12-6-45Z" fill="#d9aa71" data-part="dog-planted-leg"></path>
          <path d="m26-101 2 2 4 73 20 15 13 4 1 11-21 0-17-17Z" fill="#efd4a0" data-part="dog-planted-paw"></path>
          <path d="m45-4 1 8m9-7 1 7" stroke="#a97e51" stroke-width="1.5"></path>
          <g data-part="belly" transform="translate(-43 -78) scale(1 1) translate(43 78)">
            <path d="M-62-105Q-78-75-61-47L-41-36-31-51Q-22-83-43-105Z" fill="#d2a46a"></path>
            <path d="M-63-83q28-14 38 16l-5 22" fill="none" stroke="#ab7b4c" stroke-width="2" opacity=".6"></path>
          </g>
        </g>
        <g data-part="dog-head" transform="rotate(-12 19 -196)">
          <path d="m34-254 20-15 12 13-1 32-11 20-10-5Z" fill="#a96e45"></path>
          <path d="m-7-215 6-33 20-22 30-4 21 13 6 18 29 9 12 21-24 12-30 2-20 21-31-2Z" fill="#d3a16a"></path>
          <path d="m19-270 30-4 21 13 6 18-15-5-14-13-31 9-17 22 0-18Z" fill="#e6bb84"></path>
          <path d="m61-235 16-8 28 9 12 21-24 12-30 2-20 21-18-2 24-23Z" fill="#f1d6a4"></path>
          <path d="m86-218 26 2-10 14-20 8-23-4-7-7Z" fill="#e3bf8b"></path>
          <path d="m103-235 15 7 2 9-11 4-10-8Z" fill="#514337"></path>
          <path d="m106-232 8 3" stroke="#89705a" stroke-width="2" stroke-linecap="round"></path>
          <path d="M72 -205 Q84 -212 99 -207" fill="none" stroke="#8d6645" stroke-width="2" stroke-linecap="round" data-part="dog-mouth"></path>
          <g data-part="tongue" opacity="0"><path d="m83-202 12-2 1 13-5 6-7-4Z" fill="#c78f79"></path><path d="m90-200 1 9" stroke="#a77064" stroke-width="1"></path></g>
          <path d="m4-192 19 8 19-1 11-10 0 11-14 11-18 1-20-10Z" fill="#83928b"></path>
          <path d="m20-178 9 4-2 12-10-1-3-9Z" fill="#d1af64"></path><circle cx="21" cy="-169" r="2" fill="#f1d98f"></circle>
          <g data-part="dog-eye" transform="translate(58 -241) scale(1 1) translate(-58 241)"><ellipse cx="58" cy="-241" rx="5.3" ry="6.5" fill="#493d32"></ellipse><circle data-part="pupil-shine" cx="60" cy="-243" r="1.8" fill="#faf0d3"></circle></g>
          <path data-part="brow" d="M51 -251 Q57 -257 65 -255" fill="none" stroke="#a77649" stroke-width="2.3" stroke-linecap="round" transform="rotate(0.6803 58 -254)"></path>
          <g data-part="ear" transform="rotate(0 7 -245)"><path d="m-4-246 22-13 8 19-6 35-11 24-20-10-8-27Z" fill="#93613f"></path><path d="m-4-246 13-6 1 31-5 26-12 2-9-20Z" fill="#b17b4f"></path><path d="m14-248 4 8-6 36-6 10" fill="none" stroke="#d09a64" stroke-width="2" opacity=".6"></path></g>
        </g>
        <g data-part="hunger" opacity="0" fill="none" stroke="#947649" stroke-width="2.5" stroke-linecap="round" transform="translate(0 0)"><path d="m-100-88-9 6 11 6-9 6m106-36 9 6-9 6 8 6"></path></g>
      </g>
      <ellipse cx="134" cy="584" rx="47" ry="7" fill="#715b40" opacity=".13"></ellipse>
      <g :filter="`url(#${uid}-soft-shadow)`">
        <path d="m95 558 73 0 11 24q-41 13-92 0Z" fill="var(--dinner-bowl)"></path>
        <ellipse cx="132" cy="557" rx="37" ry="10" fill="#ddd9bb"></ellipse><ellipse cx="132" cy="558" rx="28" ry="6" fill="#a1a88d"></ellipse>
        <path d="m94 576 81 0 4 6q-41 13-92 0Z" fill="#80988f"></path>
        <path d="m123 569 15 0m-15-2v4m15-4v4" stroke="#e1dfc1" stroke-width="3" stroke-linecap="round"></path>
      </g>

      <g data-part="eat-arm-group">
        <path data-part="eat-upper" fill="#d1a176" d="M839.8277 127.7053L906.1361 220.5234Q932.4698 225.8656 937.812 199.532L878.1723 102.2947A23 23 0 0 0 839.8277 127.7053Z"></path>
        <path data-part="eat-sleeve" fill="var(--dinner-shirt)" d="M834.8263 131.0197L877.2045 187.7273Q911.854 194.7566 918.8833 160.1071L883.1737 98.9803A29 29 0 0 0 834.8263 131.0197Z"></path>
        <path data-part="eat-cuff" fill="var(--dinner-shirt-light)" d="M874.3521 184.1471L880.983 193.4289L922.6618 165.8087L916.6978 156.085Z"></path>
        <path data-part="eat-forearm" fill="#dfae80" d="M920.549 191.0812L780.5087 209.1358Q769.9037 221.4659 782.2338 232.071L923.3992 228.9742A19 19 0 0 0 920.549 191.0812Z"></path>
        <g data-part="eat-hand" transform="translate(781.3713 220.6034) rotate(172)">
          <path d="M0 6v-57m-8-11v10q8 7 16 0v-10m-11 0v10m6-10v10" fill="none" stroke="#a2aea2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
          <g data-part="fork-bite" opacity="1">
  <path d="m-7-58 3-10 9 2 3 9-8 3Z" fill="#c59d55"></path>
  <path d="m-4-68 9 2-5 5-7 3Z" fill="#e0bf78"></path>
</g><path d="M-12-9Q-5-15 6-11L13-4 12 11 5 17-7 15-13 7Z" fill="#dfae80"></path>
          <path d="M-7-6Q-1-8 5-6M-8 0Q-2-2 4 0M-7 6Q-1 4 5 6" fill="none" stroke="#bd895f" stroke-width="1.2" stroke-linecap="round"></path>
        </g>
      </g>
      <g data-part="food-pile-front">
  <path d="m766 285 10-10 13 7-3 13-15 1-10-6Z" fill="#b28547"></path>
  <path d="m776 275 13 7-11 2-12 1Z" fill="#d9b674"></path>
  <path data-part="food-cover" d="M777 280 783 262 795 259 807 273 809 288 798 298 781 296 773 289Z" fill="#bd9753"></path>
  <path d="m783 262 12-3 12 14-17 4-13 3Z" fill="#d9b975"></path>
  <path d="m790 277 17-4 2 15-11 10-1-13Z" fill="#ac8347"></path>
  <path d="m799 294 6-11 11 1 6 10-10 5Z" fill="#cba45f"></path>
  <path d="m805 283 11 1-5 5-9 2Z" fill="#e4c680"></path>
  <path d="m755 290 7-6 9 4 1 7-12 2Z" fill="#9aa575"></path>
  <path d="m809 273 5-7 6 5-3 9Z" fill="#9dab77"></path>
</g>
      <g data-part="deny-arm-group" transform="translate(668 98)">
        <g data-part="deny-upper-group" transform="rotate(40.6782)">
          <path data-part="deny-skin" d="M-25 65H25L20 135A20 20 0 0 1-20 135Z" fill="#dba879"></path>
          <path data-part="deny-sleeve" d="M-29 1A30 30 0 0 1 30 1L32 72 26 87-25 87-31 72Z" fill="var(--dinner-shirt)"></path>
          <path d="m-26 78 53 0-1 9-51 0Z" fill="var(--dinner-shirt-light)" opacity=".65"></path>
          <g data-part="deny-forearm-group" transform="translate(0 135) rotate(-12.1468)">
            <path data-part="deny-forearm" d="M-20 0A20 20 0 0 1 20 0L12 100Q0 113-12 100Z" fill="#dba879"></path>
            <g data-part="deny-wrist" transform="translate(0 100)">
              <path d="M10-7Q18-11 19-4L20 8Q19 13 13 13L7 4Z" fill="#dba879"></path>
              <path d="M-11-12Q0-16 9-10L16 3 17 15Q17 22 12 24L7 24Q3 29-1 25Q-7 28-10 22L-14 13-14-2Z" fill="#dba879"></path>
              <path d="m-7 7 2 13m5-14 2 16m5-15 2 12" fill="none" stroke="#b7825e" stroke-width="1.25" stroke-linecap="round"></path>
              <g data-part="deny-hand" transform="translate(0 20)"></g>
            </g>
          </g>
        </g>
      </g>
      <g data-part="tap" opacity="0" fill="none" stroke="#8e6f46" stroke-width="2.5" stroke-linecap="round"><path d="m522 300-9-5m39 26 9 3m-13-27 7-8"></path></g>
      <path d="M-80-80H1100V760H-80Z" :fill="`url(#${uid}-grain)`" pointer-events="none"></path>
    </g>
    <path d="M40 78 43 581Q44 614 80 613" fill="none" stroke="#fff8de" stroke-width="2" opacity=".35"></path>
  </g>
  <g class="meal-scene__edition" fill="var(--apple-secondary, #74766e)" font-size="10" letter-spacing="2"><text x="44" y="20">NOT YOURS</text><text x="942" y="650" text-anchor="end">PAPER TALES — 02</text></g>
</svg>
    </div>
    <button v-if="canAnimate" class="meal-scene__pause" type="button" :aria-label="userPaused ? '继续动画' : '暂停动画'" :aria-pressed="userPaused" @click="userPaused = !userPaused">
      <Play v-if="userPaused" :size="12" aria-hidden="true" /><Pause v-else :size="12" aria-hidden="true" />
    </button>
  </figure>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Pause, Play } from 'lucide-vue-next'
import { useApple } from '../../src'
import { resolveMotion } from '../../src/core/context'
import { createForbiddenPaperStory, createForbiddenRenderer, type ForbiddenPaperStory } from './forbidden-paper-story'

const uid = `meal-${useId().replace(/:/g, '')}`
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
const story = ref<'intro' | 'loop' | 'static'>('static')
let player: ForbiddenPaperStory | undefined
let observer: IntersectionObserver | undefined
let mounted = false

function stop() { player?.dispose(); player = undefined }
function syncPlayback() { player?.setPaused(suspended.value) }
function play(intro: boolean) {
  stop()
  if (!mounted || !art.value) return
  if (!canAnimate.value) { createForbiddenRenderer(art.value).still(); story.value = 'static'; return }
  story.value = intro ? 'intro' : 'loop'
  player = createForbiddenPaperStory(art.value, intro, () => { story.value = 'loop' })
  syncPlayback()
}
function visibilityChanged() { hidden.value = document.hidden }
function mediaChanged() { systemReduced.value = media?.matches ?? false }
watch(suspended, syncPlayback, { flush: 'sync' })
watch(canAnimate, enabled => {
  if (!mounted) return
  if (enabled) play(false)
  else play(false)
}, { flush: 'post' })
onMounted(async () => {
  mounted = true
  document.addEventListener('visibilitychange', visibilityChanged)
  media?.addEventListener('change', mediaChanged)
  if (typeof IntersectionObserver !== 'undefined' && scene.value) {
    observer = new IntersectionObserver(([entry]) => { offscreen.value = !entry.isIntersecting }, { threshold: 0 })
    observer.observe(scene.value)
  }
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
.meal-scene {
  --dinner-wall-top: #f4ead8; --dinner-wall: #e8e3c9; --dinner-frame-shadow: #d4cbbb;
  --dinner-panel: #d6d8ba; --dinner-panel-line: #aeb795; --dinner-baseboard: #b8b69a;
  --dinner-floor: #d4c39f; --dinner-floor-line: #b29a77; --dinner-daylight: #fff5ce;
  --dinner-window-frame: #e4d7b6; --dinner-window-sky: #dde1c9; --dinner-sun: #fdf6d5;
  --dinner-hill-far: #bbc6ad; --dinner-hill-fold: #d0d3b5; --dinner-hill-near: #9bad88; --dinner-tree: #829678;
  --dinner-chair: #b29a70; --dinner-chair-dark: #917c58;
  --dinner-shirt: #829585; --dinner-shirt-light: #a3af96; --dinner-shirt-dark: #627b6d;
  --dinner-cloth: #aac4ba; --dinner-cloth-fold: #8daaa2;
  --dinner-rug: #b4bb92; --dinner-rug-line: #d0ceaa; --dinner-bowl: #a2b6a7;
  --dinner-photo-sky: #2b4051; --dinner-photo-shore: #465e65; --dinner-photo-lake: #567680;
  --dinner-photo-bank: #3e5752; --dinner-photo-tree: #304d49; --dinner-photo-reflection: #d5d0ae; --dinner-photo-window: #f1d791;
  position: relative; min-width: 0; margin: 0;
}
.meal-scene--dark {
  --dinner-wall-top: #253536; --dinner-wall: #354a47; --dinner-frame-shadow: #121d1f;
  --dinner-panel: #465b4e; --dinner-panel-line: #62765a; --dinner-baseboard: #3c5044;
  --dinner-floor: #838366; --dinner-floor-line: #62634b; --dinner-daylight: #bdb37d;
  --dinner-window-frame: #708170; --dinner-window-sky: #364c4e; --dinner-sun: #ddcd9d;
  --dinner-hill-far: #466357; --dinner-hill-fold: #58715c; --dinner-hill-near: #334e42; --dinner-tree: #253e37;
  --dinner-chair: #8a805b; --dinner-chair-dark: #696548;
  --dinner-shirt: #667f71; --dinner-shirt-light: #8b9d82; --dinner-shirt-dark: #486759;
  --dinner-cloth: #74978e; --dinner-cloth-fold: #5a7d76;
  --dinner-rug: #657856; --dinner-rug-line: #899474; --dinner-bowl: #819c8e;
  --dinner-photo-sky: #dce5d5; --dinner-photo-shore: #a7ba9a; --dinner-photo-lake: #98bcc0;
  --dinner-photo-bank: #92a77a; --dinner-photo-tree: #718a63; --dinner-photo-reflection: #f8edcb; --dinner-photo-window: #6d847a;
}
.meal-scene__window { overflow: hidden; padding: 4px; }
.meal-scene__art { display: block; width: 100%; height: auto; overflow: visible; }
.meal-scene__art [data-part] { transform-box: view-box; }
.meal-scene .dinner-photo-day { display: none; }
.meal-scene .dinner-photo-night { display: inline; }
.meal-scene--dark .dinner-photo-day { display: inline; }
.meal-scene--dark .dinner-photo-night { display: none; }

.meal-scene__pause { position: absolute; right: 1.5%; bottom: -5px; width: 32px; height: 32px; padding: 0; display: grid; place-items: center; border: 0; border-radius: 50%; background: transparent; color: var(--apple-secondary); cursor: pointer; }
.meal-scene__pause:hover { background: var(--apple-hover); }
.meal-scene__pause:focus-visible { outline: 2px solid var(--apple-accent); outline-offset: 2px; }
@media (max-width: 880px) { .meal-scene__window { margin-inline: -12px; } .meal-scene__pause { right: -1%; } }
@media (max-width: 420px) { .meal-scene__edition { font-size: 12px; } .meal-scene__pause { bottom: -8px; } }
</style>
