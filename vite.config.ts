import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import apptifyRoutes from './tooling/vite.js'

export default defineConfig({
  plugins: [apptifyRoutes({ dirs: [{ dir: 'playground/views', baseRoute: '' }] }), vue()],
  server: { host: '0.0.0.0', port: 5173, strictPort: true },
  build: { outDir: 'site' },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'], server: { deps: { inline: ['vuetify', '@panzoom/panzoom'] } } },
})
