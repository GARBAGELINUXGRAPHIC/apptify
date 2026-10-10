import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import { nextTick } from 'vue'
import { cancelMotionScroll, scrollToWithMotion } from '../../src/core/motion'
import { componentDocuments } from '../editor/documents'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  async scrollBehavior(to, from, savedPosition) {
    await nextTick()
    if (to.path === '/components' && to.hash && to.path !== from.path) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      await Promise.allSettled(document.getAnimations().filter(animation =>
        Number.isFinite(Number(animation.effect?.getComputedTiming().endTime)),
      ).map(animation => animation.finished))
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
    }
    if (savedPosition) return { ...savedPosition, behavior: 'instant' }
    if (to.hash && document.getElementById(to.hash.slice(1))) {
      const motion = document.querySelector('#app > .apple-provider')?.getAttribute('data-apple-motion')
      if (motion !== 'full') return { el: to.hash, top: 96, behavior: 'instant' }
      if (router.currentRoute.value !== to) return false
      const target = document.getElementById(to.hash.slice(1))!
      const top = () => Math.min(target.getBoundingClientRect().top + window.scrollY - 96, Math.max(0, document.documentElement.scrollHeight - window.innerHeight))
      await scrollToWithMotion(window, top).finished
      return false
    }
    return { top: 0, behavior: 'instant' }
  },
})

router.beforeEach(() => { cancelMotionScroll(window) })

router.afterEach(to => {
  const titles: Record<string, string> = { '/': '首页', '/components': '组件', '/settings': '设置' }
  const handbook = to.path.startsWith('/component-docs/') ? componentDocuments[String(to.params.component)] : undefined
  document.title = `${handbook ? `${handbook.label} ${handbook.name}` : to.meta.title ?? titles[to.path] ?? '页面不存在'} · Apptify`
})

export default router
