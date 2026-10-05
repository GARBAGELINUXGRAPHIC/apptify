type Point = { x: number; y: number }

const INTRO_DURATION = 5400;
const LOOP_DURATION = 6400;
const CONTACT_TIME = 3000;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const n = (v: number) => Number(v.toFixed(4));
const xy = (p: Point) => `${n(p.x)} ${n(p.y)}`;
const add = (a: Point, b: Point, amount = 1) => ({ x: a.x + b.x * amount, y: a.y + b.y * amount });
const between = (a: Point, b: Point, t: number) => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) });
function track(keys: Array<[number, number]>, t: number) {
    if (t <= keys[0][0])
        return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
        if (t <= keys[i][0]) {
            const [a, v] = keys[i - 1], [b, w] = keys[i];
            return mix(v, w, smooth(clamp((t - a) / (b - a))));
        }
    }
    return keys[keys.length - 1][1];
}
function pointTrack(keys: Array<[number, number, number]>, t: number) {
    return { x: track(keys.map(k => [k[0], k[1]]), t), y: track(keys.map(k => [k[0], k[2]]), t) };
}
function rotate(p: Point, angle: number) {
    const a = angle * Math.PI / 180;
    return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) };
}
function curve(a: Point, control: Point, b: Point, t: number) {
    return between(between(a, control, t), between(control, b, t), t);
}
function normal(a: Point, b: Point) {
    const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: -(b.y - a.y) / d, y: (b.x - a.x) / d };
}

function capsule(a: Point, b: Point, wa: number, wb: number) {
    const u = normal(a, b), v = { x: u.y, y: -u.x };
    return `M${xy(add(a, u, wa))}L${xy(add(b, u, wb))}Q${xy(add(b, v, wb))} ${xy(add(b, u, -wb))}L${xy(add(a, u, -wa))}A${wa} ${wa} 0 0 0 ${xy(add(a, u, wa))}Z`;
}
function strip(a: Point, b: Point, wa: number, wb: number) {
    const u = normal(a, b);
    return `M${xy(add(a, u, wa))}L${xy(add(b, u, wb))}L${xy(add(b, u, -wb))}L${xy(add(a, u, -wa))}Z`;
}

function elbow(a: Point, b: Point, upper: number, lower: number, bend: number) {
    const raw = Math.hypot(b.x - a.x, b.y - a.y);
    const d = clamp(raw, Math.abs(upper - lower) + .001, upper + lower - .001);
    const direction = { x: (b.x - a.x) / (raw || 1), y: (b.y - a.y) / (raw || 1) };
    const along = (upper * upper - lower * lower + d * d) / (2 * d);
    const height = Math.sqrt(Math.max(0, upper * upper - along * along));
    return { x: a.x + direction.x * along - direction.y * height * bend, y: a.y + direction.y * along + direction.x * height * bend };
}

function bentLimb(a: Point, joint: Point, b: Point, wa: number, wj: number, wb: number) {
    const u = normal(a, joint), v = normal(joint, b);
    const corner = add(add(joint, u, wj), v, wj);
    const inner = add(add(joint, u, -wj), v, -wj);
    return `M${xy(add(a, u, wa))}L${xy(add(joint, u, wj))}Q${xy(corner)} ${xy(add(joint, v, wj))}L${xy(add(b, v, wb))}L${xy(add(b, v, -wb))}L${xy(add(joint, v, -wj))}Q${xy(inner)} ${xy(add(joint, u, -wj))}L${xy(add(a, u, -wa))}Z`;
}

