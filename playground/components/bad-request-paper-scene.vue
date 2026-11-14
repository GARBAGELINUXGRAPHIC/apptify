<template>
  <figure class="bad-request-scene" :data-theme="theme">
    <div class="bad-request-scene__window">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" :aria-labelledby="`${uid}-title ${uid}-desc`" class="bad-request-scene__art" ref="art">
  <title :id="`${uid}-title`">一个不合规格的包裹，与一只困惑的猫</title>
  <desc :id="`${uid}-desc`">镜头近距离跟随一个歪歪扭扭的红色包裹。包裹随传送带停下后，镜头只拉远一次，露出普通纸箱和一只头顶问号的猫。猫一直看着包裹，不时歪头、眨眼、抬爪挠头。</desc>
  <defs>
    <linearGradient :id="`${uid}-wall`" x1="0" y1="0" x2="0.2" y2="1"><stop stop-color="var(--br-wall-top)"/><stop offset="1" stop-color="var(--br-wall)"/></linearGradient>
    <linearGradient :id="`${uid}-glass`" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e9e5c8"/><stop offset="1" stop-color="#bbc9ac"/></linearGradient>
    <filter :id="`${uid}-soft`" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="1" dy="3" stdDeviation="1.5" flood-color="#514633" flood-opacity=".16"/></filter>
    <pattern :id="`${uid}-grain`" width="53" height="47" patternUnits="userSpaceOnUse"><path d="m4 8 1-.4m27 11 .8-.3m13 15 1-.3m-25 5 .6-.3" stroke="#685940" stroke-opacity=".12" stroke-width=".8"/><path d="m13 17 1.8-.6m22-9 1-.4m-14 29 1.4-.5" stroke="#fff9e9" stroke-opacity=".3" stroke-width=".8"/></pattern>
    <clipPath :id="`${uid}-frame`"><path d="M38 80Q38 40 80 36L1111 22Q1155 22 1162 71L1183 631Q1185 670 1139 682L87 704Q35 702 34 657Z"/></clipPath>
    <clipPath :id="`${uid}-window`"><path d="m139 144 204-7 2 153-206 7Z"/></clipPath>
    <clipPath :id="`${uid}-belt`"><path d="M-1000 405H687a24 24 0 0 1 0 48H-1000Z"/></clipPath>
    <g :id="`${uid}-box`">
      <path d="M-44-69H25V0H-44Z" fill="#c6a06f"/>
      <path d="m25-69 21-16v69L25 0Z" fill="#a78056"/>
      <path d="m-44-69 21-16h69L25-69Z" fill="#e1bf8b"/>
      <path d="M-16-69H-2V0H-16Z" fill="#e8d5ae"/>
      <path d="m-16-69 21-16h14L-2-69Z" fill="#f1dfb9"/>
      <path d="m-42-67 65 0m4 0 16-13" stroke="#f1d3a1" stroke-width="1.2" fill="none"/>
      <path d="M5-49h15v22H5Z" fill="#f5e9cd"/>
      <path d="M8-43h8m-8 4h6m-6 6h1m2 0h1m2 0h2" fill="none" stroke="#948776" stroke-width="1.2"/>
      <path d="m-35-11 0-10m-3 3 3-3 3 3m6 7v-10m-3 3 3-3 3 3" fill="none" stroke="#8b6d4f" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="m-43-1 67 0m3-1 17-14" fill="none" stroke="#8f704c" stroke-opacity=".5" stroke-width="1"/>
    </g>
    <g :id="`${uid}-leaf`"><path d="M0 0C-21-5-31-22-22-43-1-37 9-17 0 0Z" fill="currentColor"/><path d="M0 0-18-34" fill="none" stroke="#d4d9b8" stroke-width="1.2" stroke-opacity=".6"/></g>
  </defs>
  <path d="M47 92Q46 49 88 47L1120 33Q1167 35 1175 84L1194 642Q1196 686 1146 694L94 715Q44 713 44 665Z" fill="var(--br-shadow)"/>
  <g :clip-path="`url(#${uid}-frame)`">
    <path d="M0 0H1200V720H0Z" :fill="`url(#${uid}-wall)`"/>
    <g data-part="camera">
      <path d="M-1800-1000H2800V1400H-1800Z" :fill="`url(#${uid}-wall)`"/>
      <path d="M-1800 536 2800 496V1500H-1800Z" fill="var(--br-floor)"/>
      <path d="M-1800 549 2800 509" stroke="var(--br-baseboard)" stroke-width="8"/>
      <path d="M-100 612 1330 592m-1240 67 1260-13M219 534 75 800m454-269-22 269m273-272 134 272m100-274 269 268" fill="none" stroke="var(--br-floor-line)" stroke-width="1.5" opacity=".45"/>
      <path d="m24 58 1120-19 12 39L21 100Z" fill="var(--br-timber)"/>
      <path d="m24 58 1120-19 5 11L23 72Z" fill="var(--br-timber-light)"/>
      <path d="m1093 78 22-1 14 431-22 2Z" fill="var(--br-timber)"/>
      <path d="m1093 78 7 0 14 432-7 1Z" fill="var(--br-timber-light)"/>
      <path d="m1101 103-107 95 8 10 105-88Z" fill="var(--br-timber)"/>
      <g :filter="`url(#${uid}-soft)`">
        <path d="m122 128 235-9 4 190-238 9Z" fill="#b6a58b"/>
        <path d="m130 136 220-8 3 172-222 9Z" fill="#879382"/>
        <g :clip-path="`url(#${uid}-window)`">
          <path d="M130 128H360V317H130Z" :fill="`url(#${uid}-glass)`"/>
          <circle cx="294" cy="177" r="24" fill="#f7edca"/>
          <path d="M118 252 178 211 223 242 282 204 366 255V315H118Z" fill="#bdc6a6"/>
          <path d="m178 211 45 31 59-38-26 47-65 4Z" fill="#d0d3b1"/>
          <path d="M121 282 177 255 236 272 311 246 366 275V320H121Z" fill="#9fb394"/>
          <path d="M125 305Q222 273 358 292V326H125Z" fill="#b9c399"/>
          <path d="m164 300 3-49m0 25-16-17m16 3 13-17" fill="none" stroke="#809575" stroke-width="4"/>
          <path d="m141 257 4-21 19-13 20 7 12 18-9 20-23 3Z" fill="#8fa47f"/>
          <path d="m145 236 19-13 20 7 7 11-24 11-26 5Z" fill="#afbb91"/>
        </g>
        <path d="m243 141 1 153m-104-84 203-7" fill="none" stroke="#dfcfad" stroke-width="8"/>
        <path d="m245 141 1 153m-105-83 202-7" fill="none" stroke="#9e9f85" stroke-width="1.5"/>
        <path d="m116 310 248-9 9 12-257 10Z" fill="#d5bd97"/>
        <path d="m116 323 257-10-1 7-257 10Z" fill="#ad9270"/>
      </g>
      <path d="m141 327 227-8 100 207-226 5Z" fill="#fff0c8" fill-opacity=".13"/>
      <g :filter="`url(#${uid}-soft)`">
        <path d="m447 199 233-5 15 12-247 7Z" fill="#c5ad89"/>
        <path d="m448 213 247-7-1 9-246 7Z" fill="#a58c6b"/>
        <path d="m468 222 9-1 0 22-9-6m190-20 9 0 0 22-9-6" fill="#af9879"/>
        <use :href="`#${uid}-box`" transform="translate(499 199) scale(.68)"/>
        <use :href="`#${uid}-box`" transform="translate(576 198) scale(.68)"/>
        <use :href="`#${uid}-box`" transform="translate(650 196) scale(.68)"/>
      </g>
      <g transform="translate(1019 174) rotate(4)" :filter="`url(#${uid}-soft)`">
        <path d="M-33-44 35-43 36 46-34 48Z" fill="#b49c79"/>
        <path d="M-27-37 28-36 29 39-28 41Z" fill="#ede1c4"/>
        <path d="M-12-46h27v11h-27Z" fill="#81917e"/>
        <path d="M-14-20h30m-30 13h24m-24 13h30m-30 13h19" fill="none" stroke="#bab397" stroke-width="2"/>
        <path d="m-21-22 3 4 5-7m-8 17 3 4 5-7m-8 17 3 4 5-7" fill="none" stroke="#97a17f" stroke-width="1.6"/>
      </g>
      <g transform="translate(1130 510)" :filter="`url(#${uid}-soft)`">
        <path d="M0 0-8-78m6 45-23-28m22 17 19-33" fill="none" stroke="#7e8d6c" stroke-width="3"/>
        <g color="#8fa178"><use :href="`#${uid}-leaf`" transform="translate(-6 -41) rotate(-36) scale(.8)"/><use :href="`#${uid}-leaf`" transform="translate(-9 -69) rotate(15) scale(.8)"/></g>
        <g color="#a9b18a"><use :href="`#${uid}-leaf`" transform="translate(-2 -29) rotate(48) scale(.75)"/><use :href="`#${uid}-leaf`" transform="translate(6 -56) rotate(76) scale(.7)"/></g>
        <path d="M-28-3 23-5 17 38-20 40Z" fill="#b58c6d"/>
        <path d="M-28-3-18-4-11 39-20 40Z" fill="#cfab87"/>
        <path d="M-31-10 26-12 25 0-30 2Z" fill="#d0ad88"/>
      </g>
      <!-- The belt and every parcel travel the same distance, then stop together. -->
      <path d="m76 603 600-5 47 16-679 3Z" fill="#596e59" fill-opacity=".13"/>
      <path d="M137 450h25L148 604H123Zm455 0h24l26 152h-26Z" fill="#748975"/>
      <path d="M137 450h8l-13 154h-9Zm455 0h8l26 152h-10Z" fill="#a1ad8f"/>
      <path d="M153 518h457v13H152Z" fill="#a7b197"/>
      <path d="m159 466 452 128m-8-128L145 593" fill="none" stroke="#94a58a" stroke-width="7"/>
      <path d="M115 603h40v8h-40Zm495-2h41v8h-41Z" fill="#607460"/>
      <path d="M-1000 405H687a25 25 0 0 1 0 50H-1000Z" fill="#485f57"/>
      <g :clip-path="`url(#${uid}-belt)`"><g data-part="belt-ribs" fill="none" stroke="#8e9e88" stroke-width="2.1"><path d="M-1024 408v6m0 30v6"/><path d="M-1000 408v6m0 30v6"/><path d="M-976 408v6m0 30v6"/><path d="M-952 408v6m0 30v6"/><path d="M-928 408v6m0 30v6"/><path d="M-904 408v6m0 30v6"/><path d="M-880 408v6m0 30v6"/><path d="M-856 408v6m0 30v6"/><path d="M-832 408v6m0 30v6"/><path d="M-808 408v6m0 30v6"/><path d="M-784 408v6m0 30v6"/><path d="M-760 408v6m0 30v6"/><path d="M-736 408v6m0 30v6"/><path d="M-712 408v6m0 30v6"/><path d="M-688 408v6m0 30v6"/><path d="M-664 408v6m0 30v6"/><path d="M-640 408v6m0 30v6"/><path d="M-616 408v6m0 30v6"/><path d="M-592 408v6m0 30v6"/><path d="M-568 408v6m0 30v6"/><path d="M-544 408v6m0 30v6"/><path d="M-520 408v6m0 30v6"/><path d="M-496 408v6m0 30v6"/><path d="M-472 408v6m0 30v6"/><path d="M-448 408v6m0 30v6"/><path d="M-424 408v6m0 30v6"/><path d="M-400 408v6m0 30v6"/><path d="M-376 408v6m0 30v6"/><path d="M-352 408v6m0 30v6"/><path d="M-328 408v6m0 30v6"/><path d="M-304 408v6m0 30v6"/><path d="M-280 408v6m0 30v6"/><path d="M-256 408v6m0 30v6"/><path d="M-232 408v6m0 30v6"/><path d="M-208 408v6m0 30v6"/><path d="M-184 408v6m0 30v6"/><path d="M-160 408v6m0 30v6"/><path d="M-136 408v6m0 30v6"/><path d="M-112 408v6m0 30v6"/><path d="M-88 408v6m0 30v6"/><path d="M-64 408v6m0 30v6"/><path d="M-40 408v6m0 30v6"/><path d="M-16 408v6m0 30v6"/><path d="M8 408v6m0 30v6"/><path d="M32 408v6m0 30v6"/><path d="M56 408v6m0 30v6"/><path d="M80 408v6m0 30v6"/><path d="M104 408v6m0 30v6"/><path d="M128 408v6m0 30v6"/><path d="M152 408v6m0 30v6"/><path d="M176 408v6m0 30v6"/><path d="M200 408v6m0 30v6"/><path d="M224 408v6m0 30v6"/><path d="M248 408v6m0 30v6"/><path d="M272 408v6m0 30v6"/><path d="M296 408v6m0 30v6"/><path d="M320 408v6m0 30v6"/><path d="M344 408v6m0 30v6"/><path d="M368 408v6m0 30v6"/><path d="M392 408v6m0 30v6"/><path d="M416 408v6m0 30v6"/><path d="M440 408v6m0 30v6"/><path d="M464 408v6m0 30v6"/><path d="M488 408v6m0 30v6"/><path d="M512 408v6m0 30v6"/><path d="M536 408v6m0 30v6"/><path d="M560 408v6m0 30v6"/><path d="M584 408v6m0 30v6"/><path d="M608 408v6m0 30v6"/><path d="M632 408v6m0 30v6"/><path d="M656 408v6m0 30v6"/><path d="M680 408v6m0 30v6"/><path d="M704 408v6m0 30v6"/><path d="M728 408v6m0 30v6"/></g></g>
      <path d="M-1000 455H688l21-13 2 25-23 16H-1000Z" fill="#849b81"/>
      <path d="M-1000 455H688l21-13-8 15-15 9H-1000Z" fill="#bac4a6"/>
      <path d="M-1000 480H686" stroke="#577361" stroke-width="3"/>
      <g fill="#d1d5b9"><circle cx="85" cy="469" r="3"/><circle cx="288" cy="469" r="3"/><circle cx="490" cy="469" r="3"/><circle cx="657" cy="469" r="3"/></g>
      <g transform="translate(686 430)"><circle r="21" fill="#b4bca1"/><circle r="14" fill="#7e917c"/><g data-part="roller"><path d="M-10 0H10M0-10V10" stroke="#d4d8bc" stroke-width="3"/><circle r="4" fill="#586f5d"/></g></g>
      <g data-part="normal-parcels" transform="translate(522 0)" :filter="`url(#${uid}-soft)`">
        <use :href="`#${uid}-box`" transform="translate(-122 405) scale(1.04)"/>
        <use :href="`#${uid}-box`" transform="translate(-295 405) scale(1.04)"/>
        <use :href="`#${uid}-box`" transform="translate(-465 405) scale(1.04)"/>
      </g>
      <!-- One continuous silhouette: deliberately unlike all the regular cartons. -->
      <g data-part="parcel" transform="translate(592 405)">
        <ellipse cy="1" rx="82" ry="5" fill="#485f57" fill-opacity=".27"/>
        <g data-part="parcel-pitch" :filter="`url(#${uid}-soft)`">
          <path d="m-69-111 50-31 68 8 36 31-10 57 8 31L22 1-56-5-86-54Z" fill="#be695b"/>
          <path d="m-69-111 50-31 68 8 36 31-73 24Z" fill="#e7a18a"/>
          <path d="m-69-111 81 32 10 80-78-6-30-49Z" fill="#d98770"/>
          <path d="m12-79 73-24-10 57 8 31L22 1Z" fill="#a65750"/>
          <path d="m-69-111 18-24 29 27-8 20Z" fill="#efb293"/>
          <path d="m-19-142 27-24 39 42-35 45-18-38Z" fill="#d58a79"/>
          <path d="m8-166 39 42-17-7-16-25Z" fill="#efb39a"/>
          <path d="m12-79 35-45 18-2 20 23Z" fill="#e8aa90"/>
          <path d="m-76-91 25-7 72 78-6 17-18-9Z" fill="#8d9b8b"/>
          <path d="m-76-91 25-7 6 7-27 8Z" fill="#b8c6ad"/>
          <path d="m-25-135 18-6 14 46 54 67-15 7-57-69Z" fill="#b6bfa0"/>
          <path d="m7-95 54 67-15 7-24-36Z" fill="#8b9e89"/>
          <path d="m60-27 27-8 14 17-25 5-5-8-16 3Z" fill="#a1b095"/>
          <path d="m-83-55 18-7-1 14-18 7Z" fill="#b97060"/>
          <path d="m-40-65 29-6 12 17-8 26-29-2Z" fill="#eeccae"/>
          <path d="m-40-65 29-6 5 9-13 0-4 12-11 0Z" fill="#f7e2c2"/>
          <g transform="translate(38 -64) rotate(21)">
            <path d="M-19-17 20-17 20 17-18 18-24 8Z" fill="#f4e1bd"/>
            <path d="m-17-12 34 0m-32 6h27" fill="none" stroke="#b29b7a" stroke-width="1.3"/>
            <path d="M-15 5v8m4-8v8m3-8v8m5-8v8m3-8v8m5-8v8m3-8v8" stroke="#8e7962" stroke-width="1.4"/>
          </g>
          <path d="m-55-90 18 8m-35 29 13 19 17 4m71-83 14-16m10 75 13-5" fill="none" stroke="#f2bda0" stroke-width="1.5" stroke-opacity=".65"/>
          <path d="m-45-19 8-7 7 9 7-5m-3-101 9 16m43 83 15-8" fill="none" stroke="#9a584e" stroke-width="1.4" stroke-linecap="round"/>
        </g>
      </g>
      <g transform="translate(932 592)" data-part="cat-root">
        <path d="M-130 10Q-109-9-13-10 83-14 133 6L148 21Q99 41-4 42-106 45-143 25Z" fill="#9aa585"/>
        <path d="M-126 14Q-42-5 113 11M-129 23Q-26 7 128 20" fill="none" stroke="#c6c5a2" stroke-width="2" opacity=".65"/>
        <ellipse cx="0" cy="12" rx="95" ry="14" fill="#514c37" fill-opacity=".16"/>
        <g data-part="tail">
          <path d="M59-17C105-4 157-11 160-49 165-77 143-97 127-84" fill="none" stroke="#ba875d" stroke-width="27" stroke-linecap="round"/>
          <path d="M65-24C105-12 146-17 149-49 153-67 141-79 132-75" fill="none" stroke="#d9ad7b" stroke-width="10" stroke-linecap="round"/>
          <path d="m124-13-4-15m32-8-18-4m19-23-16 7" fill="none" stroke="#a06e4e" stroke-width="6" stroke-opacity=".6"/>
        </g>
        <g data-part="body">
          <path d="M-48-188Q-78-171-79-128L-85-72Q-92-20-60 4 6 24 64 2 87-15 81-65L76-127Q73-169 45-188Z" fill="#d5a273"/>
          <path d="M-48-188Q-78-171-79-128L-85-72Q-92-20-60 4L-36 10Q-70-23-57-87L-49-154Z" fill="#bc875e"/>
          <path d="M-18-175Q10-183 31-161L43-107Q56-47 31-19-3-4-33-21-54-42-43-96L-36-151Z" fill="#ead6b2"/>
          <path d="m-54-180 25 10-15 54 6 85-27 25-13-17-6-48 4-65Z" fill="#8c9e83"/>
          <path d="m34-176 22 4 20 42 4 60-6 49-22 18-18-28 8-66Z" fill="#728b74"/>
          <path d="m-42-119 84 1 17 81-18 23-64-2-23-24Z" fill="#8fa184"/>
          <path d="m-40-113 80 1m-69 83 56 1" fill="none" stroke="#c4ccb0" stroke-width="1.4" stroke-opacity=".7"/>
          <path d="m-22-85 44 1-2 29-18 8-21-7Z" fill="#7e9277"/>
          <path d="m-19-82 38 1m-30 29 11 4 14-7" fill="none" stroke="#b5c1a0" stroke-width="1.1"/>
          <path d="m-52-175 9 7-13 44m96-46 9 8 10 37" fill="none" stroke="#bbc7a6" stroke-width="3"/>
          <circle cx="-51" cy="-127" r="3" fill="#e1d9b1"/><circle cx="51" cy="-126" r="3" fill="#e1d9b1"/>
          <path d="M-64-145Q-84-130-86-100L-88-76Q-84-62-72-69L-55-99-47-131Z" fill="#d9ac7d"/>
          <path d="m-79-90 12 4m-15 5 11 5" fill="none" stroke="#ab7956" stroke-width="1.5" stroke-linecap="round"/>
        </g>
        <path d="M-62-17Q-88-10-90 2-91 12-74 16L-37 15Q-21 12-25 0L-34-14Z" fill="#d8aa7b"/>
        <path d="M35-15Q18-2 25 10L43 17 79 16Q98 13 94 4 85-9 66-15Z" fill="#d2a172"/>
        <path d="m-75 7 0 5m13-6 0 6m13-5 0 5m50-4 0 5m13-6 0 6m13-5 0 5" fill="none" stroke="#a77652" stroke-width="1.6" stroke-linecap="round"/>
        <g data-part="head" :filter="`url(#${uid}-soft)`">
          <path d="M-77-266-87-333Q-87-346-77-340L-30-301 36-301 78-341Q87-348 88-333L83-263Z" fill="#ce9b6e"/>
          <path d="m-77-328 34 31-27 19Z" fill="#d7a394"/>
          <path d="m79-328-31 31 27 19Z" fill="#d2a092"/>
          <path d="m-76-328 24 24-17 12Z" fill="#eac3ab"/>
          <path d="m79-328-22 24 15 12Z" fill="#e4b99f"/>
          <path d="M-71-288Q-48-306-6-304 40-309 70-287L88-263Q103-236 91-211L97-201 84-198 91-189 76-188Q45-157 3-160-44-160-73-186L-88-187-82-198-95-201-88-211Q-105-240-88-264Z" fill="#dbac7c"/>
          <path d="M-89-245Q-98-224-87-209L-95-201-82-198-88-187-73-186Q-44-160 3-160L-11-166Q-64-174-76-213Z" fill="#d4a273"/>
          <path d="M-87-224Q-58-219-38-226-13-231 2-221 16-232 44-224 62-214 86-226L91-204 84-196 89-188 74-189Q47-158 3-160-46-160-76-188L-87-188-82-198-95-201Z" fill="#ead0aa"/>
          <path d="M-86-263Q-66-287-40-288-63-266-68-237L-80-226-91-228Z" fill="#e7bc8e"/>
          <path d="m-25-300 12 0-1 26-7-4Zm21-3 13 1-5 31-6-4Zm24 1 11 5-8 24-6-7Z" fill="#b4825a"/>
          <path d="m-91-242 19 5-1 8-22-4Zm2 19 17 4-1 7-17-4Zm167-20 18-7 2 9-19 6Zm1 16 18-6-2 9-16 4Z" fill="#bc885d"/>
          <path d="m-56-263q13-9 27-5m46-2q12-5 26 3" fill="none" stroke="#936c4f" stroke-width="3.2" stroke-linecap="round"/>
          <g transform="translate(-37 -241)"><g data-part="eye-left"><ellipse rx="13.5" ry="14.8" fill="#f2e1be"/><g data-part="pupil-left"><ellipse cx="-3.2" cy="2.6" rx="6.6" ry="10.3" fill="#464435"/><ellipse cx="-5" cy="-.5" rx="2" ry="2.5" fill="#fff6df"/></g></g></g>
          <g transform="translate(34 -242)"><g data-part="eye-right"><ellipse rx="12.5" ry="14" fill="#f2e1be"/><g data-part="pupil-right"><ellipse cx="-3.4" cy="3" rx="6.4" ry="9.5" fill="#464435"/><ellipse cx="-5.2" cy="-.1" rx="1.9" ry="2.3" fill="#fff6df"/></g></g></g>
          <path d="M-10-215Q-1-220 8-215L0-206Z" fill="#ab7b68"/>
          <path d="M0-206v7m-7 5q7-3 14-1" fill="none" stroke="#8d7059" stroke-width="1.9" stroke-linecap="round"/>
          <g fill="#ae9575"><circle cx="-27" cy="-210" r="1.3"/><circle cx="-19" cy="-206" r="1.1"/><circle cx="24" cy="-211" r="1.3"/><circle cx="17" cy="-207" r="1.1"/></g>
          <path d="m-51-212-48-7m49 14-52 2m53 4-42 13m139-24 48-9m-48 15 52 0m-51 6 42 12" fill="none" stroke="#f6e6c8" stroke-width="1.7" stroke-linecap="round"/>
        </g>
        <!-- The entire arm is redrawn to its paw; it never detaches from the shoulder. -->
        <path data-part="arm-outline" d="M60-153Q93-137 92-107T76-68" fill="none" stroke="#b9855c" stroke-width="26" stroke-linecap="round"/>
        <path data-part="arm-fill" d="M60-153Q93-137 92-107T76-68" fill="none" stroke="#dcae7d" stroke-width="21" stroke-linecap="round"/>
        <g data-part="paw" transform="translate(76 -68)">
          <path d="M-13-10Q-15-19-7-20L1-18Q8-22 13-16L16-3Q17 12 4 15-10 16-14 7Z" fill="#dfb484"/>
          <path d="m-9-9 0 8m7-11 0 8m7-9 0 7" fill="none" stroke="#ad805b" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M-8 7q8 5 16-1" fill="none" stroke="#f0cf9e" stroke-width="1.4"/>
        </g>
        <g data-part="scratch-marks" visibility="hidden" fill="none" stroke="#aa9476" stroke-width="2" stroke-linecap="round"><path d="m0 0 5-5m2 13 8-3"/></g>
      </g>
      <g transform="translate(940 182)">
        <g data-part="question" :filter="`url(#${uid}-soft)`">
          <path d="M-16-8Q-16-28 3-29 22-29 23-14 24-2 11 5Q3 10 3 20" fill="none" stroke="#89997b" stroke-width="10" stroke-linecap="round"/>
          <path d="M-17-10Q-17-28 2-30 19-30 21-17" fill="none" stroke="#bcc5a0" stroke-width="2.4" stroke-linecap="round"/>
          <circle cx="3" cy="36" r="5.7" fill="#89997b"/>
          <circle cx="1.5" cy="34.8" r="1.5" fill="#c4ccaa"/>
        </g>
      </g>
      <path d="m757 627 62 1m-550 16 48-1m-123-15 34 0m744 11 51-1" fill="none" stroke="var(--br-floor-line)" stroke-width="1.6" opacity=".45"/>
    </g>
    <path d="M0 0H1200V720H0Z" :fill="`url(#${uid}-grain)`" pointer-events="none"/>
  </g>
  <path d="M42 83 40 645Q40 682 85 681" fill="none" stroke="#fff8e0" stroke-width="2" stroke-opacity=".48"/>
