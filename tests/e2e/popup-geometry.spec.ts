import { test, expect, type Page, type Locator } from '@playwright/test'

const panelSelector = '.apple-field-menu:visible, .apple-date-menu:visible, .apple-popover:visible'
async function geometry(panel: Locator) {
  return panel.evaluate(element => {
    const el = element as HTMLElement, rect = el.getBoundingClientRect(), css = getComputedStyle(el)
    const matrix = new DOMMatrix(css.transform)
    return { side: el.dataset.placement, x: rect.left - matrix.m41, y: rect.top - matrix.m42, right: rect.right - matrix.m41, bottom: rect.bottom - matrix.m42, width: rect.width, height: rect.height, dx: matrix.m41, dy: matrix.m42, clip: css.clipPath, opacity: Number(css.opacity) }
  })
}
async function closeFrames(page: Page, anchorSelector: string, scrollDuringLeave = false) {
  return page.evaluate(async ({ panelSelector, anchorSelector, scrollDuringLeave }) => {
    const panel = document.querySelector<HTMLElement>(panelSelector.replaceAll(':visible',''))!
    // Color panels persist while hidden; pick the visible one explicitly.
    const el = Array.from(document.querySelectorAll<HTMLElement>(panelSelector.replaceAll(':visible',''))).find(p => getComputedStyle(p).display !== 'none') ?? panel
    const anchor = document.querySelector<HTMLElement>(anchorSelector)!
    const frames = []
    let scrolled = false
    ;(document.activeElement ?? document.body).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    for (let i = 0; i < 24; i++) {
      await new Promise(requestAnimationFrame)
      if (!el.isConnected || getComputedStyle(el).display === 'none') break
      const css = getComputedStyle(el), m = new DOMMatrix(css.transform), p = el.getBoundingClientRect(), a = anchor.getBoundingClientRect()
      frames.push({ side: el.dataset.placement, dx: m.m41, dy: m.m42, top: p.top - m.m42, bottom: p.bottom - m.m42, anchorTop: a.top, anchorBottom: a.bottom, clip: css.clipPath, opacity: Number(css.opacity) })
      if (scrollDuringLeave && !scrolled && Math.abs(m.m41) + Math.abs(m.m42) > .01) {
        window.scrollBy({ top: 400, behavior: 'instant' }); scrolled = true
      }
    }
    return frames
  }, { panelSelector, anchorSelector, scrollDuringLeave })
}

const demos = [
  ['select', '#apple-select [role=combobox]'],
  ['autocomplete', '#apple-autocomplete [role=combobox]'],
  ['cascader', '#apple-cascader [role=combobox]'],
  ['date', '#apple-date-picker .apple-field__icon'],
  ['color', '#apple-color-picker .apple-color-picker'],
  ['popover', '#apple-popover .apple-popover-anchor button'],
  ['menu', '#apple-menu .apple-popover-anchor button'],
] as const

for (const width of [390, 1280]) for (const [kind, selector] of demos) {
  test(`real components: ${kind} at ${width}px flips then closes toward its current anchor`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/components')
    const trigger = page.locator(selector).first()
    await trigger.evaluate(el => window.scrollBy({ top: el.getBoundingClientRect().top - 160, behavior: 'instant' }))
    await page.waitForTimeout(350)
    await trigger.evaluate(el => { (el as HTMLElement).focus({ preventScroll: true }); (el as HTMLElement).click() })
    const panel = page.locator(panelSelector).last()
    await expect(panel).toBeVisible()
    await page.waitForTimeout(400)
    let p = await geometry(panel), a = await trigger.boundingBox()
    expect(p.side).toBe('bottom'); expect(p.y).toBeGreaterThan(a!.y + a!.height)
    await trigger.evaluate(el => window.scrollBy({ top: el.getBoundingClientRect().top - 800, behavior: 'instant' }))
    await page.waitForTimeout(100)
    p = await geometry(panel); a = await trigger.boundingBox()
    expect(p.side).toBe('top'); expect(p.bottom).toBeLessThan(a!.y)
    expect(p.x).toBeGreaterThanOrEqual(7.9); expect(p.right).toBeLessThanOrEqual(width - 7.9)
    await page.screenshot({ path: info.outputPath(`${kind}-${width}-flipped.png`) })
    const frames = await closeFrames(page, selector)
    expect(frames.length).toBeGreaterThan(2)
    for (const f of frames) {
      expect(f.side).toBe('top'); expect(f.dy).toBeGreaterThanOrEqual(-.01)
      expect(f.bottom).toBeLessThan(f.anchorTop)
    }
    expect(frames.some(f => f.dy > .2)).toBe(true)
    await expect(panel).toBeHidden()
  })
}