export function createForbiddenRenderer(art: SVGSVGElement) {
    const parts = new Map<string, SVGElement>();
    art.querySelectorAll<SVGElement>('[data-part]').forEach(el => parts.set(el.dataset.part!, el));
    const part = (name: string) => {
        const el = parts.get(name);
        if (!el)
            throw new Error(`Forbidden scene is missing data-part="${name}"`);
        return el;
    };
    const attr = (name: string, key: string, value: string | number) => part(name).setAttribute(key, String(value));
    const transform = (name: string, value: string) => attr(name, 'transform', value);
    const opacity = (name: string, value: number) => attr(name, 'opacity', n(clamp(value)));
    const frame = art.closest<HTMLElement>('.meal-scene');
    function eatingArm(p: number, resting: boolean) {

        const plate = { x: 790, y: 282 };
        const mouth = { x: 777, y: 2 };
        let tip = plate, angle = 172;

        const bite = resting || p < 1.96 || p >= 4.05;
        if (!resting) {
            if (p >= .35 && p < 1.7) {
                const u = smoother(clamp((p - .35) / 1.35));
                tip = curve(plate, { x: 690, y: 155 }, mouth, u);
                angle = mix(172, 335, u);
            }
            else if (p >= 1.7 && p < 2.3) {
                tip = mouth;
                angle = 335;
            }
            else if (p >= 2.3 && p < 3.8) {
                const u = smoother(clamp((p - 2.3) / 1.5));
                tip = curve(mouth, { x: 690, y: 155 }, plate, u);
                angle = mix(335, 172, u);
            }
        }
        const offset = rotate({ x: 0, y: -62 }, angle);
        const wrist = { x: tip.x - offset.x, y: tip.y - offset.y };
        const shoulder = { x: 859, y: 115 };
        const joint = elbow(shoulder, wrist, 114, 141, -1);
        attr('eat-upper', 'd', capsule(shoulder, joint, 23, 19));
        attr('eat-sleeve', 'd', capsule(shoulder, between(shoulder, joint, .62), 29, 25));
        attr('eat-cuff', 'd', strip(between(shoulder, joint, .58), between(shoulder, joint, .68), 25.4, 25));

        attr('eat-forearm', 'd', capsule(joint, wrist, 19, 11.5));
        transform('eat-hand', `translate(${xy(wrist)}) rotate(${n(angle)})`);
        opacity('fork-bite', bite ? 1 : 0);
    }
    function blockingArm(p: number, resting: boolean) {

        const upper = 135, forearm = 100, handReach = 20;
        const distal = forearm + handReach;
        const shoulder = { x: 668, y: 98 };
        const target = add({ x: 539, y: 316 }, rotate({ x: 0, y: -10 }, -15));
        const dx = target.x - shoulder.x, dy = target.y - shoulder.y;
        const contactBend = Math.acos(clamp((dx * dx + dy * dy - upper * upper - distal * distal) / (2 * upper * distal), -1, 1));
        const contactShoulder = (Math.atan2(-dx, dy) + Math.atan2(distal * Math.sin(contactBend), upper + distal * Math.cos(contactBend))) * 180 / Math.PI;
        const extendedBend = contactBend * 180 / Math.PI;
        let shoulderAngle = 5, flexion = 56;
        if (!resting) {
            if (p >= 2 && p < 2.76) {
                const u = smoother((p - 2) / .76);
                shoulderAngle = mix(5, contactShoulder + 15, u);
                flexion = mix(56, 40, u);
            }
            else if (p >= 2.76 && p < 2.82) {
                shoulderAngle = contactShoulder + 15;
                flexion = 40;
            }
            else if (p >= 2.82 && p <= 3.18) {

                shoulderAngle = mix(contactShoulder + 15, contactShoulder - 15, smooth((p - 2.82) / .36));
                flexion = p <= 3
                    ? mix(40, extendedBend, smooth(clamp((p - 2.82) / .18)))
                    : mix(extendedBend, 25, smooth(clamp((p - 3) / .18)));
            }
            else if (p > 3.18 && p < 4.25) {
                const u = smoother((p - 3.18) / 1.07);
                shoulderAngle = mix(contactShoulder - 15, 5, u);
                flexion = mix(25, 56, u);
            }
        }

        transform('deny-upper-group', `rotate(${n(shoulderAngle)})`);
        transform('deny-forearm-group', `translate(0 ${upper}) rotate(${n(-flexion)})`);
    }
    function draw(milliseconds: number, still = false) {
        const ms = Number.isFinite(milliseconds) ? Math.max(0, milliseconds) : 0;
        const t = ms / 1000;
        const intro = ms < INTRO_DURATION && !still;
        const p = still ? CONTACT_TIME / 1000 : Math.max(0, (ms - INTRO_DURATION) % LOOP_DURATION) / 1000;

        transform('dog', 'translate(354 567)');
        transform('dog-shadow', 'translate(0 0)');
        attr('dog-shadow', 'ry', 11);
        const reveal = intro ? smoother(clamp((t - 2.3) / 2.6)) : 1;
        transform('camera', `translate(${n(mix(-118, 0, reveal))} ${n(mix(-396, 0, reveal))}) scale(${n(mix(1.7, 1, reveal))})`);
        const rumble = intro ? Math.sin(Math.PI * clamp((t - .65) / 1.65)) ** 2 : 0;
        const vibration = rumble * Math.sin(t * 30);
        transform('belly', `translate(-43 -78) scale(${n(1 + vibration * .048)} ${n(1 - vibration * .022)}) translate(43 78)`);
        opacity('hunger', rumble * (.7 + Math.sin(t * 22) * .3));
        transform('hunger', `translate(${n(vibration * 1.6)} 0)`);
        opacity('tongue', 0);
        const paw = intro ? { x: 51, y: -8 } : pointTrack([
            [0, 51, -8], [1, 51, -8], [1.45, 84, -98], [2.05, 144, -201],
            [2.7, 185, -251], [3, 185, -251], [3.14, 164, -214],
            [3.46, 101, -103], [3.98, 51, -8], [6.4, 51, -8],
        ], p);
        const shoulder = { x: 20, y: -155 };
        const joint = elbow(shoulder, paw, 95, 112, 1);
        attr('dog-arm', 'd', bentLimb(shoulder, joint, paw, 17, 13, 10));
        attr('dog-arm-fold', 'd', `M${xy(add(shoulder, { x: 5, y: 0 }))}L${xy(add(joint, { x: 4, y: 0 }))}L${xy(add(paw, { x: 3, y: -1 }))}`);
        const pawAngle = intro ? 0 : track([[0, 0], [1, 0], [2.7, -15], [3, -15], [3.2, 25], [3.98, 0], [6.4, 0]], p);
        transform('dog-paw', `translate(${xy(paw)}) rotate(${n(pawAngle)})`);
        const headAngle = intro ? track([[0, 6], [.65, 6], [1.35, 15], [2.3, 10], [3.8, -5], [5.4, -5]], t) : track([[0, -5], [1.1, -5], [2.7, -12], [3, -12], [3.3, 9], [3.85, 12], [4.8, 5], [5.8, -5], [6.4, -5]], p);
        transform('dog-head', `rotate(${n(headAngle)} 19 -196)`);
        const earAngle = intro ? vibration * 2 : track([[0, 0], [3, 0], [3.16, -12], [3.37, 8], [3.66, -3], [4, 0], [6.4, 0]], p);
        transform('ear', `rotate(${n(earAngle)} 7 -245)`);
        const wag = still || intro ? 0 : Math.sin(p * Math.PI * 4 / 6.4) * track([[0, 3], [2.65, 5], [3.15, 0], [4.4, 0], [5.5, 3], [6.4, 3]], p);
        transform('tail', `rotate(${n(wag)} -61 -75)`);
        const blink = still ? 1 : intro ? track([[0, 1], [1.15, 1], [1.24, .08], [1.34, 1], [5.4, 1]], t) : track([[0, 1], [3.03, 1], [3.11, .08], [3.27, 1], [4.65, 1], [4.75, .1], [4.86, 1], [6.4, 1]], p);
        transform('dog-eye', `translate(58 -241) scale(1 ${n(blink)}) translate(-58 241)`);
        const disappointment = intro ? 0 : track([[0, 0], [3, 0], [3.6, 1], [4.8, 1], [5.8, 0], [6.4, 0]], p);
        attr('dog-mouth', 'd', `M72 -205 Q84 ${n(-212 - disappointment * 4)} 99 -207`);
        transform('brow', `rotate(${n(intro ? 0 : track([[0, 0], [2.9, 0], [3.65, 14], [4.9, 10], [5.8, 0], [6.4, 0]], p))} 58 -254)`);

        eatingArm(p, intro || still);
        blockingArm(p, intro);
        opacity('tap', intro || still ? 0 : track([[0, 0], [3, 0], [3.055, .8], [3.19, 0], [6.4, 0]], p));
        if (frame) {

            frame.dataset.phase = still ? 'blocked' : intro ? t < 2.3 ? 'hungry' : 'reveal' : p < 1 ? 'waiting' : p < 3 ? 'reaching' : p < 3.3 ? 'denied' : 'recovering';
        }
    }
    return { draw, still: () => draw(INTRO_DURATION + CONTACT_TIME, true) };
}

export interface ForbiddenPaperStory { setPaused(paused: boolean): void; dispose(): void }

export function createForbiddenPaperStory(art: SVGSVGElement, intro: boolean, onSettled: () => void): ForbiddenPaperStory {
  const render = createForbiddenRenderer(art)
  let elapsed = intro ? 0 : INTRO_DURATION
  let settled = !intro
  let paused = false
  let disposed = false
  let request = 0
  let last: number | undefined
  function tick(now: number) {
    request = 0
    if (disposed || paused) return
    if (last !== undefined) elapsed += Math.min(80, Math.max(0, now - last))
    last = now
    render.draw(elapsed)
    if (!settled && elapsed >= INTRO_DURATION) { settled = true; onSettled() }
    request = requestAnimationFrame(tick)
  }
  function stop() { cancelAnimationFrame(request); request = 0; last = undefined }
  render.draw(elapsed)
  request = requestAnimationFrame(tick)
  return {
    setPaused(value) {
      if (disposed || paused === value) return
      paused = value
      stop()
      if (!paused) request = requestAnimationFrame(tick)
    },
    dispose() { disposed = true; stop() },
  }
}
