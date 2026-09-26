import { createApp } from 'vue'
import { createAppleUI } from '../src'
import App from './App.vue'
import './style.css'

createApp(App).use(createAppleUI({ theme: 'light', motion: 'auto', persist: true })).mount('#app')
