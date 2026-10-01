import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
  build: { outDir: 'site' },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'], server: { deps: { inline: ['vuetify', '@panzoom/panzoom'] } } },
})
