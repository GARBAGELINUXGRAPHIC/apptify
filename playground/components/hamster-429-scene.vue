<template>
<figure class="hp429-scene" :data-theme="theme" data-hamster-scene ref="root">
    <div class="hp429-window"><svg class="hp429-art" viewBox="0 0 1200 720" role="img" aria-labelledby="hp429-title hp429-desc" xmlns="http://www.w3.org/2000/svg">
  <title id="hp429-title">仓鼠与搬不完的包裹山</title>
  <desc id="hp429-desc">镜头先近距离看一只使尽力气推箱子的仓鼠：它拼命蹬腿，身体发抖，额头冒汗，但每一步都把箱子向前推进。镜头逐渐拉远，露出远高于仓鼠的巨大包裹山。仓鼠把箱子推出左右两侧的画面，后续工人从山脚后接着搬运。包裹从画面上方不断落下，看不到投递者。</desc>
  <defs>
    <linearGradient id="hp429-sky" x2=".3" y2="1"><stop stop-color="var(--hp-sky-top)"/><stop offset="1" stop-color="var(--hp-sky)"/></linearGradient>
    <linearGradient id="hp429-wood" x2=".9" y2=".2"><stop stop-color="#d6b17e"/><stop offset="1" stop-color="#b98e64"/></linearGradient>
    <filter id="hp429-paper" x="-25%" y="-30%" width="160%" height="180%"><feDropShadow dx="1" dy="5" stdDeviation="2.7" flood-color="#39291e" flood-opacity=".14"/></filter>
    <filter id="hp429-soft" x="-35%" y="-35%" width="180%" height="190%"><feDropShadow dx=".7" dy="2.8" stdDeviation="1.5" flood-color="#39291e" flood-opacity=".13"/></filter>
    <clipPath id="hp429-frame"><path d="M35 83Q33 43 78 39L1097 24Q1153 24 1158 77L1180 602Q1182 652 1133 659L91 688Q37 688 34 636Z"/></clipPath>
    <pattern id="hp429-grain" width="41" height="37" patternUnits="userSpaceOnUse"><path d="M4 6h1m15 11h1m13-9h.7M9 29h1m26 3h.8" stroke="#5e472e" stroke-opacity=".11" stroke-width="1"/><path d="M8 11l3-1m13 16 3-1m-4-23 2-1" stroke="#fff8e5" stroke-opacity=".22" stroke-width=".7"/></pattern>
    <g id="hp429-pine"><path d="M0-130-37-66-25-68-50-22-29-28-62 27H58L29-26 49-20 22-68 35-63Z" fill="currentColor"/><path d="M0-130V27H58L29-26 49-20 22-68 35-63Z" fill="#fff8e0" opacity=".09"/><path d="M-3 20h7v29h-7Z" fill="currentColor"/></g>
    <g id="hp429-leaf"><path d="M0 0C-35-5-47-29-31-48-5-45 8-21 0 0Z" fill="currentColor"/><path d="M0 0-28-40" stroke="#f8e7ba" stroke-width="1.1" opacity=".5"/></g>
    <g id="hp429-parcel"><path d="M-29-45 14-51 32-39-12-32Z" fill="var(--parcel-top,#e7c38b)"/><path d="M-29-45-12-32-12 9-29-5Z" fill="var(--parcel-side,#b58b5e)"/><path d="M-12-32 32-39 32 2-12 9Z" fill="var(--parcel-front,#cea36e)"/><path d="m-10-48 8-1 17 12-8 1Z" fill="#f7dfad"/><path d="M7-36 15-37V4L7 5Z" fill="var(--parcel-tape,#eed29f)"/><path d="m-8-29 12-2m14-2 10-2M-9 5 16 1" fill="none" stroke="#f1d09a" stroke-width="1" opacity=".65"/><path d="M-3-23 19-26 19-13-3-10Z" fill="#f3e4bf"/><path d="m0-20 8 4 8-7" fill="none" stroke="#b39c75" stroke-width="1.3" stroke-linejoin="round"/><path d="m23-7 4-.6m-4 3 4-.6" stroke="#a97e52" stroke-width="1"/></g>
  </defs>

  <path d="M46 97Q42 57 89 53L1108 38Q1165 37 1169 91L1188 616Q1190 665 1142 672L99 701Q46 701 44 649Z" fill="var(--hp-paper-shadow)"/>
  <g clip-path="url(#hp429-frame)">
    <path d="M-200-400H1650V1200H-200Z" fill="url(#hp429-sky)"/>
    <g data-part="camera">
      <circle cx="218" cy="158" r="44" fill="var(--hp-sun)"/>
      <path d="M-300 344 39 222 232 282 380 234 555 309 725 249 974 326 1160 252 1500 331V1000H-300Z" fill="var(--hp-mountain-far)"/>
      <path d="m39 222 193 60-84-12-73-20-100 60Z" fill="var(--hp-mountain-fold)"/>
      <path d="M-300 411 139 335 295 377 471 311 674 368 904 342 1198 391 1500 332V1000H-300Z" fill="var(--hp-mountain-near)"/>
      <g color="var(--hp-pine)" opacity=".6"><use href="#hp429-pine" transform="translate(1127 448) scale(.65)"/><use href="#hp429-pine" transform="translate(1206 439) scale(.92)"/><use href="#hp429-pine" transform="translate(48 463) scale(.48)"/></g>
      <path d="M-300 514Q112 418 364 470T933 463Q1190 436 1600 481V1100H-300Z" fill="var(--hp-ground-back)"/>
      <path d="M-300 579Q84 475 335 514T954 505Q1266 481 1600 539V1100H-300Z" fill="var(--hp-ground)"/>
      <path d="M-300 645Q143 551 434 567T1120 551L1600 617V765H-300Z" fill="var(--hp-path-edge)"/>
      <path d="M-300 624Q143 538 434 553T1120 538L1600 602V742H-300Z" fill="var(--hp-path)"/>
      <path d="M-70 640Q103 603 292 603m-67 35 75-4m790 15 120 5m-196-24 71 4m-632 51 145-3" stroke="var(--hp-path-light)" stroke-width="2" fill="none" opacity=".6"/>
      <!-- Small fence and a complete tree, both behind the running lane. -->
      <g fill="#b09c73"><path d="m98 412 9-10 10 10 1 73-17 4Zm79-11 8-9 10 10 1 72-17 3Zm83-3 9-9 10 10-1 68-17 2Z"/><path d="m89 425 202-16v11L89 439Zm3 32 199-16v10L92 470Z"/></g>
      <g filter="url(#hp429-paper)">
        <path d="m154 241 40-4 6 99 38-37 15 8-51 58-4 111-48 4 18-39 4-79-34-36-32-12 4-16 43 17 17 18Z" fill="#aa8059"/>
        <path d="m175 247 19-10 6 99 38-37 15 8-51 58-4 111-22 2 11-47-3-94Z" fill="#896c4d"/>
        <path d="m172 366 3 55m-8 25-7 23m31-128 27-26" stroke="#dfbd86" stroke-width="1.5" fill="none" opacity=".6"/>
        <path d="m63 211 43-66 91-15 74 48 16 77-55 53-120-12-53-40Z" fill="var(--hp-leaf-dark)"/>
        <path d="m63 211 43-66 91-15-27 88-58 78-53-40Z" fill="var(--hp-leaf-mid)"/>
        <path d="m197 130 74 48 16 77-117-37Z" fill="var(--hp-leaf-light)"/>
        <path d="m94 243 54-56 77 19 53 50-21 61-91 13-72-31Z" fill="var(--hp-leaf-mid)"/>
        <path d="m148 187 18 72 91 58 21-61-53-50Z" fill="var(--hp-leaf-light)"/>
        <path d="m94 243 72 16 91 58-91 13-72-31Z" fill="var(--hp-leaf-fold)"/>
        <path d="m106 145 64 73m-22-31 18 72 91 58" fill="none" stroke="#f7e5ae" stroke-width="1.3" opacity=".38"/>
      </g>

      <!-- Falling deliveries start above the frame; the pile hides their far-side landing. -->
      <g data-part="sky-parcels"></g>
      <g data-part="pile-back"><g data-part="pile-shadow" fill="#6b6550">
  <ellipse cx="674" cy="623" rx="384" ry="30" opacity=".10"/>
  <ellipse cx="674" cy="619" rx="333" ry="20" opacity=".07"/>
