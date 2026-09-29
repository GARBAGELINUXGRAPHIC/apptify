import type { App } from 'vue'
import { appleKey, createApple, type AppleOptions } from './core/context'
import { foundationComponents } from './components/foundation'
import { formComponents } from './components/forms'
import { contentComponents } from './components/content'
import { overlayComponents } from './components/overlays'
import { motionComponents } from './components/motion'
import { navigationComponents } from './components/navibar'
import { AppleEntrance, AppleRipple, AppleSelection } from './core/motion'
import './styles/base.css'
import './styles/forms.css'
import './styles/date-picker.css'
import './styles/content.css'
import './styles/navibar.css'
import './styles/overlays.css'

export * from './core/context'
export * from './components/foundation'
export * from './components/forms'
export * from './components/content'
export * from './components/overlays'
export * from './components/motion'
export * from './components/navibar'
export * from './core/motion'

export const components = { ...foundationComponents, ...formComponents, ...contentComponents, ...overlayComponents, ...motionComponents, ...navigationComponents }

export function createAppleUI(options: AppleOptions = {}) {
  const context = createApple(options)
  return {
    ...context,
    install(app: App) {
      app.provide(appleKey, context)
      app.config.globalProperties.$apple = context
      app.directive('apple-ripple', AppleRipple)
      app.directive('apple-selection', AppleSelection)
      app.directive('apple-entrance', AppleEntrance)
      for (const [name, component] of Object.entries(components)) app.component(name, component)
      app.onUnmount(() => context.dispose())
    },
  }
}

type AppleGlobalComponents = typeof components

declare module 'vue' {
  interface ComponentCustomProperties { $apple: ReturnType<typeof createApple> }
  interface GlobalComponents extends AppleGlobalComponents {}
}
