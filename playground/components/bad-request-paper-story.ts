/** Deterministic one-shot arrival and reveal, followed only by the cat's idle loop. */
export const BAD_REQUEST_TIMING = Object.freeze({ arrival: 3.8, reveal: 4.25, idle: 6.6, cycle: 6.2 })

type Point = { x: number; y: number }
export interface BadRequestFrame {
  phase: 'follow' | 'stopped' | 'reveal' | 'confused'
  distance: number
  packetX: number
  packetAngle: number
  camera: { scale: number; x: number; y: number }
  headAngle: number
  paw: Point
  armControl1: Point
  armControl2: Point
  pawAngle: number
  scratching: boolean
  blink: number
  tailAngle: number
  questionY: number
  questionAngle: number
}
export interface BadRequestStory {
  play(): void
  pause(): void
  restart(): void
  seek(seconds: number): void
  setReducedMotion(reduced: boolean): void
  setActive(active: boolean): void
  dispose(): void
  readonly time: number
}

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const mix = (a: number, b: number, p: number) => a + (b - a) * p
const smooth = (v: number) => { const p = clamp(v); return p * p * (3 - 2 * p) }
const smoother = (v: number) => { const p = clamp(v); return p * p * p * (p * (p * 6 - 15) + 10) }
const pointMix = (a: Point, b: Point, p: number): Point => ({ x: mix(a.x, b.x, p), y: mix(a.y, b.y, p) })
function rotate(p: Point, angle: number, pivot: Point): Point {
  const a = angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a)
  return { x: pivot.x + (p.x - pivot.x) * c - (p.y - pivot.y) * s,
    y: pivot.y + (p.x - pivot.x) * s + (p.y - pivot.y) * c }
}
function travelled(t: number): number {
  const end = BAD_REQUEST_TIMING.arrival, acceleration = .4, braking = .65, brakeAt = end - braking
  t = Math.max(0, Math.min(end, t))
  const area = t < acceleration ? t * t / (2 * acceleration)
    : t < brakeAt ? t - acceleration / 2
    : t - acceleration / 2 - (t - brakeAt) ** 2 / (2 * braking)
  return 522 * area / (end - (acceleration + braking) / 2)
}

/** Pure sampling is shared by playback and the included regression tests. No DOM required. */
export function sampleBadRequest(seconds: number, reduced = false): BadRequestFrame {
  const { arrival, reveal, idle, cycle } = BAD_REQUEST_TIMING
  const t = reduced ? idle : Math.max(0, Number.isFinite(seconds) ? seconds : 0)
  const distance = travelled(t), packetX = 70 + distance
  const zoom = smoother((t - reveal) / (idle - reveal))
  const z = 2.65
  const camera = { scale: mix(z, 1, zoom), x: mix(600 - z * packetX, 0, zoom), y: mix(367 - z * 339, 0, zoom) }
  const settled = Math.max(0, t - idle), p = settled % cycle
  let headAngle = p < .75 ? mix(-4, -9, smooth(p / .75))
    : p < 3.35 ? -9 : p < 4.25 ? mix(-9, 5, smooth((p - 3.35) / .9))
    : p < 5 ? 5 : mix(5, -4, smooth((p - 5) / (cycle - 5)))
  if (t < idle) headAngle = -4
  if (reduced) headAngle = -7
  const lift = reduced || t < idle ? 0 : smooth((p - .85) / .65) * (1 - smooth((p - 2.8) / .7))
  const rubEnvelope = smooth((p - 1.5) / .12) * (1 - smooth((p - 2.65) / .15))
  const rub = reduced ? 0 : Math.sin((p - 1.5) * Math.PI * 2 * 3.4) * 4.2 * rubEnvelope
  // Contact is calculated in the tilted head's coordinates, so the paw cannot float away.
  const contact = rotate({ x: 91 + rub * .18, y: -278 + rub }, headAngle, { x: 0, y: -190 })
  const paw = pointMix({ x: 76, y: -68 }, contact, lift)
  // Lift around the cheek instead of folding the wrist back through the shoulder.
  paw.x += 54 * Math.sin(Math.PI * lift)
  const dx = paw.x - 60, dy = paw.y + 153
  const bend = mix(44, 70, lift) * dy * dy / (dx * dx + dy * dy)
  // Linear y handles prevent a cusp; a horizontal reach becomes a straight arm.
  const armControl1 = { x: 60 + dx / 3 + bend, y: -153 + dy / 3 }
  const armControl2 = { x: 60 + 2 * dx / 3 + bend, y: -153 + 2 * dy / 3 }
  const blinkAt = t % 4.9
  const blink = !reduced && blinkAt > 3.55 && blinkAt < 3.77
    ? 1 - .94 * Math.sin((blinkAt - 3.55) / .22 * Math.PI) ** 2 : 1
  // One small inertial settle at arrival; the parcel stays still for the rest of the visit.
  const afterStop = t - arrival
  const packetAngle = afterStop > 0 && afterStop < .38
    ? 1.8 * Math.sin(afterStop / .38 * Math.PI * 2) * (1 - afterStop / .38) ** 2 : 0
  return {
    phase: t < arrival ? 'follow' : t < reveal ? 'stopped' : t < idle ? 'reveal' : 'confused',
    distance, packetX, packetAngle, camera, headAngle, paw, armControl1, armControl2,
    pawAngle: lift * (headAngle - 12), scratching: lift > .98 && rubEnvelope > .1 && rub > 0,
    blink, tailAngle: reduced ? 0 : 3 * Math.sin(t * .95),
    questionY: reduced ? 0 : 3 * Math.sin(settled * 1.7),
    questionAngle: reduced ? -3 : -3 + 3 * Math.sin(settled * 1.1),
  }
}