test('real Popover keeps following scroll and changes direction during leave', async ({ page }, info) => {
  await page.setViewportSize({ width: 1280, height: 700 }); await page.goto('/components')
  const selector = '#apple-popover .apple-popover-anchor button', trigger = page.locator(selector)
  await trigger.evaluate(el => window.scrollBy({ top: el.getBoundingClientRect().top - 600, behavior: 'instant' }))
  await page.waitForTimeout(350); await trigger.evaluate(el => (el as HTMLElement).click()); await page.waitForTimeout(400)
  const frames = await closeFrames(page, selector, true)
  await info.attach('closing-frames', { body: JSON.stringify(frames, null, 2), contentType: 'application/json' })
  expect(frames.some(f => f.side === 'top' && f.dy > 0)).toBe(true)
  const flipped = frames.filter(f => f.side === 'bottom')
  expect(flipped.length).toBeGreaterThan(2)
  for (const f of flipped) { expect(f.dy).toBeLessThanOrEqual(0); expect(Math.abs(f.top - f.anchorBottom - 8)).toBeLessThan(1) }
})

test('a leaving field keeps live placement until the retained DOM is removed',async({page})=>{
  await page.setViewportSize({width:1280,height:700});await page.goto('/components')
  const selector='#apple-select [role=combobox]',trigger=page.locator(selector)
  await trigger.evaluate(el=>{window.scrollBy({top:el.getBoundingClientRect().top-600,behavior:'instant'});(el as HTMLElement).focus({preventScroll:true});(el as HTMLElement).click()})
  await page.waitForTimeout(500)
  const frames=await closeFrames(page,selector,true)
  expect(frames.some(f=>f.side==='top'&&f.dy>0), JSON.stringify(frames)).toBe(true)
  const flipped=frames.filter(f=>f.side==='bottom')
  expect(flipped.length).toBeGreaterThan(1)
  for(const f of flipped){expect(f.dy).toBeLessThanOrEqual(0);expect(Math.abs(f.top-f.anchorBottom-8)).toBeLessThan(1)}
  await expect(page.locator('.apple-field-menu:visible')).toHaveCount(0)
})

for (const side of ['bottom', 'top', 'left', 'right']) test(`Popover ${side}: actual opposite geometry and exit vector`, async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 650 })
  await page.goto(`/tests/e2e/fixtures/popup-geometry.html?side=${side}`)
  const points: Record<string, [number, number]> = { bottom: [250, 570], top: [250, 12], left: [12, 250], right: [560, 250] }
  await page.evaluate(point => (window as any).popupHarness.move(...point), points[side]!)
  await page.getByRole('button', { name: 'Open', exact: true }).click()
  const panel = page.locator('.apple-popover'); await page.waitForTimeout(350)
  const p = await geometry(panel), a = (await page.locator('.apple-popover-anchor').boundingBox())!
  const opposite = { bottom: 'top', top: 'bottom', left: 'right', right: 'left' }[side]
  expect(p.side).toBe(opposite)
  if (opposite === 'top') expect(p.bottom).toBeLessThan(a.y)
  if (opposite === 'bottom') expect(p.y).toBeGreaterThan(a.y + a.height)
  if (opposite === 'left') expect(p.right).toBeLessThan(a.x)
  if (opposite === 'right') expect(p.x).toBeGreaterThan(a.x + a.width)
  await page.keyboard.press('Escape'); await page.waitForTimeout(50)
  const leaving = await geometry(panel)
  if (opposite === 'top') expect(leaving.dy).toBeGreaterThan(0)
  if (opposite === 'bottom') expect(leaving.dy).toBeLessThan(0)
  if (opposite === 'left') expect(leaving.dx).toBeGreaterThan(0)
  if (opposite === 'right') expect(leaving.dx).toBeLessThan(0)
})

