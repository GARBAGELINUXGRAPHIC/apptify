/** Shared by the Vue scene and the dependency-free HTML preview. */
export const PAYMENT_TIMING = Object.freeze({ revealStart: 4.75, revealEnd: 7.2, intro: 7.5, loop: 9 })

type Point = { x: number; y: number }
type Pose = { hand: Point; angle: number; inhale: number; exhale: number; shake: number; bagSwing: number; breath: number; phase: number }
export type PaymentStory = { setPaused(value: boolean): void; dispose(): void }

const TAU = Math.PI * 2
const clamp = (v: number) => Math.max(0, Math.min(1, v))
const ease = (v: number) => { const t = clamp(v); return t * t * (3 - 2 * t) }
const between = (t: number, a: number, b: number) => ease((t - a) / (b - a))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const envelope = (t: number, a: number, b: number, c: number, d: number) => between(t, a, b) * (1 - between(t, c, d))
const fmt = (value: number) => Number(value.toFixed(3))

function poseAt(time: number): Pose {
  const intro = time < PAYMENT_TIMING.intro
  const phase = intro ? time : (time - PAYMENT_TIMING.intro) % PAYMENT_TIMING.loop
  const raise = intro ? envelope(phase, .55, 1.45, 2.75, 3.55) : envelope(phase, 2.6, 3.45, 4.7, 5.55)
  const inhale = intro ? envelope(phase, 1.5, 1.8, 2.5, 2.75) : envelope(phase, 3.5, 3.8, 4.45, 4.7)
  const exhale = intro ? envelope(phase, 3.05, 3.24, 3.9, 4.18) : envelope(phase, 5, 5.2, 5.85, 6.15)
  const shakeWeight = intro ? 0 : envelope(phase, .4, .52, 1.16, 1.3)
  const shakePhase = (phase - .4) * TAU / .45
  const shake = Math.sin(shakePhase) * shakeWeight
  const bagSwing = Math.sin(shakePhase - .6) * shakeWeight
  return {
    hand: { x: lerp(386, 454, raise), y: lerp(319, 295, raise) },
    angle: lerp(-15, 0, raise), inhale, exhale, shake, bagSwing,
    breath: Math.sin(time * TAU / 4.5) * 1.05 - inhale * 1.1,
    phase,
  }
}

function transformPoint(origin: Point, angle: number, x: number, y: number): Point {
  const a = angle * Math.PI / 180
  return { x: origin.x + x * Math.cos(a) - y * Math.sin(a), y: origin.y + x * Math.sin(a) + y * Math.cos(a) }
}

function elbowFor(shoulder: Point, wrist: Point): Point {
  const upper = 68, lower = 79
  const dx = wrist.x - shoulder.x, dy = wrist.y - shoulder.y
  const distance = Math.max(Math.abs(upper - lower) + .01, Math.min(upper + lower - .01, Math.hypot(dx, dy)))
  const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy)
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance)
  const height = Math.sqrt(Math.max(0, upper * upper - along * along))
  return { x: shoulder.x + along * ux + height * uy, y: shoulder.y + along * uy - height * ux }
}

function limb(a: Point, b: Point, wa: number, wb: number): string {
  const d = Math.hypot(b.x - a.x, b.y - a.y)
  const px = -(b.y - a.y) / d, py = (b.x - a.x) / d
  const n = (p: Point, width: number) => `${fmt(p.x + px * width)} ${fmt(p.y + py * width)}`
  return `M${n(a, wa)}L${n(b, wb)}Q${fmt(b.x + (b.x - a.x) / d * wb)} ${fmt(b.y + (b.y - a.y) / d * wb)} ${n(b, -wb)}L${n(a, -wa)}Q${fmt(a.x - (b.x - a.x) / d * wa)} ${fmt(a.y - (b.y - a.y) / d * wa)} ${n(a, wa)}Z`
}

function curve(points: Point[]): string {
  let path = `M${fmt(points[0].x)} ${fmt(points[0].y)}`
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[Math.max(0, i - 1)], b = points[i]
    const c = points[i + 1], d = points[Math.min(points.length - 1, i + 2)]
    path += `C${fmt(b.x + (c.x - a.x) / 6)} ${fmt(b.y + (c.y - a.y) / 6)} ${fmt(c.x - (d.x - b.x) / 6)} ${fmt(c.y - (d.y - b.y) / 6)} ${fmt(c.x)} ${fmt(c.y)}`
  }
  return path
}

function smokeAt(time: number, age: number): Point {
  const originPose = poseAt(Math.max(0, time - age))
  const tip = transformPoint(originPose.hand, originPose.angle, -20, -5.3)
  return {
    x: tip.x - age * 9 + Math.sin(age * 4.1 + time * TAU / PAYMENT_TIMING.loop) * age * 4.8,
    y: tip.y + originPose.breath - age * 30 - age * age * 5,
  }
}