</svg>

    </div>
    <div v-if="canAnimate" class="bad-request-scene__controls">
      <button type="button" :aria-label="paused ? '继续动画' : '暂停动画'" :title="paused ? '继续动画' : '暂停动画'" @click="togglePause">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path v-if="paused" d="m5 3 8 5-8 5Z"/><path v-else d="M5 3v10m6-10v10"/></svg>
      </button>
      <button type="button" aria-label="重播动画" title="重播动画" @click="replay">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6a5.4 5.4 0 1 1-.1 4M3 2v4h4"/></svg>
      </button>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, useId, watch } from 'vue'
import { createBadRequestStory, type BadRequestStory } from './bad-request-paper-story'

const props = withDefaults(defineProps<{ theme?: 'auto' | 'light' | 'dark'; reducedMotion?: boolean }>(), {
  theme: 'auto', reducedMotion: false,
})
const uid = `bad-request-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const art = ref<SVGSVGElement>()
const paused = ref(false)
const systemReduced = ref(false)
const canAnimate = computed(() => !props.reducedMotion && !systemReduced.value)
let story: BadRequestStory | undefined
let media: MediaQueryList | undefined
const updateSystemMotion = () => { systemReduced.value = media?.matches ?? false }
function pause() { paused.value = true; story?.pause() }
function play() { paused.value = false; story?.play() }
function togglePause() { if (paused.value) play(); else pause() }
function replay() { story?.restart(); play() }
watch(canAnimate, allowed => story?.setReducedMotion(!allowed))
onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateSystemMotion()
  media.addEventListener('change', updateSystemMotion)
  if (art.value) story = createBadRequestStory(art.value, !canAnimate.value)
})
onActivated(() => story?.setActive(true))
onDeactivated(() => story?.setActive(false))
onBeforeUnmount(() => { media?.removeEventListener('change', updateSystemMotion); story?.dispose() })
defineExpose({ replay, pause, play })
</script>

<style scoped>
.bad-request-scene {
  --br-wall-top:#f2e9d8; --br-wall:#e5dfc9; --br-floor:#c5c5a4;
  --br-baseboard:#b4b697; --br-floor-line:#97a185; --br-shadow:#d5ccba;
  --br-timber:#bba781; --br-timber-light:#d3bd97;
  position:relative; min-width:0; margin:0;
}
.bad-request-scene[data-theme="dark"] {
  --br-wall-top:#293b39; --br-wall:#3a4c43; --br-floor:#718062;
  --br-baseboard:#5d7056; --br-floor-line:#a3ac87; --br-shadow:#172724;
  --br-timber:#827b5e; --br-timber-light:#aaa382;
}
@media(prefers-color-scheme:dark) {
  .bad-request-scene[data-theme="auto"] {
    --br-wall-top:#293b39; --br-wall:#3a4c43; --br-floor:#718062;
    --br-baseboard:#5d7056; --br-floor-line:#a3ac87; --br-shadow:#172724;
    --br-timber:#827b5e; --br-timber-light:#aaa382;
  }
}
.bad-request-scene__window { padding:4px; overflow:hidden; }
.bad-request-scene__art { display:block; width:100%; height:auto; overflow:visible; isolation:isolate; }
.bad-request-scene__controls { position:absolute; right:1.5%; bottom:-18px; display:flex; gap:3px; }
.bad-request-scene__controls button {
  display:grid; place-items:center; width:30px; height:30px; padding:0;
  border:0; border-radius:50%; background:transparent;
  color:var(--apple-secondary,#787a68); cursor:pointer;
}
.bad-request-scene__controls button:hover { background:var(--apple-hover,rgba(108,117,92,.08)); }
.bad-request-scene__controls button:focus-visible { outline:2px solid var(--apple-accent,#72856f); outline-offset:2px; }
.bad-request-scene__controls svg { width:13px; height:13px; fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; stroke-linejoin:round; }
@media(max-width:880px) { .bad-request-scene__window { margin-inline:-12px; } .bad-request-scene__controls { right:-1%; bottom:-16px; } }
</style>
