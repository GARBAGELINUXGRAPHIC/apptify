import { expect, test } from '@playwright/test'

for (const [theme, resolved, background] of [
  ['dark', 'dark', 'rgb(22, 22, 23)'],
  ['system', 'dark', 'rgb(22, 22, 23)'],
  ['graphite', 'graphite', 'rgb(243, 244, 244)'],
  ['rose', 'rose', 'rgb(250, 247, 248)'],
]) {
  test(`saved ${theme} has no light frames or startup theme transitions`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.addInitScript(savedTheme => {
      localStorage.setItem('apptify:preferences', JSON.stringify({ theme: savedTheme, motion: 'full' }))
      const samples: { theme: string | null; background: string; transitions: string[] }[] = []
      Object.assign(window, { themeStartupSamples: samples })
      function sample() {
        const provider = document.querySelector('#app > .apple-provider')
        if (provider) {
          samples.push({
            theme: provider.getAttribute('data-apple-theme'),
            background: getComputedStyle(provider).backgroundColor,
            transitions: provider.getAnimations().filter(animation => animation instanceof CSSTransition).map(animation => (animation as CSSTransition).transitionProperty),
          })
        }
        if (samples.length < 30) requestAnimationFrame(sample)
      }
      requestAnimationFrame(sample)
    }, theme)
    await page.goto('/')
    await page.waitForFunction(() => (window as any).themeStartupSamples.length >= 30)
    const samples = await page.evaluate(() => (window as any).themeStartupSamples as { theme: string; background: string; transitions: string[] }[])
    for (const sample of samples) {
      expect(sample.theme).toBe(resolved)
      expect(sample.background).toBe(background)
      expect(sample.transitions).toEqual([])
    }
  })
}