</g>
<g data-part="pile-back-boxes">
<g data-pile-rock="0" data-surface-x="688.835" data-surface-y="107.744"><use data-pile-box="98" href="#hp429-parcel" transform="translate(691 162) rotate(-4) scale(1.30)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/></g>
<use data-pile-box="99" href="#hp429-parcel" transform="translate(737 173) rotate(6) scale(1.15)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="95" href="#hp429-parcel" transform="translate(704 182) rotate(7) scale(1.05)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="97" href="#hp429-parcel" transform="translate(785 193) rotate(8) scale(1.08)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="94" href="#hp429-parcel" transform="translate(655 195) rotate(-6) scale(1.12)" style="--parcel-top:#bac5a4;--parcel-side:#7f9279;--parcel-front:#a2b28f;--parcel-tape:#d4d9bb"/>
<use data-pile-box="96" href="#hp429-parcel" transform="translate(751 198) rotate(-4) scale(1.21)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="90" href="#hp429-parcel" transform="translate(669 221) rotate(-5) scale(1.04)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="92" href="#hp429-parcel" transform="translate(767 225) rotate(-8) scale(1.10)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="89" href="#hp429-parcel" transform="translate(621 236) rotate(6) scale(1.12)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="93" href="#hp429-parcel" transform="translate(798 238) rotate(4) scale(1.12)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="91" href="#hp429-parcel" transform="translate(718 241) rotate(7) scale(1.30)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="84" href="#hp429-parcel" transform="translate(636 264) rotate(5) scale(1.02)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="86" href="#hp429-parcel" transform="translate(739 268) rotate(8) scale(1.15)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<g data-pile-rock="2" data-surface-x="849.133" data-surface-y="234.654"><use data-pile-box="88" href="#hp429-parcel" transform="translate(819 272) rotate(9) scale(1.04)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/></g>
<g data-pile-rock="1" data-surface-x="578.614" data-surface-y="229.586"><use data-pile-box="83" href="#hp429-parcel" transform="translate(583 277) rotate(-7) scale(1.14)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/></g>
<use data-pile-box="87" href="#hp429-parcel" transform="translate(791 280) rotate(-6) scale(1.27)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="85" href="#hp429-parcel" transform="translate(687 281) rotate(-4) scale(1.31)" style="--parcel-top:#b9c4c3;--parcel-side:#80918f;--parcel-front:#a0b1ad;--parcel-tape:#d7dace"/>
<use data-pile-box="77" href="#hp429-parcel" transform="translate(601 305) rotate(-5) scale(1.03)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="81" href="#hp429-parcel" transform="translate(805 308) rotate(7) scale(1.05)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="79" href="#hp429-parcel" transform="translate(703 310) rotate(-8) scale(1.13)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="76" href="#hp429-parcel" transform="translate(550 320) rotate(7) scale(1.15)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="82" href="#hp429-parcel" transform="translate(842 323) rotate(-6) scale(1.13)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="78" href="#hp429-parcel" transform="translate(652 326) rotate(6) scale(1.32)" style="--parcel-top:#bac5a4;--parcel-side:#7f9279;--parcel-front:#a2b28f;--parcel-tape:#d4d9bb"/>
<use data-pile-box="80" href="#hp429-parcel" transform="translate(754 328) rotate(4) scale(1.30)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="69" href="#hp429-parcel" transform="translate(568 345) rotate(7) scale(1.02)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="73" href="#hp429-parcel" transform="translate(778 347) rotate(5) scale(1.06)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="71" href="#hp429-parcel" transform="translate(673 351) rotate(9) scale(1.14)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="75" href="#hp429-parcel" transform="translate(863 357) rotate(6) scale(1.07)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="68" href="#hp429-parcel" transform="translate(516 360) rotate(-6) scale(1.16)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="74" href="#hp429-parcel" transform="translate(830 362) rotate(-8) scale(1.24)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="70" href="#hp429-parcel" transform="translate(620 364) rotate(-4) scale(1.32)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="72" href="#hp429-parcel" transform="translate(727 365) rotate(-7) scale(1.30)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="64" href="#hp429-parcel" transform="translate(747 390) rotate(7) scale(1.06)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="60" href="#hp429-parcel" transform="translate(537 391) rotate(-5) scale(1.04)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="62" href="#hp429-parcel" transform="translate(644 395) rotate(-8) scale(1.12)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="66" href="#hp429-parcel" transform="translate(848 398) rotate(5) scale(1.11)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<g data-pile-rock="3" data-surface-x="466.976" data-surface-y="354.405"><use data-pile-box="59" href="#hp429-parcel" transform="translate(480 404) rotate(8) scale(1.10)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/></g>
<use data-pile-box="63" href="#hp429-parcel" transform="translate(697 407) rotate(4) scale(1.29)" style="--parcel-top:#bac5a4;--parcel-side:#7f9279;--parcel-front:#a2b28f;--parcel-tape:#d4d9bb"/>
<use data-pile-box="67" href="#hp429-parcel" transform="translate(886 407) rotate(-9) scale(1.09)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="61" href="#hp429-parcel" transform="translate(589 410) rotate(6) scale(1.30)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="65" href="#hp429-parcel" transform="translate(797 411) rotate(-6) scale(1.34)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="50" href="#hp429-parcel" transform="translate(504 432) rotate(6) scale(1.03)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="54" href="#hp429-parcel" transform="translate(715 434) rotate(7) scale(1.08)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="56" href="#hp429-parcel" transform="translate(817 437) rotate(5) scale(1.11)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="52" href="#hp429-parcel" transform="translate(609 438) rotate(8) scale(1.15)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<g data-pile-rock="4" data-surface-x="944.292" data-surface-y="404.218"><use data-pile-box="58" href="#hp429-parcel" transform="translate(913 443) rotate(9) scale(1.08)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/></g>
<use data-pile-box="49" href="#hp429-parcel" transform="translate(454 446) rotate(-7) scale(1.14)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="55" href="#hp429-parcel" transform="translate(767 448) rotate(-8) scale(1.27)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="51" href="#hp429-parcel" transform="translate(558 450) rotate(-4) scale(1.31)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="57" href="#hp429-parcel" transform="translate(865 451) rotate(-6) scale(1.24)" style="--parcel-top:#b9c4c3;--parcel-side:#80918f;--parcel-front:#a0b1ad;--parcel-tape:#d7dace"/>
<use data-pile-box="53" href="#hp429-parcel" transform="translate(663 452) rotate(-5) scale(1.32)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="39" href="#hp429-parcel" transform="translate(471 474) rotate(-5) scale(1.05)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="47" href="#hp429-parcel" transform="translate(887 475) rotate(5) scale(1.06)" style="--parcel-top:#bac5a4;--parcel-side:#7f9279;--parcel-front:#a2b28f;--parcel-tape:#d4d9bb"/>
<use data-pile-box="43" href="#hp429-parcel" transform="translate(680 477) rotate(9) scale(1.09)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="41" href="#hp429-parcel" transform="translate(576 479) rotate(-8) scale(1.16)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="45" href="#hp429-parcel" transform="translate(786 480) rotate(7) scale(1.15)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="38" href="#hp429-parcel" transform="translate(422 487) rotate(7) scale(1.18)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="46" href="#hp429-parcel" transform="translate(837 489) rotate(-6) scale(1.23)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="48" href="#hp429-parcel" transform="translate(937 490) rotate(-8) scale(1.10)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="40" href="#hp429-parcel" transform="translate(522 491) rotate(4) scale(1.32)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="44" href="#hp429-parcel" transform="translate(733 493) rotate(-5) scale(1.34)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="42" href="#hp429-parcel" transform="translate(627 495) rotate(6) scale(1.29)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="27" href="#hp429-parcel" transform="translate(441 514) rotate(7) scale(1.04)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="36" href="#hp429-parcel" transform="translate(882 516) rotate(-9) scale(1.08)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="33" href="#hp429-parcel" transform="translate(734 518) rotate(8) scale(1.06)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="31" href="#hp429-parcel" transform="translate(637 519) rotate(-7) scale(1.10)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="29" href="#hp429-parcel" transform="translate(538 521) rotate(4) scale(1.17)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="35" href="#hp429-parcel" transform="translate(832 525) rotate(7) scale(1.21)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="26" href="#hp429-parcel" transform="translate(392 528) rotate(-5) scale(1.14)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="37" href="#hp429-parcel" transform="translate(933 530) rotate(5) scale(1.17)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="28" href="#hp429-parcel" transform="translate(490 531) rotate(-8) scale(1.29)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="32" href="#hp429-parcel" transform="translate(685 532) rotate(5) scale(1.28)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="30" href="#hp429-parcel" transform="translate(587 534) rotate(6) scale(1.31)" style="--parcel-top:#bac5a4;--parcel-side:#7f9279;--parcel-front:#a2b28f;--parcel-tape:#d4d9bb"/>
<use data-pile-box="34" href="#hp429-parcel" transform="translate(783 536) rotate(-4) scale(1.34)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="14" href="#hp429-parcel" transform="translate(418 557) rotate(-6) scale(1.04)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="18" href="#hp429-parcel" transform="translate(626 558) rotate(9) scale(1.08)" style="--parcel-top:#bac5a4;--parcel-side:#7f9279;--parcel-front:#a2b28f;--parcel-tape:#d4d9bb"/>
<use data-pile-box="22" href="#hp429-parcel" transform="translate(832 560) rotate(6) scale(1.10)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="20" href="#hp429-parcel" transform="translate(730 563) rotate(7) scale(1.15)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="16" href="#hp429-parcel" transform="translate(522 564) rotate(-8) scale(1.16)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="24" href="#hp429-parcel" transform="translate(935 566) rotate(4) scale(1.12)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="13" href="#hp429-parcel" transform="translate(366 568) rotate(7) scale(1.12)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="25" href="#hp429-parcel" transform="translate(988 570) rotate(-8) scale(1.08)" style="--parcel-top:#b9c4c3;--parcel-side:#80918f;--parcel-front:#a0b1ad;--parcel-tape:#d7dace"/>
<use data-pile-box="17" href="#hp429-parcel" transform="translate(574 571) rotate(4) scale(1.27)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="21" href="#hp429-parcel" transform="translate(782 572) rotate(-4) scale(1.30)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="15" href="#hp429-parcel" transform="translate(471 574) rotate(5) scale(1.31)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="23" href="#hp429-parcel" transform="translate(884 575) rotate(-7) scale(1.32)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="19" href="#hp429-parcel" transform="translate(679 576) rotate(-5) scale(1.34)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="4" href="#hp429-parcel" transform="translate(559 606) rotate(-8) scale(1.30)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="10" href="#hp429-parcel" transform="translate(894 607) rotate(-7) scale(1.32)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="5" href="#hp429-parcel" transform="translate(616 609) rotate(5) scale(1.25)" style="--parcel-top:#bac5a4;--parcel-side:#7f9279;--parcel-front:#a2b28f;--parcel-tape:#d4d9bb"/>
<use data-pile-box="11" href="#hp429-parcel" transform="translate(949 609) rotate(6) scale(1.12)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="0" href="#hp429-parcel" transform="translate(337 610) rotate(-4) scale(1.10)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
<use data-pile-box="6" href="#hp429-parcel" transform="translate(672 610) rotate(-3) scale(1.34)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="12" href="#hp429-parcel" transform="translate(1005 612) rotate(-3) scale(1.04)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
</g></g>
      <!-- The front row hides incoming workers until they emerge from the hill. -->
      <ellipse data-part="hero-shadow" cx="1060" cy="633" rx="49" ry="8" fill="#796344" opacity=".16"/>
      <g data-part="hero-box" transform="translate(1060 620) scale(1.32)"><use href="#hp429-parcel"/></g>
      <ellipse data-part="left-shadow" cx="220" cy="634" rx="43" ry="7" fill="#796344" opacity=".15"/>
      <g data-part="left-box" transform="translate(220 623) scale(1.1)"><use href="#hp429-parcel"/></g>
      <g data-part="skid-dust" fill="#f2dfb6"></g>
      <g data-part="push-workers"></g>
      <g data-part="sweat" fill="#81aab1"></g>
      <g data-part="pile-front"><g data-part="pile-front-boxes">
<use data-pile-box="1" href="#hp429-parcel" transform="translate(410 638) rotate(-2) scale(2.10)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="3" href="#hp429-parcel" transform="translate(516 638) rotate(-1) scale(2.08)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="7" href="#hp429-parcel" transform="translate(773 638) rotate(1) scale(2.10)" style="--parcel-top:#dfb17a;--parcel-side:#a77d58;--parcel-front:#c18f5e;--parcel-tape:#e8c999"/>
<use data-pile-box="9" href="#hp429-parcel" transform="translate(865 638) rotate(1) scale(2.10)" style="--parcel-top:#e6be82;--parcel-side:#ae8055;--parcel-front:#c89b62;--parcel-tape:#edd3a5"/>
<use data-pile-box="2" href="#hp429-parcel" transform="translate(464 639) rotate(2) scale(2.12)" style="--parcel-top:#edcf99;--parcel-side:#b99466;--parcel-front:#d9b77c;--parcel-tape:#f3deb1"/>
<use data-pile-box="8" href="#hp429-parcel" transform="translate(820 639) rotate(-2) scale(2.12)" style="--parcel-top:#e7c38b;--parcel-side:#b58b5e;--parcel-front:#cea36e;--parcel-tape:#eed29f"/>
</g></g>
      <g data-part="impact-dust" fill="#f2d8a6"></g>
      <g data-part="actors"><g data-actor="0" style="--ham-fur:#c89a60;--ham-light:#e3bb82;--ham-shade:#aa784c" transform="translate(-300 540)">
  <ellipse class="ham-shadow" cx="0" cy="7" rx="54" ry="7" fill="#68583e" opacity=".16"/>
