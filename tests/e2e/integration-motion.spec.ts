import { expect, test } from '@playwright/test'

test('home search only animates container height and rapidly reverses without moving rows', async ({ page }) => {
  await page.goto('/')
  await expect.poll(() => page.locator('main').evaluate(el => el.getAnimations().length)).toBe(0)
  const search = page.getByRole('searchbox', { name: '搜索设置', exact: true })
  const list = page.locator('.home-page .apple-list-size')
  const sample = await search.evaluate(async element => {
    const input = element as HTMLInputElement
    const outer = document.querySelector<HTMLElement>('.home-page .apple-list-size')!
    const before = outer.getBoundingClientRect().height
    input.value = '通知'; input.dispatchEvent(new Event('input', { bubbles:true }))
    await new Promise(resolve => setTimeout(resolve, 60))
    return {before,height:outer.getBoundingClientRect().height,target:outer.firstElementChild!.getBoundingClientRect().height,
      frames:outer.getAnimations().flatMap(a => (a.effect as KeyframeEffect).getKeyframes()),
      rows:[...outer.querySelectorAll('li')].map(el=>({transform:getComputedStyle(el).transform,animations:el.getAnimations().length}))}
  })
  expect(sample.height).toBeLessThan(sample.before)
  expect(sample.height).toBeGreaterThan(sample.target)
  expect(sample.frames.length).toBeGreaterThan(0)
  for(const frame of sample.frames) { expect(frame.height).toBeDefined(); expect(frame.transform).toBeUndefined(); expect(frame.opacity).toBeUndefined() }
  expect(sample.rows).toEqual([{transform:'none',animations:0}])
  for(const query of ['', '资料', '不存在', '隐私', '']) await search.fill(query)
  await expect(list.locator('li')).toHaveCount(3)
  await expect.poll(()=>list.evaluate(el=>el.getAnimations().length)).toBe(0)
  await expect(list).toHaveCSS('overflow','visible')
})

test('table result changes animate height without row transitions', async ({ page }) => {
  await page.goto('/tests/e2e/fixtures/content-motion.html')
  const sample = await page.locator('#filter').evaluate(async element => {
    const outer=document.querySelector<HTMLElement>('.apple-table-size')!
    const before=outer.getBoundingClientRect().height
    ;(element as HTMLElement).click()
    await new Promise(resolve=>setTimeout(resolve,60))
    return { before, height:outer.getBoundingClientRect().height, target:outer.firstElementChild!.getBoundingClientRect().height,
      frames:outer.getAnimations().flatMap(a=>(a.effect as KeyframeEffect).getKeyframes()),
      transforms:[...outer.querySelectorAll('tbody tr')].map(el=>getComputedStyle(el).transform) }
  })
  expect(sample.height).toBeLessThan(sample.before)
  expect(sample.height).toBeGreaterThan(sample.target)
  expect(sample.frames.length).toBeGreaterThan(0)
  expect(sample.frames.every(frame=>frame.height && !frame.transform && !frame.opacity)).toBe(true)
  expect(sample.transforms).toEqual(['none'])
})

for(const width of [320,1440]) test(`tags are hollow pills with content height at ${width}px`, async({page})=>{
  await page.setViewportSize({width,height:1000})
  await page.goto('/tests/e2e/fixtures/content-motion.html')
  const tags=await page.locator('.apple-tag').evaluateAll(elements=>elements.map(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return {height:r.height,parent:el.parentElement!.getBoundingClientRect().height,background:s.backgroundColor,border:s.borderTopStyle,radius:s.borderRadius,overflow:el.scrollWidth>el.clientWidth+1}}))
  expect(tags.length).toBe(11)
  for(const tag of tags){expect(tag.background).toBe('rgba(0, 0, 0, 0)');expect(tag.border).toBe('solid');expect(tag.radius).toBe('999px');expect(tag.height).toBeLessThan(100);expect(tag.overflow).toBe(false)}
  const tall=await page.locator('.tall .apple-tag,.grid .apple-tag').evaluateAll(elements=>elements.map(el=>el.getBoundingClientRect().height))
  expect(tall.every(height=>height<100)).toBe(true)
  await page.getByRole('button',{name:'移除可关闭',exact:true}).click()
  await expect(page.getByText('可关闭',{exact:true})).toHaveCount(0)
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  await page.screenshot({path:`/Users/quitsense/Documents/Codex/2026-10-02/task/tag-${width}.png`,fullPage:true})
})

test('transition demo crossfades with directional slide and accepts rapid reversal',async({page})=>{
  await page.goto('/tests/e2e/fixtures/content-motion.html')
  const stage=page.locator('.demo-transition-stage')
  for(const label of ['日','月']) {
    const sample=await page.getByRole('radio',{name:label,exact:true}).evaluate(async element=>{
      ;(element as HTMLElement).click()
      await new Promise(resolve=>setTimeout(resolve,90))
      return [...document.querySelectorAll('.demo-transition-stage .apple-statistic')].map(el=>({opacity:Number(getComputedStyle(el).opacity),x:new DOMMatrixReadOnly(getComputedStyle(el).transform).m41,transition:getComputedStyle(el).transitionProperty}))
    })
    expect(sample.length).toBe(2)
    expect(sample.every(s=>s.opacity>0&&s.opacity<1&&Math.abs(s.x)>0&&s.transition.includes('opacity')&&s.transition.includes('transform'))).toBe(true)
    expect(sample[0]!.x*sample[1]!.x).toBeLessThan(0)
    await expect(stage.locator('.apple-statistic')).toHaveCount(1)
  }
  await page.locator('.apple-segmented').evaluate(async element=>{
    const buttons=[...element.querySelectorAll<HTMLInputElement>('input[type=radio]')]
    for(const index of [0,2,1,0,2,0,1,2]){buttons[index]!.click();await new Promise(resolve=>setTimeout(resolve,25))}
  })
  await expect(stage.locator('.apple-statistic')).toHaveCount(1)
  await expect(stage.locator('.apple-statistic')).toHaveCSS('opacity','1')
  await expect(stage.locator('.apple-statistic')).toHaveCSS('transform','none')
  await expect(stage).toContainText('12,840')
})

