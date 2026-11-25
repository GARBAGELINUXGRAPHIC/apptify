<template>
  <figure ref="scene" class="payment-scene" :class="{ 'payment-scene--dark': props.theme === 'dark' }" :data-motion="props.motion">
    <div class="payment-scene__window">
      <svg ref="art" class="payment-scene__art" viewBox="0 0 1000 660" xmlns="http://www.w3.org/2000/svg" role="img" :aria-labelledby="`${uid}-title ${uid}-description`">
        <title :id="`${uid}-title`">等你付款的浣熊</title>
        <desc :id="`${uid}-description`">戴墨镜的浣熊跷着二郎腿坐在木椅上，一只手吸烟，另一只手提着印有钱币符号的麻布钱袋。镜头先聚焦它的头部，等第一口烟吐完后拉远，再持续播放晃两下钱袋和吸烟的动作。</desc>
        <defs>
          <linearGradient :id="`${uid}-wall`" x2=".2" y2="1"><stop stop-color="var(--pay-wall-top)" /><stop offset="1" stop-color="var(--pay-wall)" /></linearGradient>
          <linearGradient :id="`${uid}-fur`" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="var(--pay-fur-light)" /><stop offset="1" stop-color="var(--pay-fur)" /></linearGradient>
          <linearGradient :id="`${uid}-lens`" x2=".7" y2="1"><stop stop-color="#465451" /><stop offset=".5" stop-color="#293735" /><stop offset="1" stop-color="#202d2c" /></linearGradient>
          <radialGradient :id="`${uid}-ember-glow`"><stop stop-color="#ffda8a" stop-opacity=".85" /><stop offset=".4" stop-color="#efa05d" stop-opacity=".48" /><stop offset="1" stop-color="#df8151" stop-opacity="0" /></radialGradient>
          <filter :id="`${uid}-shadow`" x="-30%" y="-25%" width="165%" height="170%"><feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" /><feOffset in="blur" dx="1" dy="6" result="offset" /><feFlood flood-color="#392e22" flood-opacity=".13" result="shade" /><feComposite in="shade" in2="offset" operator="in" result="shadow" /><feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter :id="`${uid}-soft-shadow`" x="-25%" y="-25%" width="155%" height="165%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="blur" /><feOffset in="blur" dy="3" result="offset" /><feFlood flood-color="#2d342d" flood-opacity=".15" result="shade" /><feComposite in="shade" in2="offset" operator="in" result="shadow" /><feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <pattern :id="`${uid}-grain`" width="41" height="37" patternUnits="userSpaceOnUse"><path d="M4 6h1m15 11h1m13-9h.7M9 29h1m26 3h.8" stroke="#5e472e" stroke-opacity=".14" stroke-width="1" /><path d="M8 11l3-1m13 16 3-1m-4-23 2-1" stroke="#fff8e5" stroke-opacity=".24" stroke-width=".7" /></pattern>
          <pattern :id="`${uid}-weave`" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 3h9M3 0v9" stroke="#f7edcf" stroke-width=".65" opacity=".15" /></pattern>
          <clipPath :id="`${uid}-frame`"><path d="M36 74Q37 38 75 35L909 20Q957 19 963 68L986 565Q987 608 942 614L84 635Q29 635 27 585Z" /></clipPath>
          <clipPath :id="`${uid}-window`"><path d="M112 111 310 105 313 305 111 306Z" /></clipPath>
          <clipPath :id="`${uid}-tail-clip`"><path d="M469 415C421 415 364 444 342 481C320 515 330 547 361 556C395 566 426 549 423 529C421 515 406 511 395 521C380 533 368 526 374 511C386 482 430 469 473 465Z" /></clipPath>
          <g :id="`${uid}-leaf`"><path d="M0 0C-25-5-35-21-27-39C-8-35 5-16 0 0Z" fill="currentColor" /><path d="M0 0-23-31" fill="none" stroke="#ebe5bc" stroke-width="1" opacity=".55" /></g>
        </defs>
        <path d="M44 90Q43 52 83 49L915 33Q970 35 974 85L994 574Q996 620 945 628L86 647Q35 647 36 598Z" fill="var(--pay-frame-shadow)" />
        <g :clip-path="`url(#${uid}-frame)`">
          <path d="M0 0H1000V660H0Z" :fill="`url(#${uid}-wall)`" />
          <g data-part="camera" transform="translate(-825 -316) scale(2.65)">
            <path d="M-600-600H1600V1100H-600Z" :fill="`url(#${uid}-wall)`" />
            <path d="M-500 360 1500 351V1100H-500Z" fill="var(--pay-panel)" />
            <path d="M-400 372 1400 363M83 370 81 462M206 370 205 459M332 368 330 456M690 363 692 455M819 360 824 457M943 360 951 460" fill="none" stroke="var(--pay-panel-line)" stroke-width="1.5" opacity=".5" />
            <path d="M-600 455 1600 451V1100H-600Z" fill="var(--pay-floor)" />
            <path d="M-500 454 1500 450" stroke="var(--pay-baseboard)" stroke-width="9" />
            <path d="M-200 530 1200 524M-200 614 1200 600M163 452 38 731M327 453 271 726M688 451 773 724M837 451 1026 724" fill="none" stroke="var(--pay-floor-line)" stroke-width="1.3" opacity=".33" />
            <path d="M112 304 313 305 593 455 198 456Z" fill="var(--pay-sunbeam)" opacity=".21" />

            <g :filter="`url(#${uid}-shadow)`">
              <path d="M99 99 322 92 326 319 98 320Z" fill="var(--pay-window-frame)" />
              <g :clip-path="`url(#${uid}-window)`">
                <path d="M100 96H331V324H100Z" fill="var(--pay-window-sky)" />
                <circle cx="253" cy="164" r="29" fill="var(--pay-sun)" />
                <path d="M93 247 161 182 221 237 284 201 334 241V329H93Z" fill="var(--pay-hill-far)" />
                <path d="M161 182 178 237 221 237Z" fill="var(--pay-hill-fold)" />
                <path d="M90 272Q148 239 198 271T333 257V329H90Z" fill="var(--pay-hill-near)" />
                <path d="m124 307 22-37-8 1 16-28 17 28-7-1 22 36Zm136-2 20-33-7 1 16-28 16 27-7-1 20 34Z" fill="var(--pay-tree)" />
                <path d="M211 105 212 311M110 211 314 208" stroke="var(--pay-window-frame)" stroke-width="8" />
              </g>
              <path d="m91 317 242-3-3 13-239 5Z" fill="var(--pay-sill-edge)" /><path d="m94 307 235-3 4 10-242 3Z" fill="var(--pay-sill)" />
            </g>

            <g opacity=".85" :filter="`url(#${uid}-soft-shadow)`">
              <path d="m758 128 36-27 41 25" fill="none" stroke="var(--pay-wood-dark)" stroke-width="1.4" /><circle cx="794" cy="101" r="2.3" fill="var(--pay-wood-dark)" />
              <path d="m747 123 100-3 4 105-101 4Z" fill="var(--pay-wood)" /><path d="m755 132 83-2 3 87-84 3Z" fill="var(--pay-sill)" />
              <path d="m764 142 65-2 2 67-66 2Z" fill="var(--pay-hill-far)" /><circle cx="807" cy="162" r="11" fill="var(--pay-sun)" />
              <path d="m765 185 20-19 16 21 15-13 14 11 1 22-66 2Z" fill="var(--pay-hill-near)" /><path d="m765 201 24-11 42 10v7l-66 2Z" fill="var(--pay-tree)" />
            </g>

            <ellipse cx="514" cy="568" rx="195" ry="24" fill="var(--pay-shadow)" opacity=".12" />
            <path d="M290 552 583 536 697 577 378 605 275 575Z" fill="var(--pay-rug)" />
            <path d="M307 556 581 545 672 576 380 594 295 574Z" fill="none" stroke="var(--pay-rug-line)" stroke-width="2.2" opacity=".65" />
            <path d="m300 557-15-2m9 11-16-2m29 15-17 1m386-7 16 2m-32 5 15 2m-32 4 16 2" stroke="var(--pay-rug-line)" stroke-width="2" opacity=".7" />

            <g data-part="tail">
              <path d="M469 415C421 415 364 444 342 481C320 515 330 547 361 556C395 566 426 549 423 529C421 515 406 511 395 521C380 533 368 526 374 511C386 482 430 469 473 465Z" fill="var(--pay-fur-light)" />
              <g :clip-path="`url(#${uid}-tail-clip)`" fill="var(--pay-mask)">
                <path d="m432 408 21 5-14 66-21-6Zm-49 24 21-11 32 57-23 14Zm-43 37 14-20 47 39-15 25Zm-20 40 7-22 55 17-5 23Zm14 35-9-21 57-4 7 21Zm43 24-25-7 16-41 22 7Zm31-5-20 7-8-44 23-10Z" />
              </g>
              <path d="M457 426Q382 444 355 489" fill="none" stroke="#eee9d4" stroke-width="2" opacity=".25" />
            </g>

            <g :filter="`url(#${uid}-shadow)`">
              <path d="m412 415 20 4-1 119-13 1Zm160 5 20-3 20 122-14 1Z" fill="var(--pay-wood-dark)" />
              <path d="M393 218Q390 194 414 191L590 193Q615 195 616 219L627 425 386 428Z" fill="var(--pay-wood-dark)" />
              <path d="M405 217Q404 204 417 203L586 205Q601 206 602 221L614 419 399 421Z" fill="var(--pay-cushion)" />
              <path d="M414 216 584 216Q590 216 591 225L602 411 411 413Z" fill="var(--pay-cushion-light)" />
              <path d="M414 216 584 216Q590 216 591 225L602 411 411 413Z" :fill="`url(#${uid}-weave)`" />
              <path d="M423 224 433 401M580 225 590 401" fill="none" stroke="var(--pay-cushion-line)" stroke-width="1.2" opacity=".5" />
              <path d="M389 415 615 412 638 437 376 442Z" fill="var(--pay-cushion)" /><path d="m376 442 262-5-2 17-259 5Z" fill="var(--pay-wood)" />
              <path d="m391 448 20-1-15 116-14-1Zm215-5 19-1 14 118-14 2Z" fill="var(--pay-wood-dark)" />
              <path d="m392 451 7-1-10 110-7 2Zm221-5 7-1 13 114-8 2Z" fill="var(--pay-wood)" />
              <path d="m385 370 14 1 7 75-12 1Zm219-2 13-2 3 74-12 3Z" fill="var(--pay-wood-dark)" />
              <path d="M373 364 431 359 438 370 373 378Q365 371 373 364Z" fill="var(--pay-wood)" /><path d="m581 357 59 3q10 5 2 12l-66-1Z" fill="var(--pay-wood)" />
              <path d="m376 365 55-4m153-2 51 3" stroke="var(--pay-wood-light)" stroke-width="2" opacity=".65" />
            </g>

            <g data-part="seated-legs">
              <path data-part="resting-leg" d="M519 410Q544 412 548 433Q549 444 531 458L509 473 499 531Q490 542 475 534L477 479Q472 458 482 441Z" fill="var(--pay-fur-shade)" />
              <path d="M492 456 512 447 498 477 491 526 479 529 485 474Z" fill="var(--pay-fur)" />
              <path d="M476 526Q489 521 501 528L503 539 520 547Q527 555 514 558L474 557Q462 554 466 543Z" fill="var(--pay-paw)" />
              <path d="m478 546 1 9m11-10 2 10m11-9 3 8" fill="none" stroke="var(--pay-paw-line)" stroke-width="1.5" stroke-linecap="round" />
              <path data-part="crossed-leg" d="M456 403C478 396 506 408 530 425Q549 434 549 452L563 510Q567 524 556 531Q544 534 536 521L521 476Q516 461 505 455L462 437Q449 424 456 403Z" :fill="`url(#${uid}-fur)`" :filter="`url(#${uid}-soft-shadow)`" />
              <path d="M458 427Q487 426 513 446Q526 454 531 477L544 516Q548 524 557 522L563 510Q567 524 556 531Q544 534 536 521L521 476Q516 461 505 455L462 437Z" fill="var(--pay-fur-shade)" opacity=".65" />
              <path d="M480 416Q504 416 526 434M537 461 548 503" fill="none" stroke="var(--pay-fur-highlight)" stroke-width="2.2" stroke-linecap="round" opacity=".55" />
              <g data-part="crossed-foot" transform="translate(553 516)">
                <path d="M-13-7Q0-12 12-4L14 8 30 24Q36 32 28 36Q23 39 14 34L-9 20Q-18 14-16 3Z" fill="var(--pay-paw)" />
                <path d="m18 23 6 9m-15-9 7 9m-17-14 6 8" fill="none" stroke="var(--pay-paw-line)" stroke-width="1.5" stroke-linecap="round" />
                <path d="M-13-7Q0-12 12-4L13 2Q0-4-14 3Z" fill="var(--pay-fur-shade)" />
              </g>
            </g>

            <g data-part="upper-body">
              <path d="M458 304Q495 288 547 307Q570 320 576 358L575 414Q524 446 450 417L440 355Q438 325 458 304Z" :fill="`url(#${uid}-fur)`" />
              <path d="M546 311Q568 332 568 373L560 414 539 426 575 414 576 358Q570 320 547 307Z" fill="var(--pay-fur-shade)" />
              <path d="M479 315Q503 305 531 319L550 376 539 414Q502 430 468 408L461 377Z" fill="var(--pay-belly)" />
              <path d="m482 326 14 7 10-8 10 8 15-8m-52 71 12 5m28 3 11-4" fill="none" stroke="var(--pay-fur-highlight)" stroke-width="2" opacity=".6" />

              <path data-part="smoke-upper-arm" d="M451 330 477 342 455 403 435 405Z" fill="var(--pay-fur-shade)" />
              <path data-part="smoke-forearm" d="M435 405 455 396 401 333 383 344Z" fill="var(--pay-fur)" />
              <path data-part="smoke-arm-light" d="M444 392 397 345" fill="none" stroke="var(--pay-fur-highlight)" stroke-width="3" opacity=".4" stroke-linecap="round" />

              <path d="M551 326Q565 322 575 340L600 375 583 392Q562 380 548 353Z" fill="var(--pay-fur-shade)" />
              <path data-part="money-forearm" d="M582 375Q591 367 601 368L621 348 635 362 610 389Q595 399 583 389Z" fill="var(--pay-fur)" />
              <path data-part="money-arm-light" d="m592 378 28-22" stroke="var(--pay-fur-highlight)" stroke-width="3" stroke-linecap="round" opacity=".4" />
              <g data-part="money-hand" transform="translate(638 338)">
                <path d="M-12 3Q-7-7 4-5L14 5 10 19Q0 28-11 21Q-17 13-12 3Z" fill="var(--pay-paw)" />
                <g data-part="money-sack" transform="translate(13 -1) rotate(0)" :filter="`url(#${uid}-soft-shadow)`">
                  <path d="M-9 3-20-23-9-20-2-25 5-20 17-23 10 3Z" fill="var(--pay-money-light)" />
                  <path d="m-10-17 6 15m13-15-5 15" fill="none" stroke="var(--pay-money-shade)" stroke-width="1.6" opacity=".7" />
                  <path d="M-9 5C-17 17-37 35-39 54C-42 77-25 88 0 88C25 88 43 78 39 54C36 34 19 16 10 5Z" fill="var(--pay-money)" />
                  <path d="M10 5C19 16 36 34 39 54C43 78 25 88 0 88Q23 81 27 61Q31 40 10 5Z" fill="var(--pay-money-shade)" opacity=".65" />
                  <path d="M-10 13Q-27 32-29 48M-24 75Q-7 82 8 80" fill="none" stroke="var(--pay-money-light)" stroke-width="2.1" stroke-linecap="round" opacity=".65" />
                  <path d="M-12 1Q0-2 12 1L11 8Q0 5-11 8Z" fill="var(--pay-money-cord)" />
                  <path d="M-11 3Q0 1 11 3" fill="none" stroke="var(--pay-money-light)" stroke-width="1.2" opacity=".65" />
                  <g data-part="money-cord">
                    <path d="M10 4Q21-4 25 2Q27 9 12 6M11 6Q25 11 22 17M10 6Q15 15 12 21" fill="none" stroke="var(--pay-money-cord)" stroke-width="2.1" stroke-linecap="round" />
                  </g>
                  <path data-part="money-symbol" d="M11 32C4 24-11 27-12 35C-13 43-2 44 4 47C17 52 12 64 1 65Q-8 66-14 60M0 23V70" fill="none" stroke="var(--pay-money-print)" stroke-width="3.7" stroke-linecap="round" stroke-linejoin="round" />
                </g>
                <path data-part="money-grip" d="M-11 7Q-14-4-6-9L12-10Q20-9 18-2L7 1 16 2Q21 3 20 8Q17 12 9 12L-1 16Z" fill="var(--pay-paw)" />
              </g>

              <g data-part="head" transform="translate(500 245)">
                <path d="M-75-39Q-91-54-91-80Q-92-105-73-105Q-53-103-34-77L-25-45Z" fill="var(--pay-fur-shade)" />
                <path d="M-70-52Q-82-65-80-84Q-80-94-72-91L-47-75Z" fill="var(--pay-cream)" /><path d="M-68-60-73-84-53-73Z" fill="var(--pay-mask)" />
                <path d="M24-45 34-76Q53-103 76-104Q94-104 92-81Q92-58 76-39Z" fill="var(--pay-fur-shade)" />
                <path d="M49-74 74-91Q83-96 82-82Q81-62 69-53Z" fill="var(--pay-cream)" /><path d="m56-73 20-12-8 26Z" fill="var(--pay-mask)" />
                <path d="M-85-29Q-83-61-52-68L-36-64Q-11-77 0-71Q20-77 40-64L55-68Q86-58 87-26L100-12 91 0 103 15 86 24 90 34 74 37Q53 70 0 74Q-48 70-73 41L-88 37-85 26-101 17-92 3-101-8Z" :fill="`url(#${uid}-fur)`" :filter="`url(#${uid}-soft-shadow)`" />
                <path d="M0-71Q20-77 40-64L55-68Q86-58 87-26L100-12 91 0 103 15 86 24 90 34 74 37Q53 70 0 74L8 48 44 28 61-17 44-44Z" fill="var(--pay-fur-shade)" opacity=".5" />
                <path d="M-77-32Q-49-52-26-30L-6-11-23 12-68 16-86-2Z" fill="var(--pay-cream)" /><path d="M7-12 29-32Q52-52 78-29L87-1 69 17 25 13Z" fill="var(--pay-cream)" />
                <path d="M-86-4Q-67 17-30 8L-6-7 0 16-20 39Q-60 48-82 26L-95 16Z" fill="var(--pay-mask)" />
                <path d="M7-8 31 8Q68 18 85-3L96 16 83 28Q57 50 22 38L0 16Z" fill="var(--pay-mask)" />
                <path d="M0-67-15-47-15-23 0 0 15-24 15-47Z" fill="var(--pay-cream)" opacity=".96" />
                <path d="M-80 27Q-61 39-39 29L-16 18 0 23 17 18 42 30Q63 40 82 25L74 43Q50 65 0 72Q-49 66-73 44Z" fill="var(--pay-cream)" />
                <path d="M0 23 17 18 42 30Q58 38 74 30L65 45Q38 66 0 71L-5 51Z" fill="var(--pay-cream-shade)" opacity=".7" />
                <path d="M-17 25Q0 16 16 25L10 35Q0 43-10 35Z" fill="var(--pay-nose)" /><path d="M-9 25Q-2 22 6 24" fill="none" stroke="#9ca79a" stroke-width="2" stroke-linecap="round" opacity=".55" />
                <path d="M0 37 0 45" fill="none" stroke="var(--pay-nose)" stroke-width="1.8" stroke-linecap="round" />
                <path data-part="mouth" d="M-12 48Q-4 44 2 47Q9 50 17 44" fill="none" stroke="var(--pay-nose)" stroke-width="2.2" stroke-linecap="round" />
                <path d="m-61 40-10-2m15 10-9 1m121-10 10-2m-13 10 9 1" stroke="var(--pay-fur-shade)" stroke-width="1.1" opacity=".42" stroke-linecap="round" />
                <g :filter="`url(#${uid}-soft-shadow)`">
                  <path d="M-86-20-74-18M74-18 85-22" fill="none" stroke="#333f3a" stroke-width="7" stroke-linecap="round" />
                  <path d="M-76-24-12-19Q-9-4-17 11Q-37 24-61 12Q-72 7-76-24Z" fill="#596057" /><path d="M12-19 76-24Q73 7 61 12Q37 24 17 11Q9-4 12-19Z" fill="#596057" />
                  <path d="M-71-20-17-16Q-15-3-22 8Q-41 18-59 8Q-67 4-71-20Z" :fill="`url(#${uid}-lens)`" /><path d="M17-16 71-20Q68 4 59 8Q40 18 22 8Q15-3 17-16Z" :fill="`url(#${uid}-lens)`" />
                  <path d="M-15-13Q0-21 15-13" fill="none" stroke="#3b4641" stroke-width="5" />
                  <path d="m-64-15 12 1-15 17-3-8Zm11 0 5 .5-15 18-4-2Zm89-2 12-1L32 9 24 5Z" fill="#c6d1be" opacity=".14" />
                  <path d="m-70-20 51 4m39 0 48-4" fill="none" stroke="#aeb7a6" stroke-width="1" opacity=".45" />
                </g>
              </g>

              <g data-part="smoke-hand" transform="translate(386 319) rotate(-15)">
                <path data-part="smoke-middle" d="M-9 16C-11 5-13-6-12-18C-11-24-3-25-1-18L7 3 8 16Z" fill="var(--pay-paw)" />
                <path d="M-13 8Q-5 5 7 8L19 12Q25 16 20 23L8 31-10 29-16 20Z" fill="var(--pay-paw)" />
                <g data-part="cigarette">
                  <ellipse data-part="ember-halo" cx="-20" cy="-2" rx="11" ry="10" :fill="`url(#${uid}-ember-glow)`" opacity=".08" />
                  <path d="M-19-5 34-5 34 1-19 1Z" fill="#f1ebd4" /><path d="m21-5 13 0v6H21Z" fill="#be936b" />
                  <path d="M-18-5h5v6h-5Z" fill="#9c9581" />
                  <path data-part="ember" d="M-22-5.5-17-5-17 1-21 1.5Z" fill="#bd7953" />
                  <ellipse data-part="ember-core" cx="-20.1" cy="-2" rx="1.4" ry="2.25" fill="#ffdfa1" opacity=".1" />
                  <path d="M-13-4H20" stroke="#fff9e7" stroke-width="1" opacity=".8" />
                </g>
                <path data-part="smoke-index" d="M2 18C5 8 2-3 1-15C0-22 7-25 11-20C16-12 17-1 19 8L18 20Z" fill="var(--pay-paw)" />
                <path d="M18 12Q26 13 24 19L14 25 9 19Z" fill="var(--pay-paw)" />
              </g>
            </g>

            <g data-part="smoke" fill="none" stroke="var(--pay-smoke)" stroke-linecap="round" pointer-events="none">
              <path data-part="smoke-ribbon" fill="var(--pay-smoke)" stroke="none" opacity=".2" />
              <path data-part="smoke-source" stroke-width="1.8" opacity=".5" />
              <path data-wisp="0" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="1" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="2" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="3" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="4" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="5" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="6" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="7" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="8" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="9" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="10" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-wisp="11" fill="var(--pay-smoke)" stroke="none" opacity="0" />
              <path data-part="exhale-source" stroke-width="3.5" opacity="0" />
              <path data-puff="0" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-puff="1" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-puff="2" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-puff="3" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-puff="4" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-puff="5" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-puff="6" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-puff="7" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-puff="8" fill="var(--pay-smoke)" stroke="none" opacity="0" /><path data-puff="9" fill="var(--pay-smoke)" stroke="none" opacity="0" />
            </g>

            <g data-part="side-table" transform="translate(1000 0) scale(-1 1)" :filter="`url(#${uid}-shadow)`">
              <ellipse cx="774" cy="563" rx="100" ry="11" fill="var(--pay-shadow)" opacity=".12" />
              <path d="m714 424 12 1-12 139-9 1Zm101-1 12-1 20 141-10 2Z" fill="var(--pay-wood-dark)" /><path d="m770 422 10-1 1 121-9 1Z" fill="var(--pay-wood-dark)" />
              <path d="m696 414 136-4 29 20-166 6Z" fill="var(--pay-wood)" /><path d="m695 436 166-6-1 10-165 6Z" fill="var(--pay-wood-dark)" /><path d="m699 415 130-3 20 14-148 5Z" fill="var(--pay-wood-light)" />
              <path data-part="parcel-contact-shadow" d="M775 418 823 411 850 423 801 434Z" fill="var(--pay-shadow)" opacity=".23" />
              <g data-part="table-parcel">
                <path d="M778 344 823 339 845 349 800 356Z" fill="#d4b589" />
                <path d="M778 344 800 356 800 430 778 418Z" fill="#b39167" />
                <path d="M800 356 845 349 845 423 800 430Z" fill="#c1a074" />
                <path d="M797 342 807 341 829 351 819 353Z" fill="#e1c79c" />
                <path d="M819 353 829 351 829 425 819 427Z" fill="#e1c79c" />
                <path d="M809 375 835 371 835 388 809 392Z" fill="#e8ddbc" />
                <path d="m815 380 13-2m-13 6 8-1" stroke="#9e9271" stroke-width="1.2" opacity=".7" />
                <path d="M778 418 800 430 845 423" fill="none" stroke="var(--pay-wood-dark)" stroke-width="1.25" opacity=".5" />
              </g>
              <ellipse cx="738" cy="418" rx="27" ry="7" fill="var(--pay-dish-shadow)" /><path d="M709 410Q735 421 766 408L762 417Q737 427 713 420Z" fill="var(--pay-dish)" /><ellipse cx="737" cy="410" rx="28" ry="7" fill="var(--pay-dish-light)" /><ellipse cx="737" cy="410" rx="21" ry="4.5" fill="var(--pay-dish-shadow)" />
              <path d="m710 407 9 2m39-4-8 2" fill="none" stroke="var(--pay-dish-shadow)" stroke-width="3" stroke-linecap="round" />
              <path d="m727 408 4-1 3 3-5 2Zm11 1 6-1 1 3-5 1Z" fill="#9b9d87" /><path d="m726 411h2m11-4h2m6 5h1" stroke="#d8d6ba" stroke-width="1.2" stroke-linecap="round" />
            </g>

            <g data-part="plant" transform="translate(1000 0) scale(-1 1)" :filter="`url(#${uid}-soft-shadow)`">
              <ellipse cx="208" cy="543" rx="49" ry="9" fill="var(--pay-shadow)" opacity=".1" />
              <path d="M175 475 239 473 230 536Q209 548 185 537Z" fill="var(--pay-pot)" /><path d="m178 482 16 2 7 57-16-4Z" fill="var(--pay-pot-light)" /><path d="m172 471 70-1-2 13-66 2Z" fill="var(--pay-pot-light)" /><ellipse cx="207" cy="471" rx="35" ry="6" fill="var(--pay-soil)" />
              <path d="M206 476 201 371M203 441 177 414M202 419 231 391M202 397 180 369" fill="none" stroke="var(--pay-plant-stem)" stroke-width="3" stroke-linecap="round" />
              <g color="var(--pay-plant)"><use :href="`#${uid}-leaf`" transform="translate(177 415) rotate(-15) scale(1.15)" /><use :href="`#${uid}-leaf`" transform="translate(230 392) rotate(86) scale(1.1)" /><use :href="`#${uid}-leaf`" transform="translate(180 370) rotate(-24)" /><use :href="`#${uid}-leaf`" transform="translate(202 389) rotate(35) scale(.93)" /></g>
              <g color="var(--pay-plant-light)"><use :href="`#${uid}-leaf`" transform="translate(204 456) rotate(79)" /><use :href="`#${uid}-leaf`" transform="translate(200 432) rotate(-30) scale(.82)" /></g>
            </g>
          </g>
          <path d="M0 0H1000V660H0Z" :fill="`url(#${uid}-grain)`" pointer-events="none" opacity=".65" />
        </g>
      </svg>
    </div>
  </figure>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { createPaymentRenderer, createPaymentStory, type PaymentStory } from './payment-paper-story'

