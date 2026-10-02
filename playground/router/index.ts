import { createRouter, createWebHistory } from 'vue-router'
import routes from 'virtual:generated-pages'
import { nextTick } from 'vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  async scrollBehavior(to, from, savedPosition) {
    await nextTick()
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
  document.title = `${titles[to.path] ?? '页面不存在'} · Apptify`
})

export default router
