import { createApp } from 'vue'
import { createAppleUI } from '../src'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(createAppleUI({ theme: 'light', motion: 'auto', persist: true })).use(router).mount('#app')
