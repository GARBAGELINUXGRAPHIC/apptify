import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import apptifyRoutes from 'apptify/vite'

export default defineConfig({
  plugins: [apptifyRoutes({ dirs: [{ dir: 'playground/views', baseRoute: '' }] }), vue()],
  server: { host: '127.0.0.1' },
  build: { outDir: 'dist' },
})