test('path changes animate one page and keep fixed navigation stable through rapid switching and back',async({page})=>{
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('/')
  const nav=page.getByRole('navigation',{name:'主导航',exact:true})
  await nav.getByRole('link',{name:'设置',exact:true}).click()
  await expect.poll(()=>page.locator('main').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0)
  expect((await page.locator('.site-nav .apple-navibar__bar').boundingBox())!.y).toBe(0)
  for(const label of ['组件','首页','设置','组件','首页']) {
    await nav.getByRole('link',{name:label,exact:true}).evaluate(el=>(el as HTMLElement).click())
    await expect(page.locator('main')).toHaveCount(1)
  }
  await expect(page).toHaveURL(/\/$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/components$/)
  await expect.poll(()=>page.locator('main').evaluate(el=>el.getAnimations().length)).toBe(0)
  const sidebar=await page.locator('.sidebar').boundingBox()
  expect(sidebar!.y).toBe(64)
  await expect(nav.getByRole('link',{name:'组件',exact:true})).toHaveCSS('border-bottom-width','0px')
  await page.locator('#apple-input .component-card-heading a').click()
  expect(await page.locator('main').evaluate(el=>el.getAnimations().length)).toBe(0)
})

test('reduced motion avoids route movement and disabled motion skips height animation',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.goto('/')
  await page.getByRole('navigation',{name:'主导航',exact:true}).getByRole('link',{name:'设置',exact:true}).click()
  expect(await page.locator('main').evaluate(el=>el.getAnimations().length)).toBe(0)
  await page.goto('/tests/e2e/fixtures/content-motion.html?motion=none')
  await page.locator('#filter').click()
  await expect(page.locator('tbody tr')).toHaveCount(1)
  expect(await page.locator('.apple-table-size').evaluate(el=>el.getAnimations().length)).toBe(0)
})


for (const theme of ['light', 'dark']) test(`tag text keeps 4.5:1 contrast on ${theme} surfaces`, async ({ page }) => {
  await page.goto(`/tests/e2e/fixtures/content-motion.html?theme=${theme}`)
  const ratios = await page.locator('.tones .apple-tag').evaluateAll(elements => {
    const context = document.createElement('canvas').getContext('2d')!
    const rgb = (value: string) => { context.clearRect(0,0,1,1); context.fillStyle=value; context.fillRect(0,0,1,1); return [...context.getImageData(0,0,1,1).data].slice(0,3) }
    const luminance = (color: number[]) => color.map(channel => { const value=channel/255; return value<=.04045 ? value/12.92 : ((value+.055)/1.055)**2.4 }).reduce((sum,value,index)=>sum+value*[.2126,.7152,.0722][index]!,0)
    const provider=getComputedStyle(document.querySelector('.apple-provider')!)
    const backgrounds=['--apple-bg','--apple-surface','--apple-surface-alt'].map(token=>luminance(rgb(provider.getPropertyValue(token))))
    return elements.map(element=>{const ink=luminance(rgb(getComputedStyle(element).color));return {label:element.textContent,ratios:backgrounds.map(background=>(Math.max(ink,background)+.05)/(Math.min(ink,background)+.05))}})
  })
  for (const tag of ratios) for (const ratio of tag.ratios) expect(ratio, `${tag.label} ${theme}`).toBeGreaterThanOrEqual(4.5)
})

test('sidebar joins page entrance without moving the global bar and hashes do not restart it', async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000})
  await page.goto('/settings')
  await page.getByRole('navigation',{name:'主导航',exact:true}).getByRole('link',{name:'组件',exact:true}).click()
  const aside=page.locator('.sidebar')
  await expect.poll(()=>aside.evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0)
  const poses=await page.evaluate(()=>{
    const aside=document.querySelector<HTMLElement>('.sidebar')!,main=document.querySelector('main')!
    const a=aside.getAnimations()[0]!,m=main.getAnimations()[0]!
    return {aside:(a.effect as KeyframeEffect).getKeyframes(),main:(m.effect as KeyframeEffect).getKeyframes(),aDuration:a.effect!.getComputedTiming().duration,mDuration:m.effect!.getComputedTiming().duration,position:getComputedStyle(aside).position,nav:document.querySelector('.site-nav .apple-navibar__bar')!.getBoundingClientRect().top}
  })
  expect(poses.aside[0]!.transform).toBe('translateX(-14px)')
  expect(poses.main[0]!.transform).toBe('translateY(14px)')
  expect(poses.aDuration).toBe(poses.mDuration)
  expect(poses.position).toBe('fixed');expect(poses.nav).toBe(0)
  await expect.poll(()=>aside.evaluate(el=>el.getAnimations().length)).toBe(0)
  await page.locator('.sidebar a[href="/components#apple-input"]').count().then(async count=>{if(!count) await page.locator('.sidebar a[href="/components#forms"]').click()})
  await page.locator('.sidebar a[href="/components#apple-input"]').click()
  expect(await aside.evaluate(el=>el.getAnimations().length)).toBe(0)
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.getByRole('navigation',{name:'主导航',exact:true}).getByRole('link',{name:'设置',exact:true}).click()
  await page.goBack()
  await expect(aside).toBeVisible()
  expect(await aside.evaluate(el=>el.getAnimations().length)).toBe(0)
})
