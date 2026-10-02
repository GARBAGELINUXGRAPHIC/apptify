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
    loop(element, `acorn-${index}`, [
      { transform: `translate(433px, ${494 + lane * 23}px)`, opacity: 0, offset: 0 },
      { transform: `translate(535px, ${492 + lane * 25}px)`, opacity: 1, offset: .18 },
      { transform: `translate(722px, ${502 + lane * 29}px)`, opacity: 1, offset: .48 },
      { transform: `translate(978px, ${541 + lane * 31}px)`, opacity: 1, offset: .92 },
      { transform: `translate(1040px, ${551 + lane * 33}px)`, opacity: 0, offset: 1 },
    ], 18_000 + lane * 2000, index * 3900, 'linear')
  })
  const breathe = () => loop(target('breath'), 'breath', [{ transform: 'translateY(0px)' }, { transform: 'translateY(1.6px)' }, { transform: 'translateY(0px)' }], 4200)

  if (intro) {
    cue(target('camera'), 'camera', [
      { at: 0, transform: 'translate(-290px, -122px) scale(1.72)' },
      { at: 5700, transform: 'translate(-290px, -122px) scale(1.72)', easing: 'cubic-bezier(.45, 0, .2, 1)' },
      { at: 9200, transform: 'translate(0px, 0px) scale(1)' },
      { at: DURATION, transform: 'translate(0px, 0px) scale(1)' },
    ])
    cue(target('squirrel'), 'squirrel', [
      { at: 0, transform: 'translate(135px, 428px) rotate(-13deg) scale(.8)', opacity: 1 },
      { at: 350, transform: 'translate(155px, 428px) rotate(-13deg) scale(.8)', easing: 'cubic-bezier(.15,.6,.35,1)' },
      { at: 1000, transform: 'translate(244px, 326px) rotate(6deg) scale(.8)', easing: 'cubic-bezier(.6,0,.85,.5)' },
      { at: 1550, transform: 'translate(311px, 423px) rotate(-6deg) scale(.86,.69)' },
      { at: 1740, transform: 'translate(318px, 420px) rotate(0deg) scale(.8)' },
      { at: 2100, transform: 'translate(318px, 420px) rotate(0deg) scale(.8)', easing: 'cubic-bezier(.15,.65,.4,1)' },
      { at: 2650, transform: 'translate(393px, 337px) rotate(8deg) scale(.8)', easing: 'cubic-bezier(.6,0,.85,.5)' },
      { at: 3100, transform: 'translate(453px, 422px) rotate(-5deg) scale(.85,.72)' },
      { at: 3300, transform: 'translate(457px, 420px) rotate(0deg) scale(.8)' },
      { at: 3850, transform: 'translate(457px, 420px) rotate(-5deg) scale(.8)', easing: 'cubic-bezier(.2,.7,.4,1)' },
      { at: 4380, transform: 'translate(520px, 364px) rotate(5deg) scale(.66)' },
      { at: 4930, transform: 'translate(556px, 365px) rotate(0deg) scale(.47)', opacity: 1 },
      { at: 5360, transform: 'translate(559px, 358px) rotate(0deg) scale(.3)', opacity: 0 },
      { at: 7850, transform: 'translate(559px, 358px) rotate(0deg) scale(.3)', opacity: 0 },
      { at: 8260, transform: 'translate(544px, 370px) rotate(0deg) scale(.5)', opacity: 1 },
      { at: 8730, transform: 'translate(517px, 373px) rotate(-4deg) scale(.66)' },
      { at: 9410, transform: 'translate(455px, 429px) rotate(-7deg) scale(.84,.74)' },
      { at: 9660, transform: 'translate(455px, 429px) rotate(0deg) scale(.8)' },
      { at: DURATION, transform: 'translate(455px, 429px) rotate(0deg) scale(.8)' },
    ])
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
      { at: 9410, transform: 'translate(0px, 0px) rotate(0deg)' }, { at: 10_200, transform: 'translate(1px, 2px) rotate(20deg)' },
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
    art.querySelectorAll<SVGElement>('[data-spill]').forEach((element, index) => {
      const start = 7150 + index * 510
      cue(element, `spill-${index}`, [
        { at: 0, transform: 'translate(579px, 392px) rotate(-30deg)', opacity: 0 },
        { at: start, transform: 'translate(579px, 392px) rotate(-30deg)', opacity: 0 },
        { at: start + 100, transform: 'translate(586px, 401px) rotate(0deg)', opacity: 1, easing: 'ease-in' },
        { at: start + 410, transform: 'translate(611px, 432px) rotate(97deg)', opacity: 1, easing: 'ease-out' },
        { at: start + 550, transform: 'translate(623px, 426px) rotate(133deg)', opacity: 1, easing: 'ease-in' },
        { at: start + 820, transform: 'translate(638px, 471px) rotate(190deg)', opacity: 1 },
        { at: start + 1400, transform: 'translate(665px, 485px) rotate(216deg)', opacity: 0 },
        { at: DURATION, transform: 'translate(665px, 485px) rotate(216deg)', opacity: 0 },
      ])
    })
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
