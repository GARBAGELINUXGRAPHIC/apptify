import { createApp, defineComponent, h } from 'vue'
import { createRouter, createWebHistory, RouterView } from 'vue-router'
import routes from 'virtual:generated-pages'
import { AppleProvider, AppleButton, AppleInput, AppleDialog, AppleNavibar } from 'apptify'
import 'apptify/style.css'

const App = defineComponent({
  data: () => ({ open: false, name: '' }),
  render() {
    return h(AppleProvider, null, { default: () => [
      h(AppleNavibar, { brand: 'Consumer', fixed: false, items: [{ label: 'Home', value: 'home' }] }),
      h('h1', 'Package consumer'),
      h(RouterView),
      h(AppleInput, { modelValue: this.name, label: 'Name', 'onUpdate:modelValue': value => { this.name = value } }),
      h(AppleButton, { onClick: () => { this.open = true } }, () => 'Open dialog'),
      h(AppleDialog, { modelValue: this.open, title: this.name || 'Package works', 'onUpdate:modelValue': value => { this.open = value } }),
    ] })
  },
})
const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })
createApp(App).use(router).mount('#app')