<g class="hamster-shape">
  <g class="ham-foot-back">
    <path d="M-45-9Q-34-13-25-6L-20-1-12 1Q-8 4-14 7L-42 7Q-50 5-49 1Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-43-4-27-5-21 0-14 2-19 4-41 3Z" fill="#dcb58a"/>
    <path d="m-23 2 1 3m-7-3 1 3" fill="none" stroke="#9c7355" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-foot-front">
    <path d="M14-8Q23-13 31-6L33-1 45 1Q51 4 45 7H18Q10 5 11 1Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M16-4Q23-7 29-2L31 1 42 3 38 5H19L14 3Z" fill="#ebc99a"/>
    <path d="m33 3 1 3m-7-3 1 3" fill="none" stroke="#ab805b" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-bob">
    <path d="M-39-79Q-58-66-61-43L-58-20Q-52-5-32-2L-6 1Q18 1 34-12L44-36Q44-58 28-75L0-88Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M-39-79-50-56-51-32-41-12-21-3-32-2Q-52-5-58-20L-61-43Q-58-66-39-79Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-39-79Q-20-91 0-88L22-77-1-72-27-61-50-56Z" fill="var(--ham-light,#e3bb82)"/>
    <path d="M-2-68Q22-72 34-51L38-30Q33-11 16-6L-3-5Q-19-12-23-28L-20-50Z" fill="#f4ddb0"/>
    <path d="M-20-50-15-27-3-13 16-6-3-5Q-19-12-23-28Z" fill="#e7c792"/>
    <path d="m-45-36 3 9m5-16 2 6m16-28 7-3" fill="none" stroke="#f1d19e" stroke-width="1.2" stroke-linecap="round" opacity=".52"/>
    <path d="M26-65Q34-65 39-57L49-52 48-46Q37-44 31-49L23-56Z" fill="var(--ham-shade,#aa784c)"/>
    <g class="ham-head">
      <path d="M29-106Q27-119 38-122 48-125 53-116L52-103 43-97Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-108Q33-116 40-118 47-119 49-113L47-104Z" fill="#d7a68c"/>
      <path d="M-28-99Q-40-108-32-120-27-128-16-125-3-123-1-111L-7-99Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-31-112Q-30-121-22-121-12-122-7-112L-11-104-23-104Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-27-111Q-27-117-21-117-14-117-11-111L-13-105-23-106Z" fill="#d5a18a"/>
      <path d="M-21-104Q-4-118 17-112L37-105Q54-97 57-82L60-65Q57-48 41-43L12-41Q-9-41-25-52-39-60-38-76L-33-94Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-21-104Q-4-118 17-112L37-105 45-96 21-99 2-103-16-96-33-78-33-94Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-33-94-27-78-30-64-20-53-3-47 12-41Q-9-41-25-52-39-60-38-76Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-78Q45-86 53-80L58-70Q66-65 62-55L53-47 39-47 30-57Z" fill="#f0d4a4"/>
      <path d="M1-78Q14-85 25-76L36-67 44-62Q42-45 27-41L5-40Q-13-40-22-51-28-59-21-69L-12-74Z" fill="#f6e1b7"/>
      <path d="M-21-69-17-56-6-48 12-44 27-41 5-40Q-13-40-22-51-28-59-21-69Z" fill="#eacb99"/>
      <path d="M23-77Q31-82 39-77L48-72 46-66 34-62 24-66Z" fill="#f8e5c0"/>
      <path d="M42-76Q47-80 52-76L50-71Q47-68 44-72Z" fill="#9a6b5d"/>
      <path d="m44-76 5 0" fill="none" stroke="#c18d78" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M47-69 46-65Q43-62 39-64" fill="none" stroke="#ac8562" stroke-width="1.2" stroke-linecap="round"/>
      <g class="ham-eye">
        <ellipse cx="10" cy="-88" rx="3.5" ry="4.3" fill="#49382f"/>
        <circle cx="11" cy="-89.3" r="1.1" fill="#fff4d8"/>
      </g>
      <g class="ham-eye">
        <ellipse cx="40.5" cy="-88" rx="2.7" ry="3.6" fill="#49382f"/>
        <circle cx="41.2" cy="-89" r=".8" fill="#fff4d8"/>
      </g>
      <path d="m5-97 7-1m25 1 5 1" fill="none" stroke="#a4774e" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>
      <path d="m-6-64 5 1m-3-6 3 1m54 9 4-1" fill="none" stroke="#c1a179" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <path d="m-13-94 6-4m16-7 7 1" fill="none" stroke="#f6d6a2" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    </g>
    <g class="ham-cargo"><use href="#hp429-parcel" transform="translate(53 -31) scale(.92)"/></g>
    <g class="ham-paw">
      <path d="M17-57Q24-64 31-58L39-51 46-56Q51-60 55-56L58-50Q56-44 49-43L38-40Q29-40 24-45Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M19-57Q25-61 30-56L38-48 32-44 25-48Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M39-51 46-56Q51-60 55-56L58-50Q56-45 50-45L41-43 37-46Z" fill="#e8c18e"/>
      <path d="m46-52 2 4m3-5 2 3" fill="none" stroke="#b58b60" stroke-width="1" stroke-linecap="round" opacity=".75"/>
    </g>
  </g>
</g>
</g>
<g data-actor="1" style="--ham-fur:#aaa998;--ham-light:#cfceb8;--ham-shade:#868b7d" transform="translate(-300 540)">
  <ellipse class="ham-shadow" cx="0" cy="7" rx="54" ry="7" fill="#68583e" opacity=".16"/>
<g class="hamster-shape">
  <g class="ham-foot-back">
    <path d="M-45-9Q-34-13-25-6L-20-1-12 1Q-8 4-14 7L-42 7Q-50 5-49 1Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-43-4-27-5-21 0-14 2-19 4-41 3Z" fill="#dcb58a"/>
    <path d="m-23 2 1 3m-7-3 1 3" fill="none" stroke="#9c7355" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-foot-front">
    <path d="M14-8Q23-13 31-6L33-1 45 1Q51 4 45 7H18Q10 5 11 1Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M16-4Q23-7 29-2L31 1 42 3 38 5H19L14 3Z" fill="#ebc99a"/>
    <path d="m33 3 1 3m-7-3 1 3" fill="none" stroke="#ab805b" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-bob">
    <path d="M-39-79Q-58-66-61-43L-58-20Q-52-5-32-2L-6 1Q18 1 34-12L44-36Q44-58 28-75L0-88Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M-39-79-50-56-51-32-41-12-21-3-32-2Q-52-5-58-20L-61-43Q-58-66-39-79Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-39-79Q-20-91 0-88L22-77-1-72-27-61-50-56Z" fill="var(--ham-light,#e3bb82)"/>
    <path d="M-2-68Q22-72 34-51L38-30Q33-11 16-6L-3-5Q-19-12-23-28L-20-50Z" fill="#f4ddb0"/>
    <path d="M-20-50-15-27-3-13 16-6-3-5Q-19-12-23-28Z" fill="#e7c792"/>
    <path d="m-45-36 3 9m5-16 2 6m16-28 7-3" fill="none" stroke="#f1d19e" stroke-width="1.2" stroke-linecap="round" opacity=".52"/>
    <path d="M26-65Q34-65 39-57L49-52 48-46Q37-44 31-49L23-56Z" fill="var(--ham-shade,#aa784c)"/>
    <g class="ham-head">
      <path d="M29-106Q27-119 38-122 48-125 53-116L52-103 43-97Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-108Q33-116 40-118 47-119 49-113L47-104Z" fill="#d7a68c"/>
      <path d="M-28-99Q-40-108-32-120-27-128-16-125-3-123-1-111L-7-99Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-31-112Q-30-121-22-121-12-122-7-112L-11-104-23-104Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-27-111Q-27-117-21-117-14-117-11-111L-13-105-23-106Z" fill="#d5a18a"/>
      <path d="M-21-104Q-4-118 17-112L37-105Q54-97 57-82L60-65Q57-48 41-43L12-41Q-9-41-25-52-39-60-38-76L-33-94Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-21-104Q-4-118 17-112L37-105 45-96 21-99 2-103-16-96-33-78-33-94Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-33-94-27-78-30-64-20-53-3-47 12-41Q-9-41-25-52-39-60-38-76Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-78Q45-86 53-80L58-70Q66-65 62-55L53-47 39-47 30-57Z" fill="#f0d4a4"/>
      <path d="M1-78Q14-85 25-76L36-67 44-62Q42-45 27-41L5-40Q-13-40-22-51-28-59-21-69L-12-74Z" fill="#f6e1b7"/>
      <path d="M-21-69-17-56-6-48 12-44 27-41 5-40Q-13-40-22-51-28-59-21-69Z" fill="#eacb99"/>
      <path d="M23-77Q31-82 39-77L48-72 46-66 34-62 24-66Z" fill="#f8e5c0"/>
      <path d="M42-76Q47-80 52-76L50-71Q47-68 44-72Z" fill="#9a6b5d"/>
      <path d="m44-76 5 0" fill="none" stroke="#c18d78" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M47-69 46-65Q43-62 39-64" fill="none" stroke="#ac8562" stroke-width="1.2" stroke-linecap="round"/>
      <g class="ham-eye">
        <ellipse cx="10" cy="-88" rx="3.5" ry="4.3" fill="#49382f"/>
        <circle cx="11" cy="-89.3" r="1.1" fill="#fff4d8"/>
      </g>
      <g class="ham-eye">
        <ellipse cx="40.5" cy="-88" rx="2.7" ry="3.6" fill="#49382f"/>
        <circle cx="41.2" cy="-89" r=".8" fill="#fff4d8"/>
      </g>
      <path d="m5-97 7-1m25 1 5 1" fill="none" stroke="#a4774e" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>
      <path d="m-6-64 5 1m-3-6 3 1m54 9 4-1" fill="none" stroke="#c1a179" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <path d="m-13-94 6-4m16-7 7 1" fill="none" stroke="#f6d6a2" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    </g>
    <g class="ham-cargo"><use href="#hp429-parcel" transform="translate(53 -31) scale(.92)"/></g>
    <g class="ham-paw">
      <path d="M17-57Q24-64 31-58L39-51 46-56Q51-60 55-56L58-50Q56-44 49-43L38-40Q29-40 24-45Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M19-57Q25-61 30-56L38-48 32-44 25-48Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M39-51 46-56Q51-60 55-56L58-50Q56-45 50-45L41-43 37-46Z" fill="#e8c18e"/>
      <path d="m46-52 2 4m3-5 2 3" fill="none" stroke="#b58b60" stroke-width="1" stroke-linecap="round" opacity=".75"/>
    </g>
  </g>
</g>
</g>
<g data-actor="2" style="--ham-fur:#ddc799;--ham-light:#f0dfb8;--ham-shade:#b9a37b" transform="translate(-300 540)">
  <ellipse class="ham-shadow" cx="0" cy="7" rx="54" ry="7" fill="#68583e" opacity=".16"/>
