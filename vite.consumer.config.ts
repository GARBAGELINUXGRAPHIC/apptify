import { defineConfig } from 'vite'
export default defineConfig({
  root: 'tests/consumer',
  build: { outDir: '../../artifacts/consumer', emptyOutDir: true },
})
