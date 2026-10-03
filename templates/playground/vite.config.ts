import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import apptifyRoutes from 'apptify/vite'
import playgroundEditor from './tooling/playground-editor.mjs'

export default defineConfig({
  optimizeDeps: { exclude: ['@vue/repl'] },
  plugins: [playgroundEditor(), apptifyRoutes({ dirs: [{ dir: 'playground/views', baseRoute: '' }] }), vue()],
  server: { host: '127.0.0.1' },
  build: { outDir: 'dist' },
})