<g class="hamster-shape">
  <g class="ham-foot-back">
    <path d="M-45-9Q-34-13-25-6L-20-1-12 1Q-8 4-14 7L-42 7Q-50 5-49 1Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-43-4-27-5-21 0-14 2-19 4-41 3Z" fill="#dcb58a"/>
    <path d="m-23 2 1 3m-7-3 1 3" fill="none" stroke="#9c7355" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-foot-front">
    <path d="M14-8Q23-13 31-6L33-1 45 1Q51 4 45 7H18Q10 5 11 1Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M16-4Q23-7 29-2L31 1 42 3 38 5H19L14 3Z" fill="#ebc99a"/>
    <path d="m33 3 1 3m-7-3 1 3" fill="none" stroke="#ab805b" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-bob">
    <path d="M-39-79Q-58-66-61-43L-58-20Q-52-5-32-2L-6 1Q18 1 34-12L44-36Q44-58 28-75L0-88Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M-39-79-50-56-51-32-41-12-21-3-32-2Q-52-5-58-20L-61-43Q-58-66-39-79Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-39-79Q-20-91 0-88L22-77-1-72-27-61-50-56Z" fill="var(--ham-light,#e3bb82)"/>
    <path d="M-2-68Q22-72 34-51L38-30Q33-11 16-6L-3-5Q-19-12-23-28L-20-50Z" fill="#f4ddb0"/>
    <path d="M-20-50-15-27-3-13 16-6-3-5Q-19-12-23-28Z" fill="#e7c792"/>
    <path d="m-45-36 3 9m5-16 2 6m16-28 7-3" fill="none" stroke="#f1d19e" stroke-width="1.2" stroke-linecap="round" opacity=".52"/>
    <path d="M26-65Q34-65 39-57L49-52 48-46Q37-44 31-49L23-56Z" fill="var(--ham-shade,#aa784c)"/>
    <g class="ham-head">
      <path d="M29-106Q27-119 38-122 48-125 53-116L52-103 43-97Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-108Q33-116 40-118 47-119 49-113L47-104Z" fill="#d7a68c"/>
      <path d="M-28-99Q-40-108-32-120-27-128-16-125-3-123-1-111L-7-99Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-31-112Q-30-121-22-121-12-122-7-112L-11-104-23-104Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-27-111Q-27-117-21-117-14-117-11-111L-13-105-23-106Z" fill="#d5a18a"/>
      <path d="M-21-104Q-4-118 17-112L37-105Q54-97 57-82L60-65Q57-48 41-43L12-41Q-9-41-25-52-39-60-38-76L-33-94Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-21-104Q-4-118 17-112L37-105 45-96 21-99 2-103-16-96-33-78-33-94Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-33-94-27-78-30-64-20-53-3-47 12-41Q-9-41-25-52-39-60-38-76Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-78Q45-86 53-80L58-70Q66-65 62-55L53-47 39-47 30-57Z" fill="#f0d4a4"/>
      <path d="M1-78Q14-85 25-76L36-67 44-62Q42-45 27-41L5-40Q-13-40-22-51-28-59-21-69L-12-74Z" fill="#f6e1b7"/>
      <path d="M-21-69-17-56-6-48 12-44 27-41 5-40Q-13-40-22-51-28-59-21-69Z" fill="#eacb99"/>
      <path d="M23-77Q31-82 39-77L48-72 46-66 34-62 24-66Z" fill="#f8e5c0"/>
      <path d="M42-76Q47-80 52-76L50-71Q47-68 44-72Z" fill="#9a6b5d"/>
      <path d="m44-76 5 0" fill="none" stroke="#c18d78" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M47-69 46-65Q43-62 39-64" fill="none" stroke="#ac8562" stroke-width="1.2" stroke-linecap="round"/>
      <g class="ham-eye">
        <ellipse cx="10" cy="-88" rx="3.5" ry="4.3" fill="#49382f"/>
        <circle cx="11" cy="-89.3" r="1.1" fill="#fff4d8"/>
      </g>
      <g class="ham-eye">
        <ellipse cx="40.5" cy="-88" rx="2.7" ry="3.6" fill="#49382f"/>
        <circle cx="41.2" cy="-89" r=".8" fill="#fff4d8"/>
      </g>
      <path d="m5-97 7-1m25 1 5 1" fill="none" stroke="#a4774e" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>
      <path d="m-6-64 5 1m-3-6 3 1m54 9 4-1" fill="none" stroke="#c1a179" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <path d="m-13-94 6-4m16-7 7 1" fill="none" stroke="#f6d6a2" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    </g>
    <g class="ham-cargo"><use href="#hp429-parcel" transform="translate(53 -31) scale(.92)"/></g>
    <g class="ham-paw">
      <path d="M17-57Q24-64 31-58L39-51 46-56Q51-60 55-56L58-50Q56-44 49-43L38-40Q29-40 24-45Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M19-57Q25-61 30-56L38-48 32-44 25-48Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M39-51 46-56Q51-60 55-56L58-50Q56-45 50-45L41-43 37-46Z" fill="#e8c18e"/>
      <path d="m46-52 2 4m3-5 2 3" fill="none" stroke="#b58b60" stroke-width="1" stroke-linecap="round" opacity=".75"/>
    </g>
  </g>
</g>
</g>
<g data-actor="3" style="--ham-fur:#c89a60;--ham-light:#e3bb82;--ham-shade:#aa784c" transform="translate(-300 540)">
  <ellipse class="ham-shadow" cx="0" cy="7" rx="54" ry="7" fill="#68583e" opacity=".16"/>
<g class="hamster-shape">
  <g class="ham-foot-back">
    <path d="M-45-9Q-34-13-25-6L-20-1-12 1Q-8 4-14 7L-42 7Q-50 5-49 1Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-43-4-27-5-21 0-14 2-19 4-41 3Z" fill="#dcb58a"/>
    <path d="m-23 2 1 3m-7-3 1 3" fill="none" stroke="#9c7355" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-foot-front">
    <path d="M14-8Q23-13 31-6L33-1 45 1Q51 4 45 7H18Q10 5 11 1Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M16-4Q23-7 29-2L31 1 42 3 38 5H19L14 3Z" fill="#ebc99a"/>
    <path d="m33 3 1 3m-7-3 1 3" fill="none" stroke="#ab805b" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-bob">
    <path d="M-39-79Q-58-66-61-43L-58-20Q-52-5-32-2L-6 1Q18 1 34-12L44-36Q44-58 28-75L0-88Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M-39-79-50-56-51-32-41-12-21-3-32-2Q-52-5-58-20L-61-43Q-58-66-39-79Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-39-79Q-20-91 0-88L22-77-1-72-27-61-50-56Z" fill="var(--ham-light,#e3bb82)"/>
    <path d="M-2-68Q22-72 34-51L38-30Q33-11 16-6L-3-5Q-19-12-23-28L-20-50Z" fill="#f4ddb0"/>
    <path d="M-20-50-15-27-3-13 16-6-3-5Q-19-12-23-28Z" fill="#e7c792"/>
    <path d="m-45-36 3 9m5-16 2 6m16-28 7-3" fill="none" stroke="#f1d19e" stroke-width="1.2" stroke-linecap="round" opacity=".52"/>
    <path d="M26-65Q34-65 39-57L49-52 48-46Q37-44 31-49L23-56Z" fill="var(--ham-shade,#aa784c)"/>
    <g class="ham-head">
      <path d="M29-106Q27-119 38-122 48-125 53-116L52-103 43-97Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-108Q33-116 40-118 47-119 49-113L47-104Z" fill="#d7a68c"/>
      <path d="M-28-99Q-40-108-32-120-27-128-16-125-3-123-1-111L-7-99Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-31-112Q-30-121-22-121-12-122-7-112L-11-104-23-104Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-27-111Q-27-117-21-117-14-117-11-111L-13-105-23-106Z" fill="#d5a18a"/>
      <path d="M-21-104Q-4-118 17-112L37-105Q54-97 57-82L60-65Q57-48 41-43L12-41Q-9-41-25-52-39-60-38-76L-33-94Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-21-104Q-4-118 17-112L37-105 45-96 21-99 2-103-16-96-33-78-33-94Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-33-94-27-78-30-64-20-53-3-47 12-41Q-9-41-25-52-39-60-38-76Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-78Q45-86 53-80L58-70Q66-65 62-55L53-47 39-47 30-57Z" fill="#f0d4a4"/>
      <path d="M1-78Q14-85 25-76L36-67 44-62Q42-45 27-41L5-40Q-13-40-22-51-28-59-21-69L-12-74Z" fill="#f6e1b7"/>
      <path d="M-21-69-17-56-6-48 12-44 27-41 5-40Q-13-40-22-51-28-59-21-69Z" fill="#eacb99"/>
      <path d="M23-77Q31-82 39-77L48-72 46-66 34-62 24-66Z" fill="#f8e5c0"/>
      <path d="M42-76Q47-80 52-76L50-71Q47-68 44-72Z" fill="#9a6b5d"/>
      <path d="m44-76 5 0" fill="none" stroke="#c18d78" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M47-69 46-65Q43-62 39-64" fill="none" stroke="#ac8562" stroke-width="1.2" stroke-linecap="round"/>
      <g class="ham-eye">
        <ellipse cx="10" cy="-88" rx="3.5" ry="4.3" fill="#49382f"/>
        <circle cx="11" cy="-89.3" r="1.1" fill="#fff4d8"/>
      </g>
      <g class="ham-eye">
        <ellipse cx="40.5" cy="-88" rx="2.7" ry="3.6" fill="#49382f"/>
        <circle cx="41.2" cy="-89" r=".8" fill="#fff4d8"/>
      </g>
      <path d="m5-97 7-1m25 1 5 1" fill="none" stroke="#a4774e" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>
      <path d="m-6-64 5 1m-3-6 3 1m54 9 4-1" fill="none" stroke="#c1a179" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <path d="m-13-94 6-4m16-7 7 1" fill="none" stroke="#f6d6a2" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    </g>
    <g class="ham-cargo"><use href="#hp429-parcel" transform="translate(53 -31) scale(.92)"/></g>
    <g class="ham-paw">
      <path d="M17-57Q24-64 31-58L39-51 46-56Q51-60 55-56L58-50Q56-44 49-43L38-40Q29-40 24-45Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M19-57Q25-61 30-56L38-48 32-44 25-48Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M39-51 46-56Q51-60 55-56L58-50Q56-45 50-45L41-43 37-46Z" fill="#e8c18e"/>
      <path d="m46-52 2 4m3-5 2 3" fill="none" stroke="#b58b60" stroke-width="1" stroke-linecap="round" opacity=".75"/>
    </g>
  </g>
</g>
</g>
<g data-actor="4" style="--ham-fur:#aaa998;--ham-light:#cfceb8;--ham-shade:#868b7d" transform="translate(-300 540)">
  <ellipse class="ham-shadow" cx="0" cy="7" rx="54" ry="7" fill="#68583e" opacity=".16"/>
<g class="hamster-shape">
  <g class="ham-foot-back">
    <path d="M-45-9Q-34-13-25-6L-20-1-12 1Q-8 4-14 7L-42 7Q-50 5-49 1Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-43-4-27-5-21 0-14 2-19 4-41 3Z" fill="#dcb58a"/>
    <path d="m-23 2 1 3m-7-3 1 3" fill="none" stroke="#9c7355" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-foot-front">
    <path d="M14-8Q23-13 31-6L33-1 45 1Q51 4 45 7H18Q10 5 11 1Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M16-4Q23-7 29-2L31 1 42 3 38 5H19L14 3Z" fill="#ebc99a"/>
    <path d="m33 3 1 3m-7-3 1 3" fill="none" stroke="#ab805b" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-bob">
    <path d="M-39-79Q-58-66-61-43L-58-20Q-52-5-32-2L-6 1Q18 1 34-12L44-36Q44-58 28-75L0-88Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M-39-79-50-56-51-32-41-12-21-3-32-2Q-52-5-58-20L-61-43Q-58-66-39-79Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-39-79Q-20-91 0-88L22-77-1-72-27-61-50-56Z" fill="var(--ham-light,#e3bb82)"/>
    <path d="M-2-68Q22-72 34-51L38-30Q33-11 16-6L-3-5Q-19-12-23-28L-20-50Z" fill="#f4ddb0"/>
    <path d="M-20-50-15-27-3-13 16-6-3-5Q-19-12-23-28Z" fill="#e7c792"/>
    <path d="m-45-36 3 9m5-16 2 6m16-28 7-3" fill="none" stroke="#f1d19e" stroke-width="1.2" stroke-linecap="round" opacity=".52"/>
    <path d="M26-65Q34-65 39-57L49-52 48-46Q37-44 31-49L23-56Z" fill="var(--ham-shade,#aa784c)"/>
    <g class="ham-head">
      <path d="M29-106Q27-119 38-122 48-125 53-116L52-103 43-97Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-108Q33-116 40-118 47-119 49-113L47-104Z" fill="#d7a68c"/>
      <path d="M-28-99Q-40-108-32-120-27-128-16-125-3-123-1-111L-7-99Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-31-112Q-30-121-22-121-12-122-7-112L-11-104-23-104Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-27-111Q-27-117-21-117-14-117-11-111L-13-105-23-106Z" fill="#d5a18a"/>
      <path d="M-21-104Q-4-118 17-112L37-105Q54-97 57-82L60-65Q57-48 41-43L12-41Q-9-41-25-52-39-60-38-76L-33-94Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-21-104Q-4-118 17-112L37-105 45-96 21-99 2-103-16-96-33-78-33-94Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-33-94-27-78-30-64-20-53-3-47 12-41Q-9-41-25-52-39-60-38-76Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-78Q45-86 53-80L58-70Q66-65 62-55L53-47 39-47 30-57Z" fill="#f0d4a4"/>
      <path d="M1-78Q14-85 25-76L36-67 44-62Q42-45 27-41L5-40Q-13-40-22-51-28-59-21-69L-12-74Z" fill="#f6e1b7"/>
      <path d="M-21-69-17-56-6-48 12-44 27-41 5-40Q-13-40-22-51-28-59-21-69Z" fill="#eacb99"/>
      <path d="M23-77Q31-82 39-77L48-72 46-66 34-62 24-66Z" fill="#f8e5c0"/>
      <path d="M42-76Q47-80 52-76L50-71Q47-68 44-72Z" fill="#9a6b5d"/>
      <path d="m44-76 5 0" fill="none" stroke="#c18d78" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M47-69 46-65Q43-62 39-64" fill="none" stroke="#ac8562" stroke-width="1.2" stroke-linecap="round"/>
      <g class="ham-eye">
        <ellipse cx="10" cy="-88" rx="3.5" ry="4.3" fill="#49382f"/>
        <circle cx="11" cy="-89.3" r="1.1" fill="#fff4d8"/>
      </g>
      <g class="ham-eye">
        <ellipse cx="40.5" cy="-88" rx="2.7" ry="3.6" fill="#49382f"/>
        <circle cx="41.2" cy="-89" r=".8" fill="#fff4d8"/>
      </g>
      <path d="m5-97 7-1m25 1 5 1" fill="none" stroke="#a4774e" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>
      <path d="m-6-64 5 1m-3-6 3 1m54 9 4-1" fill="none" stroke="#c1a179" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <path d="m-13-94 6-4m16-7 7 1" fill="none" stroke="#f6d6a2" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    </g>
    <g class="ham-cargo"><use href="#hp429-parcel" transform="translate(53 -31) scale(.92)"/></g>
    <g class="ham-paw">
      <path d="M17-57Q24-64 31-58L39-51 46-56Q51-60 55-56L58-50Q56-44 49-43L38-40Q29-40 24-45Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M19-57Q25-61 30-56L38-48 32-44 25-48Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M39-51 46-56Q51-60 55-56L58-50Q56-45 50-45L41-43 37-46Z" fill="#e8c18e"/>
      <path d="m46-52 2 4m3-5 2 3" fill="none" stroke="#b58b60" stroke-width="1" stroke-linecap="round" opacity=".75"/>
    </g>
  </g>
