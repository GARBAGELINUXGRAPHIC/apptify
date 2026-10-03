/** Articulated paper animation: two bounds, one sigh, then a fixed ambient cast.
 * All keyframes are prepared once; playback needs no RAF, timers or DOM insertion.
 */
export interface PaperStory { setPaused(paused: boolean): void; dispose(): void }
const DURATION = 14_000
type Cue = Keyframe & { at: number }
const pose = (at: number, x = 0, y = 0, angle = 0, sx = 1, sy = sx, easing = 'ease-in-out'): Cue => ({
  at, transform: `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${sx}, ${sy})`, easing,
})

export function createPaperStory(art: SVGSVGElement, scene: HTMLElement, intro: boolean, settled: () => void): PaperStory {
  let disposed = false
  let paused = false
  let narratives: Animation[] = []
  const ambient: Animation[] = []
  const target = (part: string) => art.querySelector<SVGElement>(`[data-part="${part}"]`)!
  const cue = (element: Element | null, name: string, frames: Cue[]) => {
    if (!element) return
    const animation = element.animate(frames.map(({ at, ...frame }) => ({ ...frame, offset: at / DURATION })), { duration: DURATION, fill: 'both', easing: 'linear' })
    animation.id = `paper-story-${name}`
    narratives.push(animation)
    return animation
  }
  const joint = (part: string, frames: Array<[number, number]>) => cue(target(part), part, frames.map(([at, angle]) => ({ at, transform: `rotate(${angle}deg)`, easing: 'ease-in-out' })))
  const loop = (element: Element, name: string, frames: Keyframe[], duration: number, phase = 0, easing = 'ease-in-out') => {
    const animation = element.animate(frames, { duration, iterations: Infinity, easing })
    animation.id = `paper-loop-${name}`
    animation.currentTime = phase
    if (paused) animation.pause()
    ambient.push(animation)
  }
  loop(target('current'), 'river', [{ transform: 'translate(-18px, -2px)', opacity: 0 }, { transform: 'translate(0px, 0px)', opacity: 1 }, { transform: 'translate(18px, 2px)', opacity: 0 }], 6800, 0, 'linear')
  art.querySelectorAll<SVGElement>('[data-drifter]').forEach((element, index) => {
    const lane = index % 2
    // The first position is behind solid bark; the root opening exposes each nut.
    // Neither an individual acorn nor its wake ever fades in or out.
    loop(element, `acorn-${index}`, [
      { transform: 'translate(579px, 391px)', offset: 0 },
      { transform: 'translate(605px, 421px)', offset: .12 },
      { transform: 'translate(627px, 458px)', offset: .24 },
      { transform: `translate(665px, ${488 + lane * 8}px)`, offset: .35 },
      { transform: `translate(820px, ${514 + lane * 14}px)`, offset: .65 },
      { transform: `translate(1065px, ${549 + lane * 19}px)`, offset: 1 },
    ], 20_000, index * 4000, 'linear')
  })
  // Feet are outside this shared torso/neck/head/arms transform and stay planted.
  const breathe = () => loop(target('breath'), 'breath', [{ transform: 'scale(1, 1)' }, { transform: 'scale(1, .987)' }, { transform: 'scale(1, 1)' }], 4600)

  if (intro) {
    cue(target('camera'), 'camera', [
      { at: 0, transform: 'translate(-290px, -122px) scale(1.72)' },
      { at: 4700, transform: 'translate(-290px, -122px) scale(1.72)', easing: 'cubic-bezier(.45, 0, .2, 1)' },
      { at: 8700, transform: 'translate(0px, 0px) scale(1)' },
      { at: DURATION, transform: 'translate(0px, 0px) scale(1)' },
    ])
    const actor: Cue[] = [pose(0, 150, 428, 0, .8, .8, 'linear')]
    const shadow: Cue[] = [{ at: 0, transform: 'translate(150px, 432px) scale(.8)', opacity: .13 }]
    // The world anchor is only airborne during a bound. Squash, counterbalance,
    // toe-off and foot placement are separate poses, with feet fixed on contact.
    const bound = (start: number, duration: number, x0: number, x1: number, height: number) => {
      for (let i = 0; i <= 32; i++) {
        const t = i / 32, lift = 4 * t * (1 - t), x = x0 + (x1 - x0) * t
        actor.push(pose(start + duration * t, x, 428 - height * lift, 0, .8, .8, 'linear'))
        shadow.push({ at: start + duration * t, transform: `translate(${x}px, 432px) scale(${.8 - lift * .12}, ${.8 - lift * .26})`, opacity: .13 - lift * .065 })
      }
    }
    bound(550, 720, 150, 326, 68)
    bound(1830, 600, 326, 462, 45)
    actor.push(pose(DURATION, 462, 428, 0, .8))
    shadow.push({ at: DURATION, transform: 'translate(462px, 432px) scale(.8)', opacity: .13 })
    cue(target('squirrel'), 'squirrel', actor)
    cue(target('actor-shadow'), 'shadow', shadow)

    // Anticipation → toe-off extension → compact flight → landing compression.
    // The second bound is shorter and flows out of the first landing's recovery.
    cue(target('body'), 'body', [
      pose(0), pose(190), pose(430, 3, 2, 12, 1.07, .78, 'cubic-bezier(.5,0,.8,.4)'),
      pose(550, 6, -1, 16, .96, 1.08, 'ease-out'), pose(760, 6, 0, 10, 1, .96),
      pose(980, 1, 0, 2, 1.02, .96), pose(1190, -2, 0, -4, .98, 1.04),
      pose(1270, 1, 0, 1, 1, 1, 'cubic-bezier(.15,.6,.3,1)'),
      pose(1380, 10, 2, 15, 1.1, .76), pose(1590, 2, 0, 3, 1, .97),
      pose(1730, 4, 2, 11, 1.07, .8, 'cubic-bezier(.5,0,.8,.4)'),
      pose(1830, 7, -1, 15, .97, 1.07, 'ease-out'), pose(2000, 5, 0, 9, 1, .95),
      pose(2220, 0, 0, -1, 1, 1), pose(2370, -2, 0, -4, .98, 1.03),
      pose(2430, 1, 0, 1, 1, 1, 'cubic-bezier(.15,.6,.3,1)'),
      pose(2550, 9, 2, 14, 1.09, .79), pose(2820, 0, 0, 2, 1, .99),
      pose(3180, 0, 0, 1, 1, 1.015), pose(3850, -2, 1, 4, 1.01, .97),
      pose(5650, -7, 2, 9, 1.04, .9), pose(DURATION, -7, 2, 9, 1.04, .9),
    ])
    cue(target('back-foot'), 'back-foot', [
      pose(0), pose(430, 0, 0, 0, 1, 1, 'ease-in'), pose(550, 0, 0, 27),
      pose(760, -7, -13, 12), pose(1020, -6, -15, 3), pose(1200, -2, -3, 8),
      pose(1310), pose(1730, 0, 0, 0, 1, 1, 'ease-in'), pose(1830, 0, 0, 25),
      pose(2020, -6, -12, 11), pose(2240, -4, -10, 2), pose(2380, -1, -2, 6),
      pose(2470), pose(DURATION),
    ])
    cue(target('front-foot'), 'front-foot', [
      pose(0), pose(420), pose(550, 0, 0, 22), pose(710, -10, -16, 20),
      pose(980, -4, -11, 5), pose(1150, 4, -2, -9), pose(1270),
      pose(1730), pose(1830, 0, 0, 21), pose(2000, -9, -14, 18),
      pose(2200, -2, -8, 2), pose(2350, 4, -1, -8), pose(2430),
      pose(3200), pose(5600, 9), pose(DURATION, 9),
    ])
    joint('tail', [[0, 0], [430, 16], [550, -8], [720, -24], [970, -6], [1240, 17], [1410, 9], [1630, -5], [1740, 12], [1830, -8], [1990, -21], [2200, -5], [2440, 16], [2660, -6], [3050, 0], [3550, -8], [4650, -29], [6100, -51], [DURATION, -51]])
    // Head rotates about an overlapping neck joint; no independent translation.
    joint('head', [[0, -3], [430, -8], [585, -12], [810, -4], [1040, 2], [1240, -3], [1410, -12], [1630, -3], [1750, -7], [1870, -11], [2070, -3], [2290, 2], [2460, -4], [2640, -10], [2880, -2], [3250, 0], [4050, 10], [5500, 18], [DURATION, 18]])
    // Both arms and the last acorn form one cradle, including during the sigh.
    joint('cradle', [[0, 0], [430, -4], [620, 5], [950, -7], [1280, 3], [1530, -3], [1750, -4], [1900, 4], [2220, -6], [2460, 3], [2830, 0], [4300, -4], [5600, -6], [DURATION, -6]])
    cue(target('eyelid'), 'eyelid', [{ at: 0, opacity: 0 }, { at: 3330, opacity: 0 }, { at: 5200, opacity: 1 }, { at: DURATION, opacity: 1 }])
    joint('brow', [[0, -13], [3300, -13], [5050, 12], [DURATION, 12]])
    // Establish the flowing pantry below the initial crop before pulling back.
    cue(target('drifters'), 'release', [{ at: 0, visibility: 'hidden' }, { at: 4400, visibility: 'hidden' }, { at: 4401, visibility: 'visible' }, { at: DURATION, visibility: 'visible' }])
    const captionTimes = [0, 3300, 6600, 9500, DURATION]
    for (let index = 0; index < 4; index++) {
      const start = captionTimes[index], end = captionTimes[index + 1]
      const frames: Cue[] = [{ at: 0, opacity: index === 0 ? 1 : 0 }]
      if (index > 0) frames.push({ at: start - 220, opacity: 0 }, { at: start + 220, opacity: 1 })
      if (index < 3) frames.push({ at: end - 240, opacity: 1 }, { at: end + 150, opacity: 0 })
      frames.push({ at: DURATION, opacity: index === 3 ? 1 : 0 })
      cue(scene.querySelector(`[data-caption="${index}"]`), `caption-${index}`, frames)
    }
    const clock = cue(target('breath'), 'clock', [{ at: 0, transform: 'scale(1, 1)' }, { at: 3200, transform: 'scale(1, 1)' }, { at: 3700, transform: 'scale(1, 1.015)', easing: 'ease-out' }, { at: 5500, transform: 'scale(1, 1)' }, { at: DURATION, transform: 'scale(1, 1)' }])!
    clock.onfinish = () => {
      if (disposed) return
      // CSS is exactly the last pose, so releasing finite effects cannot snap.
      for (const animation of narratives) { animation.onfinish = null; animation.cancel() }
      narratives = []
      breathe()
      settled()
    }
  } else breathe()
  return {
    setPaused(value) {
      if (disposed) return
      paused = value
      for (const animation of [...narratives, ...ambient]) {
        if (animation.playState === 'finished' || animation.playState === 'idle') continue
        if (paused) animation.pause()
        else animation.play()
      }
    },
    dispose() {
      disposed = true
      for (const animation of [...narratives, ...ambient]) { animation.onfinish = null; animation.cancel() }
      narratives = []
      ambient.length = 0
    },
  }
}