const props = withDefaults(defineProps<{ theme?: 'light' | 'dark'; motion?: 'full' | 'reduced' | 'none'; paused?: boolean }>(), { theme: 'light', motion: 'full', paused: false })
const uid = `payment-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
const scene = ref<HTMLElement>()
const art = ref<SVGSVGElement>()
const hidden = ref(typeof document !== 'undefined' && document.hidden)
const offscreen = ref(false)
const suspended = computed(() => props.paused || hidden.value || offscreen.value)
let player: PaymentStory | undefined
let observer: IntersectionObserver | undefined
let mounted = false

function play(intro: boolean) {
  player?.dispose()
  player = undefined
  if (!mounted || !art.value) return
  if (props.motion !== 'full') { createPaymentRenderer(art.value).still(); return }
  player = createPaymentStory(art.value, intro)
  player.setPaused(suspended.value)
}
function visibilityChanged() { hidden.value = document.hidden }
watch(suspended, value => player?.setPaused(value), { flush: 'sync' })
watch(() => props.motion, () => play(false), { flush: 'post' })
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
.payment-scene {
  --pay-wall-top: #f4ead8; --pay-wall: #e8e3c9; --pay-frame-shadow: #d4cbbb;
  --pay-panel: #d6d8ba; --pay-panel-line: #aeb795; --pay-floor: #d4c39f; --pay-floor-line: #b29a77; --pay-baseboard: #b8b69a;
  --pay-window-frame: #e4d7b6; --pay-window-sky: #dde1c9; --pay-sill: #ece0c2; --pay-sill-edge: #b09a77; --pay-sun: #fdf6d5; --pay-sunbeam: #fff5ce;
  --pay-hill-far: #bbc6ad; --pay-hill-fold: #d0d3b5; --pay-hill-near: #9bad88; --pay-tree: #829678;
  --pay-wood: #b29970; --pay-wood-dark: #8f7957; --pay-wood-light: #cbb68b;
  --pay-cushion: #849781; --pay-cushion-light: #a4b095; --pay-cushion-line: #d1d2ad;
  --pay-fur: #949b8e; --pay-fur-light: #b8bca9; --pay-fur-shade: #7e897c; --pay-fur-highlight: #d2d3bd;
  --pay-cream: #eee9d6; --pay-cream-shade: #d7d9c3; --pay-mask: #535e55; --pay-nose: #38463f;
  --pay-paw: #4d5b51; --pay-paw-line: #81917b; --pay-paw-pad: #71816d; --pay-belly: #d4d6bd;
  --pay-money: #c7ad78; --pay-money-light: #dfc99d; --pay-money-shade: #a68b5c; --pay-money-cord: #86704e; --pay-money-print: #59634c;
  --pay-rug: #b7bd95; --pay-rug-line: #d7d4b0; --pay-shadow: #61583e; --pay-smoke: #889586;
  --pay-dish: #a1b1a0; --pay-dish-light: #d6d9bd; --pay-dish-shadow: #849784;
  --pay-pot: #b48e6b; --pay-pot-light: #c7a680; --pay-soil: #807957; --pay-plant: #849771; --pay-plant-light: #a3b38b; --pay-plant-stem: #73865f;
  margin: 0; min-width: 0; position: relative;
}
.payment-scene--dark {
  --pay-wall-top: #253536; --pay-wall: #354a47; --pay-frame-shadow: #121d1f;
  --pay-panel: #465b4e; --pay-panel-line: #62765a; --pay-floor: #838366; --pay-floor-line: #62634b; --pay-baseboard: #3c5044;
  --pay-window-frame: #708170; --pay-window-sky: #364c4e; --pay-sill: #a5a382; --pay-sill-edge: #586e5b; --pay-sun: #ddcd9d; --pay-sunbeam: #bdb37d;
  --pay-hill-far: #466357; --pay-hill-fold: #58715c; --pay-hill-near: #334e42; --pay-tree: #253e37;
  --pay-wood: #8a805b; --pay-wood-dark: #625f43; --pay-wood-light: #a3a07a;
  --pay-cushion: #536f5c; --pay-cushion-light: #788e70; --pay-cushion-line: #a4b18b;
  --pay-fur: #8b9b88; --pay-fur-light: #b7c0a6; --pay-fur-shade: #6d826e; --pay-fur-highlight: #c6ceb2;
  --pay-cream: #e1e5cb; --pay-cream-shade: #c5d1b5; --pay-mask: #3e5749; --pay-nose: #2b4337;
  --pay-paw: #3a5444; --pay-paw-line: #7d9777; --pay-paw-pad: #607d5e; --pay-belly: #bac8a6;
  --pay-money: #ac9464; --pay-money-light: #ccb886; --pay-money-shade: #8a764f; --pay-money-cord: #695d41; --pay-money-print: #354d3d;
  --pay-rug: #657856; --pay-rug-line: #899474; --pay-shadow: #273b30; --pay-smoke: #bdcbb3;
  --pay-dish: #6b8a71; --pay-dish-light: #a9bb94; --pay-dish-shadow: #506e57;
  --pay-pot: #9d8765; --pay-pot-light: #b4a47e; --pay-soil: #546143; --pay-plant: #53734f; --pay-plant-light: #7a9363; --pay-plant-stem: #3c5f3e;
}
.payment-scene__window { overflow: hidden; padding: 4px; }
.payment-scene__art { display: block; width: 100%; height: auto; overflow: visible; }
@media (max-width: 880px) { .payment-scene__window { margin-inline: -12px; } }
</style>