</g>
</g>
<g data-actor="5" style="--ham-fur:#ddc799;--ham-light:#f0dfb8;--ham-shade:#b9a37b" transform="translate(-300 540)">
  <ellipse class="ham-shadow" cx="0" cy="7" rx="54" ry="7" fill="#68583e" opacity=".16"/>
<g class="hamster-shape">
  <g class="ham-foot-back">
    <path d="M-45-9Q-34-13-25-6L-20-1-12 1Q-8 4-14 7L-42 7Q-50 5-49 1Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-43-4-27-5-21 0-14 2-19 4-41 3Z" fill="#dcb58a"/>
    <path d="m-23 2 1 3m-7-3 1 3" fill="none" stroke="#9c7355" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-foot-front">
    <path d="M14-8Q23-13 31-6L33-1 45 1Q51 4 45 7H18Q10 5 11 1Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M16-4Q23-7 29-2L31 1 42 3 38 5H19L14 3Z" fill="#ebc99a"/>
    <path d="m33 3 1 3m-7-3 1 3" fill="none" stroke="#ab805b" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-bob">
    <path d="M-39-79Q-58-66-61-43L-58-20Q-52-5-32-2L-6 1Q18 1 34-12L44-36Q44-58 28-75L0-88Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M-39-79-50-56-51-32-41-12-21-3-32-2Q-52-5-58-20L-61-43Q-58-66-39-79Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-39-79Q-20-91 0-88L22-77-1-72-27-61-50-56Z" fill="var(--ham-light,#e3bb82)"/>
    <path d="M-2-68Q22-72 34-51L38-30Q33-11 16-6L-3-5Q-19-12-23-28L-20-50Z" fill="#f4ddb0"/>
    <path d="M-20-50-15-27-3-13 16-6-3-5Q-19-12-23-28Z" fill="#e7c792"/>
    <path d="m-45-36 3 9m5-16 2 6m16-28 7-3" fill="none" stroke="#f1d19e" stroke-width="1.2" stroke-linecap="round" opacity=".52"/>
    <path d="M26-65Q34-65 39-57L49-52 48-46Q37-44 31-49L23-56Z" fill="var(--ham-shade,#aa784c)"/>
    <g class="ham-head">
      <path d="M29-106Q27-119 38-122 48-125 53-116L52-103 43-97Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-108Q33-116 40-118 47-119 49-113L47-104Z" fill="#d7a68c"/>
      <path d="M-28-99Q-40-108-32-120-27-128-16-125-3-123-1-111L-7-99Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-31-112Q-30-121-22-121-12-122-7-112L-11-104-23-104Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-27-111Q-27-117-21-117-14-117-11-111L-13-105-23-106Z" fill="#d5a18a"/>
      <path d="M-21-104Q-4-118 17-112L37-105Q54-97 57-82L60-65Q57-48 41-43L12-41Q-9-41-25-52-39-60-38-76L-33-94Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-21-104Q-4-118 17-112L37-105 45-96 21-99 2-103-16-96-33-78-33-94Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-33-94-27-78-30-64-20-53-3-47 12-41Q-9-41-25-52-39-60-38-76Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-78Q45-86 53-80L58-70Q66-65 62-55L53-47 39-47 30-57Z" fill="#f0d4a4"/>
      <path d="M1-78Q14-85 25-76L36-67 44-62Q42-45 27-41L5-40Q-13-40-22-51-28-59-21-69L-12-74Z" fill="#f6e1b7"/>
      <path d="M-21-69-17-56-6-48 12-44 27-41 5-40Q-13-40-22-51-28-59-21-69Z" fill="#eacb99"/>
      <path d="M23-77Q31-82 39-77L48-72 46-66 34-62 24-66Z" fill="#f8e5c0"/>
      <path d="M42-76Q47-80 52-76L50-71Q47-68 44-72Z" fill="#9a6b5d"/>
      <path d="m44-76 5 0" fill="none" stroke="#c18d78" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M47-69 46-65Q43-62 39-64" fill="none" stroke="#ac8562" stroke-width="1.2" stroke-linecap="round"/>
      <g class="ham-eye">
        <ellipse cx="10" cy="-88" rx="3.5" ry="4.3" fill="#49382f"/>
        <circle cx="11" cy="-89.3" r="1.1" fill="#fff4d8"/>
      </g>
      <g class="ham-eye">
        <ellipse cx="40.5" cy="-88" rx="2.7" ry="3.6" fill="#49382f"/>
        <circle cx="41.2" cy="-89" r=".8" fill="#fff4d8"/>
      </g>
      <path d="m5-97 7-1m25 1 5 1" fill="none" stroke="#a4774e" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>
      <path d="m-6-64 5 1m-3-6 3 1m54 9 4-1" fill="none" stroke="#c1a179" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <path d="m-13-94 6-4m16-7 7 1" fill="none" stroke="#f6d6a2" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    </g>
    <g class="ham-cargo"><use href="#hp429-parcel" transform="translate(53 -31) scale(.92)"/></g>
    <g class="ham-paw">
      <path d="M17-57Q24-64 31-58L39-51 46-56Q51-60 55-56L58-50Q56-44 49-43L38-40Q29-40 24-45Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M19-57Q25-61 30-56L38-48 32-44 25-48Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M39-51 46-56Q51-60 55-56L58-50Q56-45 50-45L41-43 37-46Z" fill="#e8c18e"/>
      <path d="m46-52 2 4m3-5 2 3" fill="none" stroke="#b58b60" stroke-width="1" stroke-linecap="round" opacity=".75"/>
    </g>
  </g>
</g>
</g>
<g data-actor="6" style="--ham-fur:#c89a60;--ham-light:#e3bb82;--ham-shade:#aa784c" transform="translate(-300 540)">
  <ellipse class="ham-shadow" cx="0" cy="7" rx="54" ry="7" fill="#68583e" opacity=".16"/>
<g class="hamster-shape">
  <g class="ham-foot-back">
    <path d="M-45-9Q-34-13-25-6L-20-1-12 1Q-8 4-14 7L-42 7Q-50 5-49 1Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-43-4-27-5-21 0-14 2-19 4-41 3Z" fill="#dcb58a"/>
    <path d="m-23 2 1 3m-7-3 1 3" fill="none" stroke="#9c7355" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-foot-front">
    <path d="M14-8Q23-13 31-6L33-1 45 1Q51 4 45 7H18Q10 5 11 1Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M16-4Q23-7 29-2L31 1 42 3 38 5H19L14 3Z" fill="#ebc99a"/>
    <path d="m33 3 1 3m-7-3 1 3" fill="none" stroke="#ab805b" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-bob">
    <path d="M-39-79Q-58-66-61-43L-58-20Q-52-5-32-2L-6 1Q18 1 34-12L44-36Q44-58 28-75L0-88Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M-39-79-50-56-51-32-41-12-21-3-32-2Q-52-5-58-20L-61-43Q-58-66-39-79Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-39-79Q-20-91 0-88L22-77-1-72-27-61-50-56Z" fill="var(--ham-light,#e3bb82)"/>
    <path d="M-2-68Q22-72 34-51L38-30Q33-11 16-6L-3-5Q-19-12-23-28L-20-50Z" fill="#f4ddb0"/>
    <path d="M-20-50-15-27-3-13 16-6-3-5Q-19-12-23-28Z" fill="#e7c792"/>
    <path d="m-45-36 3 9m5-16 2 6m16-28 7-3" fill="none" stroke="#f1d19e" stroke-width="1.2" stroke-linecap="round" opacity=".52"/>
    <path d="M26-65Q34-65 39-57L49-52 48-46Q37-44 31-49L23-56Z" fill="var(--ham-shade,#aa784c)"/>
    <g class="ham-head">
      <path d="M29-106Q27-119 38-122 48-125 53-116L52-103 43-97Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-108Q33-116 40-118 47-119 49-113L47-104Z" fill="#d7a68c"/>
      <path d="M-28-99Q-40-108-32-120-27-128-16-125-3-123-1-111L-7-99Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-31-112Q-30-121-22-121-12-122-7-112L-11-104-23-104Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-27-111Q-27-117-21-117-14-117-11-111L-13-105-23-106Z" fill="#d5a18a"/>
      <path d="M-21-104Q-4-118 17-112L37-105Q54-97 57-82L60-65Q57-48 41-43L12-41Q-9-41-25-52-39-60-38-76L-33-94Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-21-104Q-4-118 17-112L37-105 45-96 21-99 2-103-16-96-33-78-33-94Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-33-94-27-78-30-64-20-53-3-47 12-41Q-9-41-25-52-39-60-38-76Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-78Q45-86 53-80L58-70Q66-65 62-55L53-47 39-47 30-57Z" fill="#f0d4a4"/>
      <path d="M1-78Q14-85 25-76L36-67 44-62Q42-45 27-41L5-40Q-13-40-22-51-28-59-21-69L-12-74Z" fill="#f6e1b7"/>
      <path d="M-21-69-17-56-6-48 12-44 27-41 5-40Q-13-40-22-51-28-59-21-69Z" fill="#eacb99"/>
      <path d="M23-77Q31-82 39-77L48-72 46-66 34-62 24-66Z" fill="#f8e5c0"/>
      <path d="M42-76Q47-80 52-76L50-71Q47-68 44-72Z" fill="#9a6b5d"/>
      <path d="m44-76 5 0" fill="none" stroke="#c18d78" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M47-69 46-65Q43-62 39-64" fill="none" stroke="#ac8562" stroke-width="1.2" stroke-linecap="round"/>
      <g class="ham-eye">
        <ellipse cx="10" cy="-88" rx="3.5" ry="4.3" fill="#49382f"/>
        <circle cx="11" cy="-89.3" r="1.1" fill="#fff4d8"/>
      </g>
      <g class="ham-eye">
        <ellipse cx="40.5" cy="-88" rx="2.7" ry="3.6" fill="#49382f"/>
        <circle cx="41.2" cy="-89" r=".8" fill="#fff4d8"/>
      </g>
      <path d="m5-97 7-1m25 1 5 1" fill="none" stroke="#a4774e" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>
      <path d="m-6-64 5 1m-3-6 3 1m54 9 4-1" fill="none" stroke="#c1a179" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <path d="m-13-94 6-4m16-7 7 1" fill="none" stroke="#f6d6a2" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    </g>
    <g class="ham-cargo"><use href="#hp429-parcel" transform="translate(53 -31) scale(.92)"/></g>
    <g class="ham-paw">
      <path d="M17-57Q24-64 31-58L39-51 46-56Q51-60 55-56L58-50Q56-44 49-43L38-40Q29-40 24-45Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M19-57Q25-61 30-56L38-48 32-44 25-48Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M39-51 46-56Q51-60 55-56L58-50Q56-45 50-45L41-43 37-46Z" fill="#e8c18e"/>
      <path d="m46-52 2 4m3-5 2 3" fill="none" stroke="#b58b60" stroke-width="1" stroke-linecap="round" opacity=".75"/>
    </g>
  </g>
