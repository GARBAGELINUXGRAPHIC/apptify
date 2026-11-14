export type ServerFirePhase = 'delivery' | 'reveal' | 'explosion' | 'aftermath'

export interface ServerFireStory {
  setPaused(paused: boolean): void
  setReduced(reduced: boolean): void
  replay(): void
  seek(seconds: number): void
  getTime(): number
  dispose(): void
}

const TAU = Math.PI * 2
const EXPLOSION = 5.4
const AFTERMATH = 7.2
const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n))
const mix = (a: number, b: number, p: number) => a + (b - a) * p
const smooth = (p: number) => { const u = clamp(p); return u * u * (3 - 2 * u) }
const during = (t: number, a: number, b: number) => smooth((t - a) / (b - a))
type Point = [number, number]
const point = (a: Point, b: Point, p: number): Point => [mix(a[0], b[0], p), mix(a[1], b[1], p)]
const f = (value: number) => Number(value.toFixed(3))

export function createServerFireRenderer(svg: SVGSVGElement) {
  const parts = new Map<string, SVGElement>()
  svg.querySelectorAll<SVGElement>('[data-part]').forEach(el => parts.set(el.dataset.part!, el))
  const part = (name: string) => {
    const el = parts.get(name)
    if (!el) throw new Error(`Missing server-fire scene part: ${name}`)
    return el
  }
  const set = (name: string, key: string, value: string | number) => {
    const el = part(name), text = String(value)
    if (el.getAttribute(key) !== text) el.setAttribute(key, text)
  }
  const transform = (name: string, value: string) => set(name, 'transform', value)
  const opacity = (name: string, value: number) => set(name, 'opacity', f(clamp(value)))
  const smoke = [...svg.querySelectorAll<SVGElement>('[data-smoke]')]
  const embers = [...svg.querySelectorAll<SVGElement>('[data-ember]')]
  const debris = [...svg.querySelectorAll<SVGElement>('[data-debris]')]
  const leds = [...svg.querySelectorAll<SVGElement>('[data-led]')]
  const flames = [...svg.querySelectorAll<SVGElement>('[data-flame]')].map(el => ({
    el,
    outer: el.querySelector<SVGPathElement>('.flame-outer')!,
    inner: el.querySelector<SVGPathElement>('.flame-inner')!,
    core: el.querySelector<SVGPathElement>('.flame-core')!,
  }))
  const fireSources = [[734, 431, 27, 92], [780, 434, 32, 119], [822, 435, 25, 84], [700, 199, 29, 90], [746, 192, 33, 117], [791, 199, 28, 102], [836, 222, 22, 82]]

  function arm(side: 'back' | 'front', shoulder: Point, elbow: Point, hand: Point, angle: number) {
    const path = `M${f(shoulder[0])} ${f(shoulder[1])}L${f(elbow[0])} ${f(elbow[1])}L${f(hand[0])} ${f(hand[1])}`
    set(`arm-${side}-main`, 'd', path)
    set(`arm-${side}-fold`, 'd', `M${f(shoulder[0] + 2)} ${f(shoulder[1] - 4)}L${f(elbow[0] + 2)} ${f(elbow[1] - 4)}L${f(hand[0])} ${f(hand[1] - 3)}`)
    transform(`hand-${side}`, `translate(${f(hand[0])} ${f(hand[1])}) rotate(${f(angle)})`)
  }

  function flamePath(w: number, h: number, sway: number) {
    return `M${f(-w * .72)} 2C${f(-w * 1.1)} ${f(-h * .26)} ${f(-w * .34)} ${f(-h * .35)} ${f(-w * .56)} ${f(-h * .67)}L${f(-w * .1)} ${f(-h * .49)}Q${f(w * .36 + sway)} ${f(-h * .72)} ${f(sway)} ${f(-h)}C${f(w * 1.2 + sway)} ${f(-h * .71)} ${f(w * .27)} ${f(-h * .44)} ${f(w * .69)} ${f(-h * .59)}Q${f(w * 1.2)} ${f(-h * .19)} ${f(w * .64)} 2Z`
  }

  function render(seconds: number): ServerFirePhase {
    const t = Math.max(0, seconds)
    const phase: ServerFirePhase = t < 3.78 ? 'delivery' : t < EXPLOSION ? 'reveal' : t < AFTERMATH ? 'explosion' : 'aftermath'
    const approach = during(t, .18, 2.5)
    const walkX = mix(190, 524, approach)
    const stride = (walkX - 190) / 43 * Math.PI
    const walking = during(t, .1, .4) * (1 - during(t, 2.22, 2.53))
    const walkLift = Math.abs(Math.sin(stride)) * 4.6 * walking
    const backStep = during(t, EXPLOSION + .02, EXPLOSION + .79)
    const settle = during(t, EXPLOSION + .78, EXPLOSION + 1.37)
    const loop = Math.max(0, t - 6.55)
    const idle = during(t, 6.55, 7.25)
    const jump = t < EXPLOSION ? 0 : 32 * Math.sin(Math.PI * clamp((t - EXPLOSION) / .76))
    const monkeyX = walkX - 111 * backStep + 20 * settle
    const monkeyY = 536 - walkLift - jump
    const monkeyPlacement = `translate(${f(monkeyX)} ${f(monkeyY)})`
    transform('monkey', monkeyPlacement)
    transform('monkey-back', monkeyPlacement)
    transform('monkey-shadow', `translate(${f(monkeyX - 190)} 0)`)
    set('monkey-shadow', 'ry', f(12 * (1 - jump / 95)))
    set('monkey-shadow', 'opacity', f(.17 - jump / 420))
    const recoil = Math.sin(Math.PI * clamp((t - EXPLOSION) / 1.1))
    const breath = 1.1 * Math.sin(loop * TAU / 2.5) * idle
    const tremble = (Math.sin(loop * 18) * .4 + Math.sin(loop * 10.5) * .65) * idle
    const bodyAngle = Math.sin(stride) * 1.4 * walking - recoil * 10 + tremble * .55
    const upperPlacement = `translate(${f(tremble)} ${f(breath)}) rotate(${f(bodyAngle)} 0 -55)`
    transform('monkey-upper', upperPlacement)
    transform('monkey-back-upper', upperPlacement)
    transform('leg-back', `rotate(${f(Math.sin(stride) * 17 * walking - recoil * 13)} -20 -48)`)
    transform('leg-front', `rotate(${f(-Math.sin(stride) * 17 * walking + recoil * 20)} 20 -48)`)
    transform('tail', `rotate(${f(Math.sin(stride * .5) * 5 * walking + recoil * 18 + Math.sin(loop * 2.5) * 3 * idle)} -35 -68)`)

    const push = during(t, 2.64, 3.29)
    const release = during(t, 3.29, 3.94)
    const throwHands = during(t, EXPLOSION, EXPLOSION + .23)
    const grabHead = during(t, EXPLOSION + .25, EXPLOSION + .98)
    const shocked = during(t, EXPLOSION, EXPLOSION + .16)
    let backHand: Point = [31 + 54 * push, -78 - 10 * push]
    let frontHand: Point = [108 + 23 * push, -87 - 10 * push]
    let backElbow: Point = [-25 + 39 * push, -88 - 4 * push]
    let frontElbow: Point = [53 + 28 * push, -87 - 8 * push]
    backHand = point(backHand, [-43, -70], release)
    frontHand = point(frontHand, [48, -72], release)
    backElbow = point(backElbow, [-49, -99], release)
    frontElbow = point(frontElbow, [53, -100], release)
    backHand = point(backHand, [-94, -173], throwHands)
    frontHand = point(frontHand, [105, -168], throwHands)
    backElbow = point(backElbow, [-70, -135], throwHands)
    frontElbow = point(frontElbow, [80, -130], throwHands)

    const headAngle = (1 - shocked) * (2.5 * walking + during(t, 4, 4.35) * -3) + shocked * (-5 * recoil + Math.sin(loop * 3.1) * 1.7 * idle)
    const headX = Math.sin(loop * 7.2) * .55 * idle
    const headY = -2.2 * shocked + Math.sin(loop * 3.7) * .65 * idle
    transform('monkey-head', `translate(${f(headX)} ${f(headY)}) rotate(${f(headAngle)} 0 -188)`)
    const headAnchor = (x: number, y: number): Point => {
      const a = headAngle * Math.PI / 180
      return [x * Math.cos(a) - (y + 188) * Math.sin(a) + headX, x * Math.sin(a) + (y + 188) * Math.cos(a) - 188 + headY]
    }
    // Both palms follow the head's exact transform, including its idle motion.
    backHand = point(backHand, headAnchor(-42, -222), grabHead)
    frontHand = point(frontHand, headAnchor(42, -222), grabHead)
    backElbow = point(backElbow, [-88 - Math.sin(loop * 4) * 1.2 * idle, -165 + breath], grabHead)
    frontElbow = point(frontElbow, [88 + Math.sin(loop * 4) * 1.2 * idle, -165 + breath], grabHead)
    arm('back', [-32, -128], backElbow, backHand, mix(-5, -51 + headAngle, grabHead))
    arm('front', [33, -128], frontElbow, frontHand, mix(-12, 48 + headAngle, grabHead))
    const look = mix(3, 1.2 + Math.sin(loop * 1.1) * .7, shocked)
    set('pupil-left', 'cx', f(-20 + look)); set('pupil-right', 'cx', f(20 + look))
    set('pupil-left', 'cy', f(-193 - shocked)); set('pupil-right', 'cy', f(-193 - shocked))
    const blink = t > 8 ? Math.max(0, 1 - Math.abs((t % 4.9) - 4.7) / .11) : 0
    transform('eye-left', `translate(-20 -194) scale(1 ${f(1 - .89 * blink)}) translate(20 194)`)
    transform('eye-right', `translate(20 -194) scale(1 ${f(1 - .89 * blink)}) translate(-20 194)`)
    set('brow-left', 'd', `M-29 ${f(-211 - 5 * shocked)}Q-20 ${f(-216 - 7 * shocked)}-12 ${f(-212 - 5 * shocked)}`)
    set('brow-right', 'd', `M12 ${f(-212 - 5 * shocked)}Q21 ${f(-216 - 7 * shocked)} 29 ${f(-210 - 5 * shocked)}`)
    const mouthH = 7.4 * shocked
    set('mouth', 'd', shocked < .02 ? 'M-10-165Q0-157 11-164' : `M-9-163C-9 ${f(-160 - 2 * mouthH)} 9 ${f(-160 - 2 * mouthH)} 9-163C9 ${f(-154 + .6 * mouthH)}-9 ${f(-154 + .6 * mouthH)}-9-163Z`)
    set('mouth', 'fill', shocked > .02 ? '#624533' : 'none')
    set('mouth', 'stroke-width', mix(1.7, 1, shocked))
    opacity('tongue', shocked)
    opacity('panic-lines', shocked * (.35 + .2 * (1 + Math.sin(loop * 7))))
    const sweatAge = ((Math.max(0, t - 6) % 3.1) / 3.1)
    transform('sweat', `translate(${f(65 + sweatAge * 10)} ${f(-224 + sweatAge * 44)}) rotate(-19) scale(${f(.55 + sweatAge * .2)})`)
    opacity('sweat', t > 6 ? Math.sin(Math.PI * sweatAge) * .85 : 0)

    // The server's intake occludes the box; opacity never substitutes for insertion.
    const pull = during(t, 3.29, 3.8)
    const packetX = walkX + 75 + 54 * push + 70 * pull
    const packetY = 427 - walkLift - 9 * push
    transform('packet', `translate(${f(packetX)} ${f(packetY)}) rotate(${f(Math.sin(stride) * 1.2 * walking)})`)
    set('packet', 'visibility', t >= 3.8 ? 'hidden' : 'visible')

    const reveal = during(t, 3.78, 5.16)
    const scale = mix(1.8, 1, reveal)
    const cameraX = mix(walkX + 65, 500, reveal)
    const cameraY = mix(412, 330, reveal)
    const impactAge = Math.max(0, t - EXPLOSION)
    const cameraShake = t >= EXPLOSION && impactAge < .42 ? Math.sin(impactAge * 65) * 3.5 * (1 - impactAge / .42) : 0
    transform('camera', `translate(${f(500 - scale * cameraX + cameraShake)} ${f(330 - scale * cameraY + cameraShake * .3)}) scale(${f(scale)})`)

    const warning = during(t, 3.98, 5.38) * (t < EXPLOSION ? 1 : 0)
    const shake = Math.sin(t * 49) * warning * 1.8 + (t >= EXPLOSION ? Math.sin(impactAge * 39) * Math.exp(-impactAge * 7) * 3 : 0)
    transform('server', `translate(${f(shake)} ${f(shake * .3)})`)
    transform('port-rim', `translate(${f(shake)} ${f(shake * .3)})`)
    leds.forEach((led, i) => {
      led.setAttribute('fill', t >= EXPLOSION ? '#635b42' : warning > .08 ? '#dca357' : '#b8ce8b')
      led.setAttribute('opacity', String(t >= EXPLOSION ? .7 : .55 + .45 * (.5 + .5 * Math.sin(t * (warning ? 16 : 3.8) + i * 2.2))))
    })
    const lid = during(t, EXPLOSION, EXPLOSION + .24)
    const lidOvershoot = Math.sin(Math.PI * during(t, EXPLOSION, EXPLOSION + .72))
    transform('server-lid', `rotate(${f(-9 * lid - 13 * lidOvershoot)} 650 180)`)
    const door = during(t, EXPLOSION, EXPLOSION + .95)
    transform('server-door', `translate(${f(36 * door)} ${f(133 * door - Math.sin(Math.PI * door) * 43)}) rotate(${f(23 * door)} 780 380)`)
    opacity('server-damage', t >= EXPLOSION ? 1 : 0)
    transform('rack-upper', `rotate(${f(2.5 * lid)} 717 261)`)
    transform('rack-lower', `rotate(${f(-2 * lid)} 717 497)`)
    transform('wire-one', `rotate(${f(Math.sin(loop * 3.3) * 2 * idle)} 754 348)`)
    transform('wire-two', `rotate(${f(Math.sin(loop * 2.4 + 1) * 2 * idle)} 806 367)`)

    const blastP = clamp(impactAge / .52)
    const blastScale = t < EXPLOSION ? 0 : Math.sin(Math.PI * blastP) * (1.15 + blastP * .2)
    transform('blast', `translate(778 367) rotate(${f(blastP * 12)}) scale(${f(Math.max(.001, blastScale))})`)
    opacity('blast', t >= EXPLOSION && impactAge < .52 ? 1 : 0)
    const fireBuild = during(t, EXPLOSION + .12, EXPLOSION + .65)
    opacity('fire', fireBuild)
    opacity('fire-glow', fireBuild * (.17 + Math.sin(t * 5.1) * .03))
    flames.forEach(({ el, outer, inner, core }, i) => {
      const [x, y, w, h] = fireSources[i]
      const wave = t * (4.3 + i * .16) + i * 1.9
      const height = h * (.9 + .12 * Math.sin(wave) + .065 * Math.sin(wave * 1.71))
      const width = w * (.95 + .08 * Math.sin(wave + 1.2))
      const sway = Math.sin(wave * .81) * width * .33
      el.setAttribute('transform', `translate(${x} ${y}) scale(${f(.12 + fireBuild * .88)})`)
      outer.setAttribute('d', flamePath(width, height, sway))
      inner.setAttribute('d', flamePath(width * .58, height * .69, sway * .7))
      core.setAttribute('d', flamePath(width * .25, height * .35, sway * .3))
    })
    opacity('smoke', fireBuild)
    smoke.forEach((el, i) => {
      const age = t - EXPLOSION - .1 - i * .34
      const p = ((Math.max(0, age) % 3.9) / 3.9)
      const x = 719 + (i % 3) * 34 + p * (24 + i * 5) + Math.sin(p * 5 + i) * 9
      const y = 212 - p * 161
      el.setAttribute('transform', `translate(${f(x)} ${f(y)}) rotate(${f(p * 19 - 9)}) scale(${f(.27 + p * .67)})`)
      el.setAttribute('opacity', String(f(age < 0 ? 0 : Math.pow(Math.sin(Math.PI * p), 1.4) * .42)))
    })
    opacity('embers', fireBuild)
    embers.forEach((el, i) => {
      const age = Math.max(0, t - EXPLOSION - i * .11)
      const p = ((age % (1.9 + i * .08)) / (1.9 + i * .08))
      const x = 700 + (i % 4) * 40 + Math.sin(i * 2.1) * p * 40
      const y = (i % 2 ? 370 : 195) - p * (94 + i * 7)
      el.setAttribute('transform', `translate(${f(x)} ${f(y)}) rotate(${f(p * 120 + i * 30)}) scale(${f(1 - p * .65)})`)
      el.setAttribute('opacity', String(f(Math.sin(Math.PI * p) * .88)))
    })
    opacity('debris', t >= EXPLOSION ? 1 : 0)
    debris.forEach((el, i) => {
      const durations = [1.17, .96, 1.09, 1.22, .88]
      const targets = [[608, 549], [913, 553], [656, 575], [934, 528], [825, 580]]
      const p = clamp(impactAge / durations[i])
      const x = mix(752 + i * 13, targets[i][0], p)
      const y = mix(359 + i * 9, targets[i][1], p) - Math.sin(Math.PI * p) * (126 - i * 13)
      el.setAttribute('transform', `translate(${f(x)} ${f(y)}) rotate(${f(p * (i % 2 ? -385 : 309) + i * 31)})`)
    })
    svg.dataset.phase = phase
    return phase
  }
  return { render, still: () => render(8.35) }
}

