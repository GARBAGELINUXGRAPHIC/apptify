export const TIMEOUT_TIMING = Object.freeze({ arrival: 3.25, intro: 5.8, period: 7.8, taps: [1.42, 1.85, 2.28] as readonly number[] })

export interface TimeoutSnapshot {
  seconds: number
  phase: number
  story: 'intro' | 'loop' | 'static'
  foxX: number
  question: number
  reach: number
  contact: number
  wrist: { x: number; y: number }
}
export interface TimeoutStory {
  setPaused(paused: boolean): void
  seek(seconds: number): TimeoutSnapshot
  getState(): TimeoutSnapshot
  dispose(): void
}
const clamp = (value: number) => Math.max(0, Math.min(1, value))
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t) }
const ramp = (t: number, a: number, b: number) => smooth((t - a) / (b - a))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const n = (value: number) => Math.round(value * 1000) / 1000
const pulse = (t: number, start: number, end: number) => t > start && t < end ? Math.sin(Math.PI * (t - start) / (end - start)) ** 2 : 0

function elbow(sx: number, sy: number, wx: number, wy: number) {
  const dx = wx - sx, dy = wy - sy, d = Math.max(1, Math.hypot(dx, dy))
  const h = Math.sqrt(Math.max(0, 65 ** 2 - (Math.min(d, 130) / 2) ** 2))
  return { x: (sx + wx) / 2 - dy / d * h, y: (sy + wy) / 2 + dx / d * h }
}

