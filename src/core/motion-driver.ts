export interface MotionSample { value: number[]; velocity: number[]; target: number[] }
interface Spring extends MotionSample {
  time: number; frequency: number; epsilon: number[]; update: (value: number[]) => void
  bounds?: Array<[number, number] | null>
  done: boolean; resolve: (completed: boolean) => void
}
interface Track { animations: Animation[]; done: boolean }

export function sampleSpring(value: number, velocity: number, target: number, seconds: number, frequency: number) {
  const distance = value - target, tangent = velocity + frequency * distance, decay = Math.exp(-frequency * seconds)
  return { value: target + (distance + tangent * seconds) * decay, velocity: (velocity - frequency * tangent * seconds) * decay }
}

/** Each channel owns its lifetime. Retargeting preserves position and velocity. */
export class MotionDriver {
  private springs = new Map<string, Spring>()
  private tracks = new Map<string, Track>()
  private owners = new Map<string, object>()
  private frame: number | null = null
  constructor(private changed: () => void = () => {}) {}
  has(key: string) { return Boolean(this.owners.has(key) || this.springs.get(key) && !this.springs.get(key)!.done || this.tracks.get(key) && !this.tracks.get(key)!.done) }
  get active() { return this.owners.size > 0 || [...this.springs.values(), ...this.tracks.values()].some(track => !track.done) }
  prepare(key: string) {
    this.cancel(key)
    const owner = {}
    this.owners.set(key, owner); this.changed()
    return () => this.owners.get(key) === owner
  }
  velocityX(key: string, element: HTMLElement) {
    const animation = this.tracks.get(key)?.animations.find(animation => (animation.effect as KeyframeEffect | null)?.target === element)
    const duration = Number(animation?.effect?.getTiming().duration), time = Number(animation?.currentTime)
    if (!animation || !Number.isFinite(duration) || !Number.isFinite(time) || typeof DOMMatrixReadOnly === 'undefined') return 0
    const running = animation.playState === 'running', from = Math.max(0, time - 1), to = Math.min(duration, time + 1)
    if (to <= from) return 0
    animation.pause()
    animation.currentTime = from
    const x = new DOMMatrixReadOnly(getComputedStyle(element).transform).m41
    animation.currentTime = to
    const velocity = (new DOMMatrixReadOnly(getComputedStyle(element).transform).m41 - x) / (to - from)
    animation.currentTime = time
    if (running) animation.play()
    return velocity
  }
  sample(key: string): MotionSample | undefined {
    const spring = this.springs.get(key)
    if (!spring) return
    this.advance(spring, performance.now())
    return { value: [...spring.value], velocity: [...spring.velocity], target: [...spring.target] }
  }
  shift(key: string, offset: number[]) {
    const spring = this.springs.get(key)
    if (!spring) return
    this.advance(spring, performance.now())
    spring.value = spring.value.map((value, index) => value + offset[index])
    spring.target = spring.target.map((value, index) => value + offset[index])
    spring.update(spring.value)
  }
  to(key: string, from: number[], target: number[], update: (value: number[]) => void, options: { frequency?: number; epsilon?: number[]; immediate?: boolean; velocity?: number[]; bounds?: Array<[number, number] | null> } = {}) {
    const live = this.sample(key)
    this.cancel(key)
    if (options.immediate) { update(target); return Promise.resolve(true) }
    const promise = new Promise<boolean>(resolve => {
      this.springs.set(key, { value: live?.value ?? [...from], velocity: options.velocity ?? live?.velocity ?? from.map(() => 0), target: [...target],
        time: performance.now(), frequency: options.frequency ?? 24, epsilon: options.epsilon ?? from.map(() => .01), bounds: options.bounds, update, done: false, resolve })
    })
    this.schedule(); this.changed()
    return promise
  }
  async animate(key: string, entries: Array<{ element: HTMLElement; from: Keyframe; to: Keyframe }>, duration: number, easing: string) {
    this.cancel(key)
    if (!duration) return true
    const track: Track = { done: false, animations: entries.filter(entry => typeof entry.element.animate === 'function').map(({ element, from, to }) => element.animate([from, to], { duration, easing, fill: 'both' })) }
    this.tracks.set(key, track); this.changed()
    await Promise.all(track.animations.map(animation => animation.finished.catch(() => undefined)))
    if (this.tracks.get(key) !== track) return false
    track.done = true; this.changed()
    return true
  }
  cancel(key?: string) {
    if (key === undefined) {
      for (const channel of new Set([...this.springs.keys(), ...this.tracks.keys(), ...this.owners.keys()])) this.cancel(channel)
      if (this.frame !== null) cancelAnimationFrame(this.frame)
      this.frame = null
      return
    }
    this.owners.delete(key)
    const spring = this.springs.get(key)
    if (spring) { this.advance(spring, performance.now()); this.springs.delete(key); if (!spring.done) spring.resolve(false) }
    const track = this.tracks.get(key)
    if (track) { this.tracks.delete(key); track.animations.forEach(animation => animation.cancel()) }
    this.changed()
  }
  finish() {
    for (const spring of this.springs.values()) {
      spring.value = [...spring.target]; spring.velocity.fill(0); spring.update(spring.value)
      if (!spring.done) { spring.done = true; spring.resolve(true) }
    }
    for (const track of this.tracks.values()) track.animations.forEach(animation => animation.finish())
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.frame = null; this.changed()
  }
  private advance(spring: Spring, now: number) {
    if (spring.done) return
    const seconds = Math.max(0, now - spring.time) / 1000
    const samples = spring.value.map((value, index) => sampleSpring(value, spring.velocity[index], spring.target[index], seconds, spring.frequency))
    spring.value = samples.map(sample => sample.value); spring.velocity = samples.map(sample => sample.velocity); spring.time = now
    spring.bounds?.forEach((bounds, index) => {
      if (bounds && (spring.value[index] < bounds[0] || spring.value[index] > bounds[1])) {
        spring.value[index] = Math.max(bounds[0], Math.min(bounds[1], spring.value[index])); spring.velocity[index] = 0
      }
    })
    const settled = spring.value.every((value, index) => Math.abs(value - spring.target[index]) <= spring.epsilon[index] && Math.abs(spring.velocity[index]) <= spring.epsilon[index] * spring.frequency)
    if (settled) { spring.value = [...spring.target]; spring.velocity.fill(0); spring.done = true }
    spring.update(spring.value)
    if (settled) { spring.resolve(true); this.changed() }
  }
  private schedule() {
    if (this.frame !== null) return
    this.frame = requestAnimationFrame(now => {
      this.frame = null
      for (const spring of this.springs.values()) this.advance(spring, now)
      if ([...this.springs.values()].some(spring => !spring.done)) this.schedule()
    })
  }
}
