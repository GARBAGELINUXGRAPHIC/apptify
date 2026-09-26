import { createApp, defineComponent, h } from 'vue'
import { AppleProvider, AppleButton, AppleInput, AppleDialog } from 'apptify'
import 'apptify/style.css'

const App = defineComponent({
  data: () => ({ open: false, name: '' }),
  render() {
    return h(AppleProvider, null, { default: () => [
      h('h1', 'Package consumer'),
      h(AppleInput, { modelValue: this.name, label: 'Name', 'onUpdate:modelValue': (value: string) => { this.name = value } }),
      h(AppleButton, { onClick: () => { this.open = true } }, () => 'Open dialog'),
      h(AppleDialog, { modelValue: this.open, title: this.name || 'Package works', 'onUpdate:modelValue': (value: boolean) => { this.open = value } }),
    ] })
  },
})
createApp(App).mount('#app')