export function createTimeoutRenderer(svg: SVGSVGElement) {
  const names = ['fox', 'fox-shadow', 'tail', 'back-leg', 'front-leg', 'back-foot', 'front-foot', 'upper-body', 'head', 'eye', 'brow', 'knock-arm', 'arm-fold', 'knock-paw', 'question', 'knock-rings'] as const
  const parts = Object.fromEntries(names.map(name => {
    const element = svg.querySelector<SVGElement>(`[data-part="${name}"]`)
    if (!element) throw new Error(`Missing timeout scene part: ${name}`)
    return [name, element]
  })) as Record<typeof names[number], SVGElement>
  const cache = new Map<string, string>()
  const attr = (part: typeof names[number], key: string, value: string | number) => {
    const text = String(value), id = part + ':' + key
    if (cache.get(id) === text) return
    cache.set(id, text)
    parts[part].setAttribute(key, text)
  }

  function render(seconds: number, still = false): TimeoutSnapshot {
    const t = Math.max(0, seconds)
    const intro = t < TIMEOUT_TIMING.intro
    const phase = intro ? 0 : (t - TIMEOUT_TIMING.intro) % TIMEOUT_TIMING.period
    const walk = clamp(t / TIMEOUT_TIMING.arrival)
    const travel = walk < .8 ? walk / .9 : (.8 + .2 * (1 - (1 - (walk - .8) / .2) ** 2) / 2) / .9
    const foxX = mix(153, 462, clamp(travel))
    const gait = t * Math.PI * 2 / .66
    const walking = 1 - ramp(t, 2.85, TIMEOUT_TIMING.arrival)
    const beat = phase / TIMEOUT_TIMING.period * Math.PI * 2
    const bob = -3.2 * Math.abs(Math.sin(gait)) * walking
    const breath = intro ? 0 : -.65 * (1 - Math.cos(beat * 2))
    const upperY = bob + breath
    attr('fox', 'transform', `translate(${n(foxX)} 542)`)
    attr('fox-shadow', 'cx', n(foxX - 7))
    attr('fox-shadow', 'rx', n(73 - 3 * walking * Math.abs(Math.sin(gait))))
    attr('upper-body', 'transform', `translate(0 ${n(upperY)})`)
    attr('tail', 'transform', `translate(0 ${n(upperY * .45)}) rotate(${n(-2 + walking * 4 * Math.sin(gait - .7) + (1 - walking) * 1.6 * Math.sin(beat))} -32 -76)`)

    for (const [side, offset, hipX, footX] of [['back', Math.PI, -24, -33], ['front', 0, 25, 36]] as const) {
      const stride = Math.sin(gait + offset) * 21 * walking
      const lift = Math.max(0, Math.cos(gait + offset)) * 11 * walking
      const x = footX + stride, y = -6 - lift
      const kneeX = mix(hipX, x, .52) - 7
      const kneeY = -33 + bob * .4 - lift * .4
      attr(`${side}-leg`, 'd', `M${hipX} ${n(-63 + upperY)} Q${n(kneeX)} ${n(kneeY)} ${n(x)} ${n(y - 3)}`)
      attr(`${side}-foot`, 'transform', `translate(${n(x)} ${n(y)}) rotate(${n(-6 * lift / 11)})`)
    }

    const peer = intro ? ramp(t, 3.45, 4.0) * (1 - ramp(t, 4.9, 5.6)) : pulse(phase, 3.4, 5.1) * .6
    const reach = intro ? 0 : ramp(phase, .48, 1.04) * (1 - ramp(phase, 2.63, 3.23))
    let contact = 0
    if (!intro) for (const tap of TIMEOUT_TIMING.taps) contact = Math.max(contact, pulse(phase, tap - .16, tap + .16))
    const resting = { x: 89, y: -97 }
    const wrist = { x: mix(resting.x, 119 + contact * 11, reach), y: mix(resting.y, -190 - upperY, reach) }
    const joint = elbow(25, -139, wrist.x, wrist.y)
    attr('knock-arm', 'd', `M25 -139 Q${n(joint.x)} ${n(joint.y)} ${n(wrist.x)} ${n(wrist.y)}`)
    attr('arm-fold', 'd', `M23 -143 Q${n(joint.x - 3)} ${n(joint.y - 4)} ${n(wrist.x - 3)} ${n(wrist.y - 4)}`)
    attr('knock-paw', 'transform', `translate(${n(wrist.x)} ${n(wrist.y)}) rotate(${n(-8 * (1 - reach))})`)
    attr('head', 'transform', `translate(${n(peer * 3)} 0) rotate(${n(-4.2 * peer - 1.4 * reach + .7 * Math.sin(beat))} 6 -173)`)
    const blink = intro ? pulse(t, 3.6, 3.82) : Math.max(pulse(phase, 3.48, 3.69), pulse(phase, 6.72, 6.94))
    attr('eye', 'transform', `translate(40 -218) scale(1 ${n(1 - blink * .94)})`)
    attr('brow', 'd', `M32 ${n(-230 - peer * 3)} l13 ${n(1 - peer * 2)}`)

    const question = intro ? ramp(t, 4.05, 4.35) * (1 - ramp(t, 5.4, 5.8)) : ramp(phase, 4.8, 5.15) * (1 - ramp(phase, 6.6, 7.1))
    const pop = question * (1 + .055 * Math.sin(question * Math.PI))
    attr('question', 'transform', `translate(${n(foxX + 56)} ${n(232 - 2 * Math.sin(beat) * question)}) scale(${n(pop)})`)
    attr('knock-rings', 'opacity', n(contact > .82 ? (contact - .82) / .18 * .75 : 0))
    attr('knock-rings', 'transform', `translate(0 ${n(-contact)})`)
    const story = still ? 'static' : intro ? 'intro' : 'loop'
    if (svg.dataset.story !== story) svg.dataset.story = story
    return { seconds: t, phase, story, foxX, question, reach, contact, wrist: { x: foxX + wrist.x, y: 542 + upperY + wrist.y } }
  }
  return { render, still: () => render(TIMEOUT_TIMING.intro + 5.65, true) }
}

export function createTimeoutStory(svg: SVGSVGElement, intro = true): TimeoutStory {
  const renderer = createTimeoutRenderer(svg)
  let elapsed = intro ? 0 : TIMEOUT_TIMING.intro
  let state = renderer.render(elapsed)
  let raf = 0, last = 0, paused = false, disposed = false
  function tick(now: number) {
    raf = 0
    if (disposed || paused) return
    if (last) elapsed += Math.min((now - last) / 1000, .08)
    last = now
    state = renderer.render(elapsed)
    raf = requestAnimationFrame(tick)
  }
  function sync() {
    svg.dataset.playing = String(!paused && !disposed)
    if (paused || disposed) {
      if (raf) cancelAnimationFrame(raf)
      raf = 0; last = 0
    } else if (!raf) { last = 0; raf = requestAnimationFrame(tick) }
  }
  sync()
  return {
    setPaused(value) { paused = value; sync() },
    seek(seconds) { elapsed = Math.max(0, seconds); last = 0; state = renderer.render(elapsed); return state },
    getState: () => state,
    dispose() { disposed = true; sync() },
  }
}