function smokeRibbon(points: Point[]): string {
  const left: Point[] = [], right: Point[] = []
  for (let i = 0; i < points.length; i++) {
    const before = points[Math.max(0, i - 1)], after = points[Math.min(points.length - 1, i + 1)]
    const length = Math.hypot(after.x - before.x, after.y - before.y) || 1
    const width = i === 0 ? .7 : Math.sin(Math.PI * i / (points.length - 1)) * 6.8
    const dx = -(after.y - before.y) / length * width, dy = (after.x - before.x) / length * width
    left.push({ x: points[i].x + dx, y: points[i].y + dy })
    right.push({ x: points[i].x - dx, y: points[i].y - dy })
  }
  return curve(left) + curve(right.reverse()).replace(/^M/, 'L') + 'Z'
}

export function createPaymentRenderer(svg: SVGSVGElement) {
  function part(name: string): SVGElement {
    const el = svg.querySelector<SVGElement>(`[data-part="${name}"]`)
    if (!el) throw new Error(`Payment scene is missing ${name}`)
    return el
  }
  const camera = part('camera'), upperBody = part('upper-body'), hand = part('smoke-hand')
  const upperArm = part('smoke-upper-arm'), forearm = part('smoke-forearm'), armLight = part('smoke-arm-light')
  const moneyHand = part('money-hand'), moneySack = part('money-sack'), moneyCord = part('money-cord')
  const moneyForearm = part('money-forearm'), moneyLight = part('money-arm-light')
  const foot = part('crossed-foot'), tail = part('tail'), mouth = part('mouth'), ember = part('ember')
  const emberHalo = part('ember-halo'), emberCore = part('ember-core')
  const ribbon = part('smoke-ribbon'), smokeSource = part('smoke-source'), exhaleSource = part('exhale-source')
  const wisps = [...svg.querySelectorAll<SVGPathElement>('[data-wisp]')]
  const puffs = [...svg.querySelectorAll<SVGPathElement>('[data-puff]')]
  const set = (el: SVGElement, key: string, value: string | number) => el.setAttribute(key, String(value))

  function render(seconds: number, intro = true, still = false) {
    const t = Math.max(0, seconds) + (intro ? 0 : PAYMENT_TIMING.intro)
    const pose = poseAt(t)
    const reveal = still || !intro ? 1 : between(t, PAYMENT_TIMING.revealStart, PAYMENT_TIMING.revealEnd)
    const scale = lerp(2.65, 1, reveal)
    set(camera, 'transform', `translate(${fmt(lerp(-825, 0, reveal))} ${fmt(lerp(-316, 0, reveal))}) scale(${fmt(scale)})`)
    set(svg, 'data-story', still ? 'still' : t < PAYMENT_TIMING.revealStart ? 'close-up' : t < PAYMENT_TIMING.revealEnd ? 'pull-back' : 'loop')
    set(upperBody, 'transform', `translate(0 ${fmt(pose.breath)})`)
    set(hand, 'transform', `translate(${fmt(pose.hand.x)} ${fmt(pose.hand.y)}) rotate(${fmt(pose.angle)})`)

    const shoulder = { x: 466, y: 335 }
    const wrist = transformPoint(pose.hand, pose.angle, 0, 23)
    const elbow = elbowFor(shoulder, wrist)
    set(upperArm, 'd', limb(shoulder, elbow, 14.5, 12.5))
    set(forearm, 'd', limb(elbow, wrist, 12.5, 9))
    set(armLight, 'd', `M${fmt(elbow.x - 2)} ${fmt(elbow.y - 7)}L${fmt(wrist.x - 2)} ${fmt(wrist.y - 4)}`)

    const shake = still ? 0 : pose.shake
    const bagSwing = still ? 0 : pose.bagSwing
    const resting = still ? 0 : (1 - between(t, 6.35, 7.5)) * 39
    const moneyX = 638 + shake * 8.5
    const moneyY = 338 + resting - Math.abs(shake) * 2.2
    set(moneyHand, 'transform', `translate(${fmt(moneyX)} ${fmt(moneyY)})`)
    set(moneySack, 'transform', `translate(13 -1) rotate(${fmt(bagSwing * 18)})`)
    set(moneyCord, 'transform', `rotate(${fmt(-bagSwing * 8)} 10 5)`)
    const rightWrist = { x: moneyX, y: moneyY + 18 }
    set(moneyForearm, 'd', limb({ x: 592, y: 381 }, rightWrist, 11, 9))
    set(moneyLight, 'd', `M592 378L${fmt(rightWrist.x - 1)} ${fmt(rightWrist.y - 5)}`)

    const sway = still ? 0 : Math.sin((t - PAYMENT_TIMING.intro) * TAU / PAYMENT_TIMING.loop)
    set(foot, 'transform', `translate(553 516) rotate(${fmt(sway * 1.5)})`)
    set(tail, 'transform', `rotate(${fmt(sway * .4)} 469 415)`)
    set(mouth, 'd', pose.exhale > .1 ? 'M-12 48Q-6 44-2 48Q-6 52-12 48Z' : pose.inhale > .2 ? 'M-12 48Q-5 46 1 47' : 'M-12 48Q-4 44 2 47Q9 50 17 44')
    set(ember, 'fill', `rgb(${Math.round(lerp(189, 255, pose.inhale))},${Math.round(lerp(121, 181, pose.inhale))},${Math.round(lerp(83, 86, pose.inhale))})`)
    set(emberHalo, 'opacity', fmt(still ? .04 : .08 + pose.inhale * .88))
    set(emberCore, 'opacity', fmt(still ? .08 : .1 + pose.inhale * .9))

    const smokePoints = Array.from({ length: 28 }, (_, i) => smokeAt(t, i * .1))
    set(ribbon, 'd', smokeRibbon(smokePoints))
    set(ribbon, 'opacity', still ? 0 : .16)
    set(smokeSource, 'd', curve(smokePoints.slice(0, 10)))
    set(smokeSource, 'opacity', still ? 0 : .38)

    for (let i = 0; i < wisps.length; i++) {
      const birth = Math.floor(t / .25) * .25 - i * .25
      const age = t - birth
      if (still || age > 2.9) { set(wisps[i], 'opacity', 0); continue }
      const origin = smokeAt(t, age)
      const opacity = between(age, 0, .25) * (1 - between(age, .9, 2.9)) * .14
      const turn = Math.sin(birth * TAU / PAYMENT_TIMING.loop) * 12
      set(wisps[i], 'd', 'M0 6C-8-1-8-8-2-14C5-21 9-22 5-30C2-36-5-35-3-42C10-40 15-32 13-24C11-16 1-13 3-6Q5 2 0 6Z')
      set(wisps[i], 'transform', `translate(${fmt(origin.x)} ${fmt(origin.y)}) rotate(${fmt(turn)}) scale(${fmt(.48 + age * .38)})`)
      set(wisps[i], 'opacity', fmt(opacity))
    }

    set(exhaleSource, 'd', `M488 ${fmt(293 + pose.breath)}Q475 ${fmt(290 + pose.breath)} 462 ${fmt(283 + pose.breath)}`)
    set(exhaleSource, 'opacity', still ? 0 : fmt(pose.exhale * .34))

    let exhaleStart = 3.08
    if (t >= PAYMENT_TIMING.intro) {
      const cycle = Math.floor((t - PAYMENT_TIMING.intro) / PAYMENT_TIMING.loop)
      const current = PAYMENT_TIMING.intro + cycle * PAYMENT_TIMING.loop + 5.04
      const previous = current - PAYMENT_TIMING.loop
      exhaleStart = t >= current ? current : previous >= PAYMENT_TIMING.intro ? previous : 3.08
    }
    for (let i = 0; i < puffs.length; i++) {
      const birth = exhaleStart + i * .11
      const age = t - birth
      if (still || age < 0 || age > 2.85) { set(puffs[i], 'opacity', 0); continue }
      const originPose = poseAt(birth)
      const progress = age / 2.85
      const opacity = between(age, 0, .15) * (1 - between(age, .8, 2.85)) * .16
      set(puffs[i], 'd', 'M0 0C-14-8-21-3-31-11C-42-20-30-30-48-36C-68-44-80-26-94-39C-112-53-95-70-112-77C-89-76-90-51-77-48C-59-43-51-53-38-41C-23-27-38-18-21-11C-9-6-4-7 0 0Z')
      set(puffs[i], 'transform', `translate(${fmt(488 - age * 34)} ${fmt(293 + originPose.breath - age * 11 - age * age * 7)}) rotate(${fmt(-progress * 7 + Math.sin(i * 1.9) * 7)}) scale(${fmt(.18 + progress * 1.5)})`)
      set(puffs[i], 'opacity', fmt(opacity))
    }
  }
  return { render, still: () => render(0, false, true) }
}

export function createPaymentStory(svg: SVGSVGElement, intro = true): PaymentStory {
  const renderer = createPaymentRenderer(svg)
  let elapsed = 0, frame = 0, previous: number | undefined
  let paused = false, disposed = false
  renderer.render(0, intro)
  function tick(now: number) {
    if (paused || disposed) return
    if (previous !== undefined) elapsed += (now - previous) / 1000
    previous = now
    renderer.render(elapsed, intro)
    frame = requestAnimationFrame(tick)
  }
  function setPaused(value: boolean) {
    if (disposed || value === paused) return
    paused = value
    cancelAnimationFrame(frame)
    previous = undefined
    if (!paused) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  return { setPaused, dispose() { disposed = true; cancelAnimationFrame(frame) } }
}