</g>
</g>
<g data-actor="7" style="--ham-fur:#aaa998;--ham-light:#cfceb8;--ham-shade:#868b7d" transform="translate(-300 540)">
  <ellipse class="ham-shadow" cx="0" cy="7" rx="54" ry="7" fill="#68583e" opacity=".16"/>
<g class="hamster-shape">
  <g class="ham-foot-back">
    <path d="M-45-9Q-34-13-25-6L-20-1-12 1Q-8 4-14 7L-42 7Q-50 5-49 1Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-43-4-27-5-21 0-14 2-19 4-41 3Z" fill="#dcb58a"/>
    <path d="m-23 2 1 3m-7-3 1 3" fill="none" stroke="#9c7355" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-foot-front">
    <path d="M14-8Q23-13 31-6L33-1 45 1Q51 4 45 7H18Q10 5 11 1Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M16-4Q23-7 29-2L31 1 42 3 38 5H19L14 3Z" fill="#ebc99a"/>
    <path d="m33 3 1 3m-7-3 1 3" fill="none" stroke="#ab805b" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-bob">
    <path d="M-39-79Q-58-66-61-43L-58-20Q-52-5-32-2L-6 1Q18 1 34-12L44-36Q44-58 28-75L0-88Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M-39-79-50-56-51-32-41-12-21-3-32-2Q-52-5-58-20L-61-43Q-58-66-39-79Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-39-79Q-20-91 0-88L22-77-1-72-27-61-50-56Z" fill="var(--ham-light,#e3bb82)"/>
    <path d="M-2-68Q22-72 34-51L38-30Q33-11 16-6L-3-5Q-19-12-23-28L-20-50Z" fill="#f4ddb0"/>
    <path d="M-20-50-15-27-3-13 16-6-3-5Q-19-12-23-28Z" fill="#e7c792"/>
    <path d="m-45-36 3 9m5-16 2 6m16-28 7-3" fill="none" stroke="#f1d19e" stroke-width="1.2" stroke-linecap="round" opacity=".52"/>
    <path d="M26-65Q34-65 39-57L49-52 48-46Q37-44 31-49L23-56Z" fill="var(--ham-shade,#aa784c)"/>
    <g class="ham-head">
      <path d="M29-106Q27-119 38-122 48-125 53-116L52-103 43-97Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-108Q33-116 40-118 47-119 49-113L47-104Z" fill="#d7a68c"/>
      <path d="M-28-99Q-40-108-32-120-27-128-16-125-3-123-1-111L-7-99Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-31-112Q-30-121-22-121-12-122-7-112L-11-104-23-104Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-27-111Q-27-117-21-117-14-117-11-111L-13-105-23-106Z" fill="#d5a18a"/>
      <path d="M-21-104Q-4-118 17-112L37-105Q54-97 57-82L60-65Q57-48 41-43L12-41Q-9-41-25-52-39-60-38-76L-33-94Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-21-104Q-4-118 17-112L37-105 45-96 21-99 2-103-16-96-33-78-33-94Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-33-94-27-78-30-64-20-53-3-47 12-41Q-9-41-25-52-39-60-38-76Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-78Q45-86 53-80L58-70Q66-65 62-55L53-47 39-47 30-57Z" fill="#f0d4a4"/>
      <path d="M1-78Q14-85 25-76L36-67 44-62Q42-45 27-41L5-40Q-13-40-22-51-28-59-21-69L-12-74Z" fill="#f6e1b7"/>
      <path d="M-21-69-17-56-6-48 12-44 27-41 5-40Q-13-40-22-51-28-59-21-69Z" fill="#eacb99"/>
      <path d="M23-77Q31-82 39-77L48-72 46-66 34-62 24-66Z" fill="#f8e5c0"/>
      <path d="M42-76Q47-80 52-76L50-71Q47-68 44-72Z" fill="#9a6b5d"/>
      <path d="m44-76 5 0" fill="none" stroke="#c18d78" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M47-69 46-65Q43-62 39-64" fill="none" stroke="#ac8562" stroke-width="1.2" stroke-linecap="round"/>
      <g class="ham-eye">
        <ellipse cx="10" cy="-88" rx="3.5" ry="4.3" fill="#49382f"/>
        <circle cx="11" cy="-89.3" r="1.1" fill="#fff4d8"/>
      </g>
      <g class="ham-eye">
        <ellipse cx="40.5" cy="-88" rx="2.7" ry="3.6" fill="#49382f"/>
        <circle cx="41.2" cy="-89" r=".8" fill="#fff4d8"/>
      </g>
      <path d="m5-97 7-1m25 1 5 1" fill="none" stroke="#a4774e" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>
      <path d="m-6-64 5 1m-3-6 3 1m54 9 4-1" fill="none" stroke="#c1a179" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <path d="m-13-94 6-4m16-7 7 1" fill="none" stroke="#f6d6a2" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    </g>
    <g class="ham-cargo"><use href="#hp429-parcel" transform="translate(53 -31) scale(.92)"/></g>
    <g class="ham-paw">
      <path d="M17-57Q24-64 31-58L39-51 46-56Q51-60 55-56L58-50Q56-44 49-43L38-40Q29-40 24-45Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M19-57Q25-61 30-56L38-48 32-44 25-48Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M39-51 46-56Q51-60 55-56L58-50Q56-45 50-45L41-43 37-46Z" fill="#e8c18e"/>
      <path d="m46-52 2 4m3-5 2 3" fill="none" stroke="#b58b60" stroke-width="1" stroke-linecap="round" opacity=".75"/>
    </g>
  </g>
</g>
</g>
<g data-actor="8" style="--ham-fur:#ddc799;--ham-light:#f0dfb8;--ham-shade:#b9a37b" transform="translate(-300 540)">
  <ellipse class="ham-shadow" cx="0" cy="7" rx="54" ry="7" fill="#68583e" opacity=".16"/>
<g class="hamster-shape">
  <g class="ham-foot-back">
    <path d="M-45-9Q-34-13-25-6L-20-1-12 1Q-8 4-14 7L-42 7Q-50 5-49 1Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-43-4-27-5-21 0-14 2-19 4-41 3Z" fill="#dcb58a"/>
    <path d="m-23 2 1 3m-7-3 1 3" fill="none" stroke="#9c7355" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-foot-front">
    <path d="M14-8Q23-13 31-6L33-1 45 1Q51 4 45 7H18Q10 5 11 1Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M16-4Q23-7 29-2L31 1 42 3 38 5H19L14 3Z" fill="#ebc99a"/>
    <path d="m33 3 1 3m-7-3 1 3" fill="none" stroke="#ab805b" stroke-width="1" stroke-linecap="round" opacity=".6"/>
  </g>
  <g class="ham-bob">
    <path d="M-39-79Q-58-66-61-43L-58-20Q-52-5-32-2L-6 1Q18 1 34-12L44-36Q44-58 28-75L0-88Z" fill="var(--ham-fur,#c89a60)"/>
    <path d="M-39-79-50-56-51-32-41-12-21-3-32-2Q-52-5-58-20L-61-43Q-58-66-39-79Z" fill="var(--ham-shade,#aa784c)"/>
    <path d="M-39-79Q-20-91 0-88L22-77-1-72-27-61-50-56Z" fill="var(--ham-light,#e3bb82)"/>
    <path d="M-2-68Q22-72 34-51L38-30Q33-11 16-6L-3-5Q-19-12-23-28L-20-50Z" fill="#f4ddb0"/>
    <path d="M-20-50-15-27-3-13 16-6-3-5Q-19-12-23-28Z" fill="#e7c792"/>
    <path d="m-45-36 3 9m5-16 2 6m16-28 7-3" fill="none" stroke="#f1d19e" stroke-width="1.2" stroke-linecap="round" opacity=".52"/>
    <path d="M26-65Q34-65 39-57L49-52 48-46Q37-44 31-49L23-56Z" fill="var(--ham-shade,#aa784c)"/>
    <g class="ham-head">
      <path d="M29-106Q27-119 38-122 48-125 53-116L52-103 43-97Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-108Q33-116 40-118 47-119 49-113L47-104Z" fill="#d7a68c"/>
      <path d="M-28-99Q-40-108-32-120-27-128-16-125-3-123-1-111L-7-99Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-31-112Q-30-121-22-121-12-122-7-112L-11-104-23-104Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-27-111Q-27-117-21-117-14-117-11-111L-13-105-23-106Z" fill="#d5a18a"/>
      <path d="M-21-104Q-4-118 17-112L37-105Q54-97 57-82L60-65Q57-48 41-43L12-41Q-9-41-25-52-39-60-38-76L-33-94Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M-21-104Q-4-118 17-112L37-105 45-96 21-99 2-103-16-96-33-78-33-94Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M-33-94-27-78-30-64-20-53-3-47 12-41Q-9-41-25-52-39-60-38-76Z" fill="var(--ham-shade,#aa784c)"/>
      <path d="M35-78Q45-86 53-80L58-70Q66-65 62-55L53-47 39-47 30-57Z" fill="#f0d4a4"/>
      <path d="M1-78Q14-85 25-76L36-67 44-62Q42-45 27-41L5-40Q-13-40-22-51-28-59-21-69L-12-74Z" fill="#f6e1b7"/>
      <path d="M-21-69-17-56-6-48 12-44 27-41 5-40Q-13-40-22-51-28-59-21-69Z" fill="#eacb99"/>
      <path d="M23-77Q31-82 39-77L48-72 46-66 34-62 24-66Z" fill="#f8e5c0"/>
      <path d="M42-76Q47-80 52-76L50-71Q47-68 44-72Z" fill="#9a6b5d"/>
      <path d="m44-76 5 0" fill="none" stroke="#c18d78" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M47-69 46-65Q43-62 39-64" fill="none" stroke="#ac8562" stroke-width="1.2" stroke-linecap="round"/>
      <g class="ham-eye">
        <ellipse cx="10" cy="-88" rx="3.5" ry="4.3" fill="#49382f"/>
        <circle cx="11" cy="-89.3" r="1.1" fill="#fff4d8"/>
      </g>
      <g class="ham-eye">
        <ellipse cx="40.5" cy="-88" rx="2.7" ry="3.6" fill="#49382f"/>
        <circle cx="41.2" cy="-89" r=".8" fill="#fff4d8"/>
      </g>
      <path d="m5-97 7-1m25 1 5 1" fill="none" stroke="#a4774e" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>
      <path d="m-6-64 5 1m-3-6 3 1m54 9 4-1" fill="none" stroke="#c1a179" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      <path d="m-13-94 6-4m16-7 7 1" fill="none" stroke="#f6d6a2" stroke-width="1.15" stroke-linecap="round" opacity=".75"/>
    </g>
    <g class="ham-cargo"><use href="#hp429-parcel" transform="translate(53 -31) scale(.92)"/></g>
    <g class="ham-paw">
      <path d="M17-57Q24-64 31-58L39-51 46-56Q51-60 55-56L58-50Q56-44 49-43L38-40Q29-40 24-45Z" fill="var(--ham-fur,#c89a60)"/>
      <path d="M19-57Q25-61 30-56L38-48 32-44 25-48Z" fill="var(--ham-light,#e3bb82)"/>
      <path d="M39-51 46-56Q51-60 55-56L58-50Q56-45 50-45L41-43 37-46Z" fill="#e8c18e"/>
      <path d="m46-52 2 4m3-5 2 3" fill="none" stroke="#b58b60" stroke-width="1" stroke-linecap="round" opacity=".75"/>
    </g>
  </g>