for(const side of ['left','right'])test(`an open ${side} Popover tracks horizontal layout movement before closing`,async({page})=>{
  await page.setViewportSize({width:800,height:650});await page.goto(`/tests/e2e/fixtures/popup-geometry.html?side=${side}`)
  await page.getByRole('button',{name:'Open',exact:true}).click();await page.waitForTimeout(350)
  const panel=page.locator('.apple-popover');expect((await geometry(panel)).side).toBe(side)
  await page.evaluate(x=>(window as any).popupHarness.move(x,180),side==='left'?12:560);await page.waitForTimeout(80)
  const actual=await geometry(panel),anchor=(await page.locator('.apple-popover-anchor').boundingBox())!
  if(side==='left'){expect(actual.side).toBe('right');expect(actual.x).toBeGreaterThan(anchor.x+anchor.width)}
  else{expect(actual.side).toBe('left');expect(actual.right).toBeLessThan(anchor.x)}
  await page.keyboard.press('Escape');await page.waitForTimeout(45)
  const closing=await geometry(panel)
  expect(side==='left'?closing.dx<0:closing.dx>0).toBe(true)
})

test('nested scrollport and live content use viewport space without oscillation', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 800 }); await page.goto('/tests/e2e/fixtures/popup-geometry.html?scroll')
  await page.evaluate(() => (window as any).popupHarness.move(120, 320)); await page.getByRole('button', { name: 'Open' }).click(); await page.waitForTimeout(350)
  const panel = page.locator('.apple-popover')
  expect((await geometry(panel)).side).toBe('bottom')
  await page.locator('.scrollport').evaluate(el => { el.scrollTop = 260 })
  await expect(panel).toHaveAttribute('data-placement','bottom')
  await page.evaluate(() => (window as any).popupHarness.grow(700)); await page.waitForTimeout(400)
  const samples = []
  for (let i = 0; i < 6; i++) { samples.push(await geometry(panel)); await page.waitForTimeout(20) }
  expect(new Set(samples.map(p => p.side)).size).toBe(1)
  for (const p of samples) { expect(p.y).toBeGreaterThanOrEqual(8); expect(p.bottom).toBeLessThanOrEqual(792) }
})

test('transformed provider, teleported child menu, rapid reversals and motion policies', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 750 }); await page.goto('/tests/e2e/fixtures/popup-geometry.html?nested&transform')
  const trigger = page.getByRole('button', { name: 'Open', exact: true })
  await trigger.click(); await page.waitForTimeout(350)
  let p = await geometry(page.locator('.apple-popover').first()), a = (await trigger.boundingBox())!
  expect(Math.abs(p.y - a.y - a.height - 8)).toBeLessThan(1)
  await page.getByRole('button', { name: 'Child menu' }).click(); await expect(page.getByRole('menu')).toBeVisible()
  await page.keyboard.press('Escape'); await expect(page.getByRole('menu')).toBeHidden()
  for (let i=0;i<6;i++) { await page.evaluate(value => (window as any).popupHarness.toggle(value), i%2===1); await page.waitForTimeout(40) }
  await expect(page.getByRole('dialog', { name:'Open' })).toHaveCount(1)
  await page.evaluate(() => (window as any).popupHarness.motion('none')); await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name:'Open' })).toHaveCount(0)
  await page.evaluate(() => (window as any).popupHarness.motion('reduced')); await trigger.click()
  await expect(page.getByRole('dialog', { name:'Open' })).toBeVisible()
  expect(await page.getByRole('dialog', { name:'Open' }).evaluate(el => el.getAnimations().every(animation => Number(animation.effect?.getTiming().duration ?? 0) <= 80))).toBe(true)
})

test('real Tooltip flips below a top-edge anchor and exits upward', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 }); await page.goto('/components')
  const trigger = page.locator('#apple-tooltip .apple-popover-anchor button')
  await trigger.evaluate(el => { window.scrollBy({ top: el.getBoundingClientRect().top - 250, behavior: 'instant' }); (el as HTMLElement).focus({ preventScroll: true }) })
  const panel = page.getByRole('tooltip'); await expect(panel).toBeVisible(); await page.waitForTimeout(350)
  expect((await geometry(panel)).bottom).toBeLessThan((await trigger.boundingBox())!.y)
  await trigger.evaluate(el => window.scrollBy({ top: el.getBoundingClientRect().top - 18, behavior: 'instant' })); await page.waitForTimeout(80)
  expect((await geometry(panel)).y).toBeGreaterThan((await trigger.boundingBox())!.y + 44)
  const frames = await closeFrames(page, '#apple-tooltip .apple-popover-anchor button')
  expect(frames.some(f => f.side === 'bottom' && f.dy < 0)).toBe(true)
})

