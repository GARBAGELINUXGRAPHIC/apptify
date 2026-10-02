/** One finite story followed by a fixed ambient cast. No RAF, timers or DOM insertion. */
export interface PaperStory { setPaused(paused: boolean): void; dispose(): void }
const DURATION = 14_000
type Cue = Keyframe & { at: number }

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
    // Constant opacity: the trunk and scene clipping, not a dissolve, mask resets.
    loop(element, `acorn-${index}`, [
      { transform: 'translate(579px, 391px)', offset: 0 },
      { transform: 'translate(605px, 421px)', offset: .12 },
      { transform: 'translate(627px, 458px)', offset: .24 },
      { transform: `translate(665px, ${488 + lane * 8}px)`, offset: .35 },
      { transform: `translate(820px, ${514 + lane * 14}px)`, offset: .65 },
      { transform: `translate(1065px, ${549 + lane * 19}px)`, offset: 1 },
    ], 20_000, index * 4000, 'linear')
  })
  const breathe = () => loop(target('breath'), 'breath', [{ transform: 'translateY(0px)' }, { transform: 'translateY(1.6px)' }, { transform: 'translateY(0px)' }], 4200)

  if (intro) {
    cue(target('camera'), 'camera', [
      { at: 0, transform: 'translate(-290px, -122px) scale(1.72)' },
      { at: 5700, transform: 'translate(-290px, -122px) scale(1.72)', easing: 'cubic-bezier(.45, 0, .2, 1)' },
      { at: 9200, transform: 'translate(0px, 0px) scale(1)' },
      { at: DURATION, transform: 'translate(0px, 0px) scale(1)' },
    ])
    const actor: Cue[] = [{ at: 0, transform: 'translate(135px, 428px) rotate(0deg) scale(.8)' }]
    // Sample a ballistic arc rather than easing each coordinate in separate stages.
    const hop = (start: number, duration: number, x0: number, x1: number, ground: number, height: number) => {
      for (let i = 0; i <= 24; i++) {
        const t = i / 24
        actor.push({ at: start + duration * t, transform: `translate(${x0 + (x1 - x0) * t}px, ${ground - 4 * height * t * (1 - t)}px) rotate(${Math.sin(t * Math.PI * 2) * -5}deg) scale(.8)` })
      }
    }
    hop(400, 1200, 135, 318, 428, 100)
    actor.push({ at: 1900, transform: 'translate(318px, 428px) rotate(0deg) scale(.8)' })
    hop(2000, 1100, 318, 457, 428, 62)
    actor.push(
      { at: 3700, transform: 'translate(457px, 428px) rotate(0deg) scale(.8)', easing: 'ease-in-out' },
      { at: 4850, transform: 'translate(535px, 379px) rotate(0deg) scale(.58)' },
      { at: 8200, transform: 'translate(535px, 379px) rotate(0deg) scale(.58)', easing: 'ease-in-out' },
      { at: 9500, transform: 'translate(455px, 429px) rotate(0deg) scale(.8)' },
      { at: DURATION, transform: 'translate(455px, 429px) rotate(0deg) scale(.8)' },
    )
    cue(target('squirrel'), 'squirrel', actor)
    cue(target('pantry'), 'pantry', [{ at: 0, opacity: 1 }, { at: 6700, opacity: 1 }, { at: 8400, opacity: 0 }, { at: DURATION, opacity: 0 }])
    cue(target('drifters'), 'release', [{ at: 0, visibility: 'hidden' }, { at: 7000, visibility: 'hidden' }, { at: 7001, visibility: 'visible' }, { at: DURATION, visibility: 'visible' }])
    cue(target('actor-shadow'), 'shadow', [
      { at: 0, transform: 'translateX(-300px)', opacity: 0 }, { at: 1000, transform: 'translateX(-190px)', opacity: .06 },
      { at: 1550, transform: 'translateX(-125px)', opacity: .13 }, { at: 2650, transform: 'translateX(-65px)', opacity: .06 },
      { at: 3300, transform: 'translateX(4px)', opacity: .13 }, { at: 4380, transform: 'translateX(60px)', opacity: 0 },
      { at: 8730, transform: 'translateX(25px)', opacity: 0 }, { at: 9410, transform: 'translateX(0px)', opacity: .13 },
      { at: DURATION, transform: 'translateX(0px)', opacity: .13 },
    ])
    cue(target('tail'), 'tail', [
      { at: 0, transform: 'rotate(12deg)' }, { at: 1000, transform: 'rotate(-11deg)' },
      { at: 1640, transform: 'rotate(16deg)' }, { at: 2100, transform: 'rotate(0deg)' },
      { at: 2650, transform: 'rotate(-16deg)' }, { at: 3300, transform: 'rotate(9deg)' },
      { at: 4380, transform: 'rotate(-13deg)' }, { at: 5360, transform: 'rotate(14deg)' },
      { at: 8730, transform: 'rotate(7deg)' }, { at: 9660, transform: 'rotate(-6deg)' },
      { at: 10_800, transform: 'rotate(5deg)', easing: 'cubic-bezier(.4,0,.6,1)' },
      { at: 12_450, transform: 'rotate(-49deg)' }, { at: DURATION, transform: 'rotate(-49deg)' },
    ])
    cue(target('head'), 'head', [
      { at: 0, transform: 'translate(0px, 0px) rotate(-7deg)' }, { at: 2100, transform: 'translate(0px, 0px) rotate(-7deg)' },
      { at: 3300, transform: 'translate(0px, 0px) rotate(-13deg)' }, { at: 4380, transform: 'translate(0px, 0px) rotate(0deg)' },
      { at: 5600, transform: 'translate(0px, -3px) rotate(-19deg)' }, { at: 7300, transform: 'translate(0px, -3px) rotate(-19deg)' }, { at: 9410, transform: 'translate(0px, 0px) rotate(0deg)' }, { at: 10_200, transform: 'translate(1px, 2px) rotate(20deg)' },
      { at: 10_650, transform: 'translate(0px, -3px) rotate(-8deg)' },
      { at: 11_150, transform: 'translate(1px, 2px) rotate(20deg)', easing: 'ease-in-out' },
      { at: 12_550, transform: 'translate(0px, 15px) rotate(17deg)' }, { at: DURATION, transform: 'translate(0px, 15px) rotate(17deg)' },
    ])
    cue(target('body'), 'slump', [
      { at: 0, transform: 'translate(0px, 0px) rotate(0deg)' },
      { at: 11_200, transform: 'translate(0px, 0px) rotate(0deg)', easing: 'cubic-bezier(.4,0,.5,1)' },
      { at: 12_500, transform: 'translate(-2px, 10px) rotate(-12deg)' }, { at: DURATION, transform: 'translate(-2px, 10px) rotate(-12deg)' },
    ])
    cue(target('front-foot'), 'foot', [
      { at: 0, transform: 'translate(0px, 0px) rotate(0deg)' }, { at: 11_200, transform: 'translate(0px, 0px) rotate(0deg)' },
      { at: 12_300, transform: 'translate(9px, 1px) rotate(-8deg)' }, { at: DURATION, transform: 'translate(9px, 1px) rotate(-8deg)' },
    ])
    cue(target('arm'), 'arm', [
      { at: 0, transform: 'translate(0px, 0px) rotate(0deg)' }, { at: 5100, transform: 'translate(0px, 0px) rotate(0deg)' },
      { at: 5500, transform: 'translate(0px, 0px) rotate(36deg)' }, { at: 10_600, transform: 'translate(0px, 0px) rotate(36deg)' },
      { at: 11_000, transform: 'translate(0px, 0px) rotate(-14deg)' },
      { at: 12_600, transform: 'translate(0px, 12px) rotate(53deg)' }, { at: DURATION, transform: 'translate(0px, 12px) rotate(53deg)' },
    ])
    cue(target('held-acorn'), 'delivery', [{ at: 0, opacity: 1 }, { at: 5100, opacity: 1 }, { at: 5350, opacity: 0 }, { at: DURATION, opacity: 0 }])
    cue(target('eyelid'), 'eyelid', [{ at: 0, opacity: 0 }, { at: 11_300, opacity: 0 }, { at: 12_100, opacity: 1 }, { at: DURATION, opacity: 1 }])
    cue(target('brow'), 'brow', [{ at: 0, transform: 'rotate(-13deg)' }, { at: 10_500, transform: 'rotate(-13deg)' }, { at: 12_100, transform: 'rotate(12deg)' }, { at: DURATION, transform: 'rotate(12deg)' }])
    cue(target('splash'), 'splash', [
      { at: 0, opacity: 0 }, { at: 7900, opacity: 0 }, { at: 8000, opacity: .85 }, { at: 8360, opacity: 0 },
      { at: 8910, opacity: 0 }, { at: 9020, opacity: .8 }, { at: 9380, opacity: 0 },
      { at: 10_000, opacity: 0 }, { at: 10_100, opacity: .8 }, { at: 10_470, opacity: 0 }, { at: DURATION, opacity: 0 },
    ])
    const captionTimes = [0, 5600, 8800, 11_600, DURATION]
    for (let index = 0; index < 4; index++) {
      const start = captionTimes[index], end = captionTimes[index + 1]
      const frames: Cue[] = [{ at: 0, opacity: index === 0 ? 1 : 0 }]
      if (index > 0) frames.push({ at: start - 220, opacity: 0 }, { at: start + 220, opacity: 1 })
      if (index < 3) frames.push({ at: end - 240, opacity: 1 }, { at: end + 150, opacity: 0 })
      frames.push({ at: DURATION, opacity: index === 3 ? 1 : 0 })
      cue(scene.querySelector(`[data-caption="${index}"]`), `caption-${index}`, frames)
    }
    const clock = cue(target('breath'), 'clock', [{ at: 0, transform: 'translateY(0px)' }, { at: DURATION, transform: 'translateY(0px)' }])!
    clock.onfinish = () => {
      if (disposed) return
      // The underlying SVG/CSS is the resting pose; release all finite effects.
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