</g>
</g></g>
      <path d="M-220 744Q-6 666 143 692L339 749 1500 740V1100H-220Z" fill="var(--hp-foreground)"/>
      <g color="var(--hp-leaf-mid)"><use href="#hp429-leaf" transform="translate(104 688) rotate(28) scale(.75)"/><use href="#hp429-leaf" transform="translate(119 698) rotate(82) scale(.64)"/></g>
      <g color="var(--hp-foreground)"><use href="#hp429-leaf" transform="translate(1142 678) rotate(-10) scale(.65)"/><use href="#hp429-leaf" transform="translate(1156 686) rotate(55) scale(.8)"/></g>
      <path d="M-300-400H1650V1200H-300Z" fill="url(#hp429-grain)" pointer-events="none"/>
    </g>
    <path d="M43 90 46 630Q46 665 91 668" stroke="#fff8df" stroke-width="2" opacity=".4" fill="none"/>
  </g>
</svg></div>
    <figcaption v-show="!reducedMotion" class="hp429-controls">
      <button type="button" class="hp429-control" data-action="replay" aria-label="重新播放动画">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1.7 7M4 4v6h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button type="button" class="hp429-control" data-action="pause" aria-label="暂停动画" aria-pressed="false">
        <svg data-icon="pause" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5v14M16 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        <svg data-icon="play" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" hidden><path d="m8 5 11 7-11 7Z" fill="currentColor"/></svg>
      </button>
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

const props = defineProps<{ theme: 'light' | 'dark'; reducedMotion: boolean }>()
const uid = `hp429-${useId()}-`
const root = ref<HTMLElement>()
let player: ReturnType<typeof mountHamster429> | undefined

onMounted(() => {
  if (root.value) player = mountHamster429(root.value, uid, props.reducedMotion)
})
watch(() => props.reducedMotion, reduced => player?.setReducedMotion(reduced))
onBeforeUnmount(() => {
  player?.destroy()
  player = undefined
})

/** A shared timeline for the worker close-up, mountain reveal and falling parcels. */
function findElement<T extends Element>(root: Element, selector: string): T {
  const element = root.querySelector<T>(selector)
  if (!element) throw new Error(`Missing hamster scene element: ${selector}`)
  return element
}

