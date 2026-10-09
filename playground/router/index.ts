import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import { nextTick } from 'vue'
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
      return { el: to.hash, top: 96, behavior: to.path === from.path && motion === 'full' ? 'smooth' : 'instant' }
    }
    return { top: 0, behavior: 'instant' }
  },
})

router.afterEach(to => {
  const titles: Record<string, string> = { '/': '首页', '/components': '组件', '/settings': '设置' }
  const handbook = to.path.startsWith('/component-docs/') ? componentDocuments[String(to.params.component)] : undefined
  document.title = `${handbook ? `${handbook.label} ${handbook.name}` : to.meta.title ?? titles[to.path] ?? '页面不存在'} · Apptify`
})

export default router