export function createBadRequestStory(svg: SVGSVGElement, initiallyReduced = false): BadRequestStory {
  const doc = svg.ownerDocument, win = doc.defaultView
  if (!win) throw new Error('The bad request scene must be mounted in a browser document.')
  function part(name: string): SVGElement {
    const node = svg.querySelector<SVGElement>(`[data-part="${name}"]`)
    if (!node) throw new Error(`Bad request scene is missing ${name}.`)
    return node
  }
  const camera = part('camera'), packet = part('parcel'), pitch = part('parcel-pitch')
  const normal = part('normal-parcels'), ribs = part('belt-ribs'), roller = part('roller')
  const head = part('head'), paw = part('paw'), outline = part('arm-outline'), fill = part('arm-fill')
  const leftEye = part('eye-left'), rightEye = part('eye-right'), tail = part('tail')
  const question = part('question'), marks = part('scratch-marks')
  const n = (v: number) => Math.round(v * 1000) / 1000
  const attributes = new WeakMap<SVGElement, Map<string, string>>()
  function attribute(el: SVGElement, name: string, value: string) {
    let previous = attributes.get(el)
    if (!previous) { previous = new Map(); attributes.set(el, previous) }
    if (previous.get(name) === value) return
    previous.set(name, value)
    el.setAttribute(name, value)
  }
  const transform = (el: SVGElement, value: string) => attribute(el, 'transform', value)
  let elapsed = initiallyReduced ? BAD_REQUEST_TIMING.idle : 0
  let reduced = initiallyReduced, paused = false, active = true, visible = true, disposed = false
  let raf = 0, lastTick: number | undefined
  let phase = ''

  function paint() {
    const f = sampleBadRequest(elapsed, reduced), c = f.camera
    transform(camera, `matrix(${n(c.scale)} 0 0 ${n(c.scale)} ${n(c.x)} ${n(c.y)})`)
    transform(packet, `translate(${n(f.packetX)} 421)`)
    transform(pitch, `rotate(${n(f.packetAngle)} 0 0)`)
    transform(normal, `translate(${n(f.distance)} 0)`)
    transform(ribs, `translate(${n(f.distance % 24)} 0)`)
    transform(roller, `rotate(${n(f.distance / 21 * 180 / Math.PI)})`)
    transform(head, `rotate(${n(f.headAngle)} 0 -190)`)
    transform(tail, `rotate(${n(f.tailAngle)} 64 -22)`)
    transform(question, `translate(0 ${n(f.questionY)}) rotate(${n(f.questionAngle)} 3 12)`)
    transform(leftEye, `scale(1 ${n(f.blink)})`)
    transform(rightEye, `scale(1 ${n(f.blink)})`)
    const a = f.armControl1, b = f.armControl2, p = f.paw
    const d = `M60 -153 C${n(a.x)} ${n(a.y)} ${n(b.x)} ${n(b.y)} ${n(p.x)} ${n(p.y)}`
    attribute(outline, 'd', d); attribute(fill, 'd', d)
    transform(paw, `translate(${n(p.x)} ${n(p.y)}) rotate(${n(f.pawAngle)})`)
    // Marks live in cat-local space, just like the arm.
    transform(marks, `translate(${n(p.x + 23)} ${n(p.y - 13)})`)
    attribute(marks, 'visibility', f.scratching ? 'visible' : 'hidden')
    if (phase !== f.phase) { phase = f.phase; svg.setAttribute('data-phase', phase) }
  }
  function running() { return !disposed && !paused && !reduced && active && visible && !doc.hidden }
  function stop() { if (raf) win!.cancelAnimationFrame(raf); raf = 0; lastTick = undefined }
  function tick(now: number) {
    raf = 0
    if (!running()) { lastTick = undefined; return }
    if (lastTick !== undefined) elapsed += Math.min(.1, Math.max(0, (now - lastTick) / 1000))
    lastTick = now
    paint()
    raf = win!.requestAnimationFrame(tick)
  }
  function sync() {
    if (running()) { if (!raf) raf = win!.requestAnimationFrame(tick) }
    else stop()
  }
  const visibilityChanged = () => sync()
  doc.addEventListener('visibilitychange', visibilityChanged)
  const observer = typeof IntersectionObserver === 'undefined' ? undefined : new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting)
    sync()
  }, { threshold: 0 })
  observer?.observe(svg)
  paint(); sync()
  return {
    get time() { return elapsed },
    play() { if (!disposed) { paused = false; sync() } },
    pause() { paused = true; sync() },
    restart() { if (disposed) return; elapsed = reduced ? BAD_REQUEST_TIMING.idle : 0; lastTick = undefined; paint(); sync() },
    seek(seconds) { if (disposed) return; elapsed = Math.max(0, Number.isFinite(seconds) ? seconds : 0); lastTick = undefined; paint() },
    setReducedMotion(value) {
      if (disposed || reduced === value) return
      reduced = value
      // Returning from a static accessibility pose never replays the camera entrance.
      if (value) elapsed = Math.max(elapsed, BAD_REQUEST_TIMING.idle)
      paint(); sync()
    },
    setActive(value) { active = value; sync() },
    dispose() { if (disposed) return; disposed = true; stop(); observer?.disconnect(); doc.removeEventListener('visibilitychange', visibilityChanged) },
  }
}