function mountHamster429(scene: HTMLElement, unique: string, reducedMotion: boolean) {
  const svg = findElement<SVGSVGElement>(scene, '.hp429-art')
  const ns = 'http://www.w3.org/2000/svg'
  const ids = new Map<string, string>()
  svg.querySelectorAll<SVGElement>('[id]').forEach(el => { const old = el.id; ids.set(old, unique + old); el.id = unique + old; });
  svg.querySelectorAll('*').forEach(el => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name === 'id') continue;
      let value = attr.value.replace(/url\(#([^)]*)\)/g, (match, id) => ids.has(id) ? 'url(#' + ids.get(id) + ')' : match);
      if ((attr.name === 'href' || attr.name === 'xlink:href') && value.startsWith('#')) value = '#' + (ids.get(value.slice(1)) || value.slice(1));
      if (attr.name === 'aria-labelledby') value = value.split(' ').map(id => ids.get(id) || id).join(' ');
      if (value !== attr.value) el.setAttribute(attr.name, value);
    }
  });
  svg.setAttribute('aria-labelledby', ['hp429-title', 'hp429-desc'].map(id => ids.get(id)).join(' '));
  const part = (name: string) => findElement<SVGElement>(svg, `[data-part="${name}"]`)
  const camera = part('camera'), sky = part('sky-parcels'), sweat = part('sweat');
  const heroBox = part('hero-box'), leftBox = part('left-box');
  const heroShadow = part('hero-shadow'), leftShadow = part('left-shadow');
  const impactDust = part('impact-dust'), skidDust = part('skid-dust');
  const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = (x: number) => { const v = clamp(x); return v * v * (3 - 2 * v); };
  const lerp = (a: number, b: number, x: number) => a + (b - a) * x, mod = (n: number, m: number) => ((n % m) + m) % m;
  const set = (el: SVGElement, transform: string) => el.setAttribute('transform', transform);
  const create = <T extends keyof SVGElementTagNameMap>(name: T, attrs: Record<string, string | number>, parent: SVGElement) => {
    const el = document.createElementNS(ns, name);
    for (const [key,value] of Object.entries(attrs)) el.setAttribute(key, String(value));
    parent.appendChild(el); return el;
  };
  const parcelRef = '#' + ids.get('hp429-parcel');
  const actors = Array.from(svg.querySelectorAll<SVGGElement>('[data-actor]')).map(el => ({
    el,
    bob: findElement<SVGGElement>(el, '.ham-bob'),
    head: findElement<SVGGElement>(el, '.ham-head'),
    front: findElement<SVGGElement>(el, '.ham-foot-front'),
    back: findElement<SVGGElement>(el, '.ham-foot-back'),
    paw: findElement<SVGElement>(el, '.ham-paw'),
    cargo: findElement<SVGGElement>(el, '.ham-cargo'),
    eyes: Array.from(el.querySelectorAll<SVGElement>('.ham-eye')),
  }))
  const pushers = actors.slice(0, 2).map(actor => {
    part('push-workers').appendChild(actor.el)
    actor.cargo.setAttribute('display', 'none')
    actor.paw.setAttribute('display', 'none')
    for (const child of actor.bob.children) {
      if (child.tagName.toLowerCase() === 'path' && child.getAttribute('d')?.startsWith('M26-65')) {
        child.setAttribute('display', 'none')
      }
    }
    // Palms stay fixed against the carton while the shoulders tremble.
    const arms = [0, 1].map(index => {
      const group = create('g', {}, actor.bob)
      actor.bob.insertBefore(group, actor.head)
      const arm = create('path', { fill: index ? 'var(--ham-fur,#c89a60)' : 'var(--ham-shade,#aa784c)' }, group)
      const hand = create('g', {}, group)
      create('path', { d: 'M-6-7Q1-12 8-6L13-3Q16 1 12 5L4 8Q-3 8-7 3Z', fill: '#e7c18e' }, hand)
      create('path', { d: 'M5-4 8 1M1-2 4 3', stroke: '#ad805b', 'stroke-width': 1, 'stroke-linecap': 'round', fill: 'none' }, hand)
      return { arm, hand }
    })
    create('path', { d: 'M4-97 15-94M35-94 44-97', stroke: '#886748', 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' }, actor.head)
    const mouth = create('ellipse', { cx: 43, cy: -61, rx: 3.1, ry: 2.4, fill: '#8b6550' }, actor.head)
    return { ...actor, arms, mouth }
  })
  const porters = actors.slice(2).map(actor => ({
    ...actor,
    topBox: create('use', { href: parcelRef, transform: 'translate(49 -78) scale(.82)' }, actor.cargo),
  }))
  const rocks = Array.from(svg.querySelectorAll<SVGElement>('[data-pile-rock]'));
  const fallback = [[686,113],[744,131],[458,379],[879,377],[594,237]];
  const surfaces = rocks.length ? rocks.map((el,i) => ({
    x: Number(el.getAttribute('data-surface-x')) || fallback[i % fallback.length][0],
    y: Number(el.getAttribute('data-surface-y')) || fallback[i % fallback.length][1], el
  })) : fallback.map(([x,y])=>({x,y,el:null}));
  const drops = Array.from({length:12}, (_,i) => {
    const el = create('g', {transform:'translate(0 -500)'}, sky);
    create('use', {href:parcelRef}, el);
    if (i % 5 === 2) el.setAttribute('style','--parcel-top:#c4c9a8;--parcel-front:#a4af91;--parcel-side:#7c8b70;--parcel-tape:#deddbb');
    const dust = create('g', {transform:'scale(0)'}, impactDust);
    create('path',{d:'M-16 0Q-22-12-13-15-7-20 0-11 4-22 13-18 23-15 19-6 29-9 31-1 28 4H-20Z'},dust);
    return {el,dust};
  });
  const beads = Array.from({length:5}, () => create('path', {
    d:'M0-5C-2-1-5 3-4 6Q-3 10 1 9Q6 8 4 4Z',transform:'scale(0)'
  }, sweat));
  const skid = Array.from({length:4}, () => create('ellipse', {cx:0,cy:0,rx:0,ry:0},skidDust));
  // Every stride makes forward progress. Speed rises after the close-up;
  // integrating the ramp keeps both position and velocity continuous.
  function pushDistance(time: number) {
    const ramp = clamp((time - 4.2) / 1.8);
    return 12 * time + 32 * 1.8 * (ramp ** 3 - .5 * ramp ** 4)
      + 32 * Math.max(0,time - 6) + .35 * (1 - Math.cos(time * 17));
  }
  function outboundX(distance: number, start: number, hiddenStart: number, exit: number, facing: number) {
    const firstTrip = Math.abs(exit - start);
    if (distance < firstTrip) return start + facing * distance;
    // Both the box AND its worker have left the crop before this reset.
    // The next trip begins entirely behind the foreground mountain parcels.
    return hiddenStart + facing * mod(distance - firstTrip,Math.abs(exit - hiddenStart));
  }
  function pushPose(a: typeof pushers[number], time: number, x: number, y: number, scale: number, facing: number, phaseOffset: number) {
    const p = mod(time + phaseOffset, 2.8);
    const effort = .25 + .75 * Math.sin(Math.PI * clamp((p - .18) / 2.1));
    const actorX = x, lean = 9 + effort * 5;
    const bob = Math.sin(time * 38 + phaseOffset) * effort * .72;
    set(a.el,'translate(' + actorX.toFixed(3) + ' ' + y + ') scale(' + (scale * facing) + ' ' + scale + ')');
    set(a.bob,'translate(0 ' + bob.toFixed(3) + ') rotate(' + lean.toFixed(3) + ' -22 -8)');
    set(a.head,'rotate(' + (-3 - effort * 2 + Math.sin(time * 28) * .6 * effort).toFixed(3) + ' 16 -77)');
    const foot = Math.sin(time * 17 + phaseOffset) * (3 + effort * 6);
    set(a.front,'translate(' + foot.toFixed(3) + ' ' + (-Math.max(0,Math.cos(time * 17)) * 1.7).toFixed(3) + ')');
    set(a.back,'translate(' + (-foot * .9).toFixed(3) + ' 0)');
    const angle = -lean * Math.PI / 180, c = Math.cos(angle), s = Math.sin(angle);
    a.arms.forEach((arm,j) => {
      const targetX = j ? 80 : 83, targetY = j ? -45 : -66;
      const dx = targetX + 22, dy = targetY - bob + 8;
      const hx = dx * c - dy * s - 22, hy = dx * s + dy * c - 8;
      const sx = j ? 7 : 25, sy = j ? -27 : -45;
      arm.arm.setAttribute('d','M'+(sx-6)+' '+(sy-6)+'Q'+(sx+5)+' '+(hy+14)+' '+(hx-3)+' '+(hy-5)+'L'+(hx+3)+' '+(hy+6)+'Q'+(sx+12)+' '+(hy+27)+' '+(sx-3)+' '+(sy+8)+'Z');
      set(arm.hand,'translate('+hx.toFixed(3)+' '+hy.toFixed(3)+') rotate('+(-lean).toFixed(3)+')');
    });
    const eyeHeight = .8 - effort * .42;
    for (const eye of a.eyes) set(eye,'translate(0 -88) scale(1 '+eyeHeight.toFixed(3)+') translate(0 88)');
    a.mouth.setAttribute('ry',(1.7 + effort * 1.3).toFixed(2));
    return {effort,x:actorX};
  }
  function render(t: number) {
    // Work moves forward during the close-up; the camera reveals the whole hill once.
    const reveal = ease((t - 4.2) / 5.0), zoom = lerp(3.2,1,reveal);
    const tx = lerp(600 - 3.2 * 1020,0,reveal), ty = lerp(420 - 3.2 * 585,0,reveal);
    set(camera,'translate('+tx.toFixed(3)+' '+ty.toFixed(3)+') scale('+zoom.toFixed(5)+')');
    const distance = pushDistance(t);
    const hero = pushPose(pushers[0],t,outboundX(distance,974,780,1280,1),628,.62,1,0);
    const left = pushPose(pushers[1],t,outboundX(distance,299,490,-100,-1),628,.57,-1,1.2);
    set(heroBox,'translate('+(hero.x+86).toFixed(3)+' 620) scale(1.32)');
    set(leftBox,'translate('+(left.x-79).toFixed(3)+' 623) scale(1.1)');
    heroShadow.setAttribute('cx',(hero.x+86).toFixed(3));
    leftShadow.setAttribute('cx',(left.x-79).toFixed(3));
    // Porters enter and leave beyond the crop; recycled instances never jump in view.
    for (const porter of porters) set(porter.el, 'translate(-400 660)')
    const lastPorter = Math.floor((t + 1.8) / 5.5);
    for (let n = Math.max(0,lastPorter-3); n <= lastPorter; n++) {
      const age = t - (n * 5.5 - 1.8), x = -150 + age * 104;
      if (age < 0 || x < -150 || x > 1320) continue;
      const a = porters[mod(n, porters.length)], gait = t * 17 + n * 1.7;
      set(a.el,'translate('+x.toFixed(3)+' 658) scale(.5)');
      set(a.bob,'translate(0 '+(-Math.abs(Math.sin(gait))*3).toFixed(3)+') rotate(4 0 -25)');
      set(a.head,'rotate('+(-4+Math.sin(gait*.5)*1.5).toFixed(3)+' 16 -77)');
      set(a.front,'translate('+(Math.sin(gait)*11).toFixed(3)+' '+(-Math.max(0,Math.cos(gait))*4).toFixed(3)+')');
      set(a.back,'translate('+(-Math.sin(gait)*10).toFixed(3)+' '+(-Math.max(0,-Math.cos(gait))*4).toFixed(3)+')');
      set(a.cargo,'rotate('+(Math.sin(gait*.5)*2).toFixed(3)+' 50 -45)');
      set(a.topBox,'translate(49 -78) rotate('+(Math.sin(gait*.5+1)*2.5).toFixed(3)+') scale(.82)');
    }
    // Deliveries fall from an unseen source. The pile occludes their far-side roll.
    for (const rock of rocks) set(rock,'translate(0 0)');
    for (const drop of drops) { set(drop.el,'translate(0 -500)'); set(drop.dust,'scale(0)'); }
    const lastDrop = Math.floor(t / .72);
    for (let n = lastDrop - 6; n <= lastDrop; n++) {
      const age = t - n * .72, drop = drops[mod(n,12)], target = surfaces[mod(n,surfaces.length)];
      const size = .67 + mod(n,3) * .09;
      const duration = 1.35 + (target.y / 650) * .5 + mod(n,2) * .08;
      const startX = target.x + [-78,66,-45,93,30][mod(n,5)];
      let x, y, angle;
      if (age < duration) {
        const u = clamp(age / duration);
        x = lerp(startX,target.x,u);
        y = -180 + (target.y - size * 9 + 180) * (.16*u + .84*u*u);
        angle = lerp(-50 + mod(n,4)*29,8 - mod(n,3)*9,u);
      } else {
        const landed = age - duration;
        if (landed > .92) continue;
        const inward = Math.sign(700-target.x) || 1;
        x = target.x + inward * 25 * ease((landed-.2)/.62);
        y = target.y - size*9 - Math.sin(clamp(landed/.28)*Math.PI)*13 + 100*ease((landed-.2)/.62);
        angle = 8 - mod(n,3)*9 + inward*34*ease(landed/.7);
        const jolt = Math.sin(landed*29)*Math.exp(-landed*8);
        if (target.el) set(target.el,'translate(0 '+(jolt*2.5).toFixed(3)+')');
        const puff = Math.sin(clamp(landed/.48)*Math.PI);
        set(drop.dust,'translate('+target.x.toFixed(2)+' '+(target.y-2-landed*13).toFixed(2)+') scale('+(puff*.45).toFixed(3)+')');
      }
      set(drop.el,'translate('+x.toFixed(3)+' '+y.toFixed(3)+') rotate('+angle.toFixed(3)+') scale('+size+')');
    }
    beads.forEach((bead,i) => {
      const progress = mod(t * .86 + i * .27,1), growing = Math.sin(progress*Math.PI), isLeft = i > 2;
      const x = isLeft ? left.x-11-progress*10 : hero.x+19-progress*10-i*3;
      const y = (isLeft?570:566) + progress*37;
      set(bead,'translate('+x.toFixed(3)+' '+y.toFixed(3)+') rotate('+(isLeft?22:-20)+') scale('+(growing*(isLeft?.32:.38)).toFixed(3)+')');
    });
    skid.forEach((puff,i) => {
      const q = mod(t*1.35+i*.23,1), size = Math.sin(q*Math.PI), isLeft = i>1;
      puff.setAttribute('cx',((isLeft?left.x+22:hero.x-21)+(isLeft?1:-1)*q*13).toFixed(2));
      puff.setAttribute('cy',(632-q*3).toFixed(2));
      puff.setAttribute('rx',(size*4.2).toFixed(2)); puff.setAttribute('ry',(size*2.0).toFixed(2));
    });
    scene.dataset.phase = t < 4.2 ? 'close-up' : t < 9.2 ? 'reveal' : 'wide';
    scene.dataset.time = t.toFixed(2);
  }
  const pauseButton = findElement<HTMLButtonElement>(scene, '[data-action="pause"]')
  const replayButton = findElement<HTMLButtonElement>(scene, '[data-action="replay"]')
  const stillFrame = 12
  const pauseIcon = findElement<SVGElement>(pauseButton, '[data-icon="pause"]')
  const playIcon = findElement<SVGElement>(pauseButton, '[data-icon="play"]')
  let elapsed = reducedMotion ? stillFrame : 0
  let userPaused = false
  let offscreen = false
  let frameId = 0
  let lastFrame: number | undefined

  function canPlay() {
    return !reducedMotion && !userPaused && !document.hidden && !offscreen
  }

  function frame(now: number) {
    frameId = 0
    if (!canPlay()) return
    if (lastFrame !== undefined) elapsed += Math.min((now - lastFrame) / 1000, .06)
    lastFrame = now
    render(elapsed)
    frameId = requestAnimationFrame(frame)
  }

  function sync() {
    cancelAnimationFrame(frameId)
    lastFrame = undefined
    pauseButton.setAttribute('aria-label', userPaused ? '播放动画' : '暂停动画')
    pauseButton.setAttribute('aria-pressed', String(userPaused))
    pauseIcon.toggleAttribute('hidden', userPaused)
    playIcon.toggleAttribute('hidden', !userPaused)
    frameId = canPlay() ? requestAnimationFrame(frame) : 0
  }

  function togglePause() {
    userPaused = !userPaused
    sync()
  }

  function replay() {
    elapsed = 0
    userPaused = false
    render(elapsed)
    sync()
  }

  pauseButton.addEventListener('click', togglePause)
  replayButton.addEventListener('click', replay)
  document.addEventListener('visibilitychange', sync)
  const observer = typeof IntersectionObserver === 'function'
    ? new IntersectionObserver(([entry]) => {
        offscreen = !entry.isIntersecting
        sync()
      })
    : undefined
  observer?.observe(scene)
  render(elapsed)
  sync()

  return {
    setReducedMotion(reduced: boolean) {
      reducedMotion = reduced
      if (reduced) elapsed = stillFrame
      render(elapsed)
      sync()
    },
    destroy() {
      cancelAnimationFrame(frameId)
      observer?.disconnect()
      pauseButton.removeEventListener('click', togglePause)
      replayButton.removeEventListener('click', replay)
      document.removeEventListener('visibilitychange', sync)
    },
  };
}
</script>

<style scoped>
.hp429-scene {
  --hp-sky-top: #f4ead8; --hp-sky: #e8e3c9; --hp-sun: #fdf6d5;
  --hp-paper-shadow: #d4cbbb; --hp-mountain-far: #dadcc1; --hp-mountain-fold: #e5e2ca; --hp-mountain-near: #bcc7ac;
  --hp-pine: #869981; --hp-ground-back: #aebc91; --hp-ground: #c5c69d;
  --hp-path: #d3c99e; --hp-path-light: #eee0b9; --hp-path-edge: #b5ac85; --hp-grass: #89966c;
  --hp-leaf-dark: #83936f; --hp-leaf-mid: #a5b17c; --hp-leaf-light: #c2c58e; --hp-leaf-fold: #97a26f;
  --hp-wall: #dfcda8; --hp-wall-shade: #b4a487; --hp-wall-side: #c2b28f;
  --hp-foreground: #82916f;
  position: relative; margin: 0; min-width: 0; width: 100%;
}
.hp429-window { padding: 5px; overflow: hidden; }
.hp429-art { display: block; width: 100%; height: auto; overflow: visible; isolation: isolate; }
.hp429-art [data-part], .hp429-art [data-actor], .hp429-art .ham-bob, .hp429-art .ham-head, .hp429-art .ham-eye, .hp429-art .ham-cargo, .hp429-art .ham-foot-back, .hp429-art .ham-foot-front { transform-box: view-box; }
.hp429-controls { position: absolute; right: 2.5%; bottom: -21px; display: flex; align-items: center; gap: 1px; }
.hp429-control { display: inline-grid; place-items: center; width: 38px; height: 38px; border: 0; padding: 0; border-radius: 50%; color: var(--apple-secondary); background: transparent; cursor: pointer; }
.hp429-control:hover { background: var(--apple-hover); }
.hp429-control:focus-visible { outline: 2px solid var(--apple-accent); outline-offset: 2px; }
.hp429-control svg[hidden] { display: none; }
@media (max-width: 880px) { .hp429-controls { bottom: -24px; } }
@media (max-width: 420px) {
  .hp429-window { margin-inline: -9px; padding: 4px; }
  .hp429-controls { right: 0; }
}
@media (pointer: coarse) { .hp429-control { width: 44px; height: 44px; } }
.hp429-scene[data-theme="dark"] {
  --hp-sky-top: #253536; --hp-sky: #354a47; --hp-sun: #ddcd9d; --hp-paper-shadow: #15231f;
  --hp-mountain-far: #3a5149; --hp-mountain-fold: #3f5850; --hp-mountain-near: #466357; --hp-pine: #78917b;
  --hp-ground-back: #60795c; --hp-ground: #788462; --hp-path: #9c9d72; --hp-path-light: #c0b58a; --hp-path-edge: #727a57; --hp-grass: #526c4b;
  --hp-leaf-dark: #496549; --hp-leaf-mid: #738958; --hp-leaf-light: #94a66b; --hp-leaf-fold: #59764d;
  --hp-wall: #b3ab89; --hp-wall-shade: #817f64; --hp-wall-side: #999474; --hp-foreground: #334e42;
}
</style>