export function createServerFireStory(
  svg: SVGSVGElement,
  options: { reduced?: boolean; onPhase?: (phase: ServerFirePhase) => void } = {},
): ServerFireStory {
  const renderer = createServerFireRenderer(svg)
  let time = options.reduced ? 8.35 : 0
  let reduced = !!options.reduced
  let paused = false
  let disposed = false
  let raf = 0
  let last: number | undefined
  let lastPhase: ServerFirePhase | undefined
  function draw() {
    const phase = renderer.render(time)
    if (phase !== lastPhase) { lastPhase = phase; options.onPhase?.(phase) }
  }
  function frame(now: number) {
    raf = 0
    if (disposed || paused || reduced) { last = undefined; return }
    if (last !== undefined) time += Math.min((now - last) / 1000, .08)
    last = now
    // The story clock never wraps: only the aftermath contains periodic motion.
    draw()
    raf = requestAnimationFrame(frame)
  }
  function sync() {
    if (raf) cancelAnimationFrame(raf)
    raf = 0; last = undefined
    if (!disposed && !paused && !reduced) raf = requestAnimationFrame(frame)
  }
  draw(); sync()
  return {
    setPaused(value) { paused = value; sync() },
    setReduced(value) {
      if (reduced === value) return
      reduced = value
      if (value) time = Math.max(time, 8.35)
      draw(); sync()
    },
    replay() { time = reduced ? 8.35 : 0; draw(); sync() },
    seek(seconds) { if (!Number.isFinite(seconds)) return; time = Math.max(0, seconds); draw(); sync() },
    getTime() { return time },
    dispose() { disposed = true; if (raf) cancelAnimationFrame(raf); raf = 0; last = undefined },
  }
}
