import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: { outDir: 'site' },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'], server: { deps: { inline: ['vuetify', '@panzoom/panzoom'] } } },
})
