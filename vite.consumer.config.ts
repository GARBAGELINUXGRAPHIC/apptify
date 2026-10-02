import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import apptifyRoutes from 'apptify/vite'
export default defineConfig({
  root: 'tests/consumer',
  plugins: [apptifyRoutes(), vue()],
  build: { outDir: '../../artifacts/consumer', emptyOutDir: true },
})