for (const width of [390,1280]) test(`real Time picker switches format, flips and closes at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/components')
  const precision = page.locator('#apple-date-picker [role=combobox]')
  await precision.click(); await page.getByRole('option',{name:'时分',exact:true}).click()
  const trigger = page.locator('#apple-date-picker .apple-field__icon')
  await trigger.evaluate(el => { window.scrollBy({top:el.getBoundingClientRect().top-150,behavior:'instant'}); (el as HTMLElement).focus({preventScroll:true}); (el as HTMLElement).click() })
  const panel = page.locator('.apple-date-menu'); await expect(panel).toBeVisible(); await page.waitForTimeout(350)
  expect((await geometry(panel)).side).toBe('bottom')
  await trigger.evaluate(el => window.scrollBy({top:el.getBoundingClientRect().top-800,behavior:'instant'})); await page.waitForTimeout(80)
  expect((await geometry(panel)).bottom).toBeLessThan((await trigger.boundingBox())!.y)
  const frames = await closeFrames(page,'#apple-date-picker .apple-field__icon')
  expect(frames.some(f=>f.dy>0 && f.clip==='none' && f.opacity<1)).toBe(true)
})

test('real inline Navibar flips above the bar, closes from that edge and resets on resize', async ({ page }) => {
  await page.setViewportSize({width:390,height:900}); await page.goto('/components')
  const bar=page.locator('#apple-navibar .apple-navibar__bar'), trigger=bar.locator('.apple-navibar__toggle'), panel=bar.locator('.apple-navibar__menu')
  await trigger.evaluate(el=>{window.scrollBy({top:el.getBoundingClientRect().top-160,behavior:'instant'});(el as HTMLElement).click()}); await page.waitForTimeout(350)
  expect((await geometry(panel)).side).toBe('bottom')
  await trigger.evaluate(el=>window.scrollBy({top:el.getBoundingClientRect().top-800,behavior:'instant'})); await page.waitForTimeout(80)
  const p=await geometry(panel), b=(await bar.boundingBox())!
  expect(p.side).toBe('top');expect(Math.abs(p.bottom-b.y)).toBeLessThan(1)
  await trigger.evaluate(el=>(el as HTMLElement).click());await page.waitForTimeout(50)
  const closing=await geometry(panel)
  expect(closing.clip).toBe('none')
  expect(closing.opacity).toBeGreaterThan(0)
  expect(closing.opacity).toBeLessThan(1)
  await expect(panel).toBeHidden()
  await trigger.evaluate(el=>(el as HTMLElement).click()); await page.waitForTimeout(50)
  await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(350)
  expect((await geometry(panel)).right).toBeLessThanOrEqual(1432)
  await page.setViewportSize({width:390,height:900});await page.waitForTimeout(80)
  expect((await geometry(panel)).right).toBeLessThanOrEqual(382)
  await trigger.evaluate(el=>(el as HTMLElement).click());await expect(panel).toBeHidden()
})

for (const kind of ['select','autocomplete','cascader','date','time','color']) test(`${kind} escapes nested scrollports, follows viewport resize, and reverses without reflow`,async({page})=>{
  await page.setViewportSize({width:600,height:800});await page.goto(`/tests/e2e/fixtures/popup-geometry.html?kind=${kind}&scroll`)
  await page.evaluate(()=>(window as any).popupHarness.move(50,335))
  const selector=kind==='color'?'.apple-color-picker':kind==='date'||kind==='time'?'.apple-date-input .apple-field__icon':'[role=combobox]'
  const trigger=page.locator(selector).first()
  await trigger.evaluate(el=>{(el as HTMLElement).focus({preventScroll:true});(el as HTMLElement).click()});await page.waitForTimeout(350)
  const panel=page.locator(panelSelector).last(), before=await geometry(panel)
  expect(before.side).toBe(kind === 'date' ? 'top' : 'bottom');expect(before.y).toBeGreaterThanOrEqual(7.9)
  expect(before.side === 'top' ? before.y < 26 : before.bottom > 446).toBe(true)
  await page.locator('.scrollport').evaluate(el=>{el.scrollTop=315});await page.waitForTimeout(80)
  const after=await geometry(panel);expect(after.side).toBe('bottom');expect(after.bottom).toBeLessThanOrEqual(792.1)
  await page.setViewportSize({width:320,height:700});await page.waitForTimeout(80)
  expect((await geometry(panel)).right).toBeLessThanOrEqual(312.1)
  await trigger.evaluate(el=>el.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));await page.waitForTimeout(45)
  await trigger.evaluate((el,kind)=>kind==='autocomplete'?el.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true})):(el as HTMLElement).click(),kind);await page.waitForTimeout(350)
  await expect(panel).toBeVisible()
  expect(await panel.evaluate(el=>el.getAnimations().length)).toBe(0)
})

for (const kind of ['select','autocomplete','date','color','popover']) test(`${kind} transfers the actual visible fraction across a quick close and reopen`,async({page})=>{
  await page.setViewportSize({width:700,height:800});await page.goto(`/tests/e2e/fixtures/popup-geometry.html?kind=${kind}`)
  const result=await page.evaluate(async kind=>{
    const selector=kind==='popover'?'.apple-popover-anchor button':kind==='date'?'.apple-date-input .apple-field__icon':kind==='color'?'.apple-color-picker':'[role=combobox]'
    const trigger=document.querySelector<HTMLElement>(selector)!
    const panel=()=>document.querySelector<HTMLElement>('.apple-popover, .apple-date-menu, .apple-field-menu')!
    const fraction=()=>Number(getComputedStyle(panel()).opacity)
    trigger.focus({preventScroll:true});trigger.click();await new Promise(resolve=>setTimeout(resolve,350))
    trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await new Promise(resolve=>setTimeout(resolve,65))
    const before=fraction()
    if(kind==='autocomplete')trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));else trigger.click()
    await Promise.resolve();await Promise.resolve()
    return {before,after:fraction()}
  },kind)
  expect(result.before).toBeGreaterThan(.05);expect(result.before).toBeLessThan(.95)
  expect(Math.abs(result.after-result.before)).toBeLessThan(.08)
})

test('content growth flips an open Popover once, then its close follows the new side',async({page})=>{
  await page.setViewportSize({width:700,height:700});await page.goto('/tests/e2e/fixtures/popup-geometry.html')
  await page.evaluate(()=>{(window as any).popupHarness.move(150,430);(window as any).popupHarness.grow(80)})
  await page.getByRole('button',{name:'Open',exact:true}).click();await page.waitForTimeout(350)
  const panel=page.locator('.apple-popover');expect((await geometry(panel)).side).toBe('bottom')
  await page.evaluate(()=>(window as any).popupHarness.grow(300));await page.waitForTimeout(350)
  const sides=[];for(let i=0;i<8;i++){sides.push((await geometry(panel)).side);await page.waitForTimeout(16)}
  expect(sides).toEqual(Array(8).fill('top'))
  await page.keyboard.press('Escape');await page.waitForTimeout(50);expect((await geometry(panel)).dy).toBeGreaterThan(0)
})

test('an inline field inside a teleported Popover can extend beyond its parent without moving it',async({page})=>{
  await page.setViewportSize({width:800,height:800});await page.goto('/tests/e2e/fixtures/popup-geometry.html?nested-field')
  await page.getByRole('button',{name:'Open',exact:true}).click();await page.waitForTimeout(350)
  const parent=page.locator('.apple-popover'), before=await geometry(parent)
  await page.getByRole('combobox',{name:'Nested field'}).click();await page.waitForTimeout(350)
  const field=page.locator('.apple-field-menu'), p=await geometry(field), after=await geometry(parent)
  expect(p.height).toBeGreaterThan(220);expect(p.bottom).toBeGreaterThan(after.bottom)
  expect(Math.abs(before.y-after.y)).toBeLessThan(1);expect(after.side).toBe(before.side)
  const last=page.getByRole('option',{name:'Option 5',exact:true});await last.click()
  await expect(page.getByRole('combobox',{name:'Nested field'})).toHaveText('Option 5')
  await expect(parent).toBeVisible()
})
