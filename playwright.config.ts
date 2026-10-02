import { defineConfig } from '@playwright/test'
const port = Number(process.env.APPTIFY_TEST_PORT || 5173)
const baseURL = `http://127.0.0.1:${port}`
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL, headless: true, channel: 'chrome', screenshot: 'only-on-failure' },
  reporter: 'list',
  webServer: { command: `npm run dev -- --host 127.0.0.1 --port ${port}`, url: baseURL, reuseExistingServer: !process.env.APPTIFY_TEST_PORT },
})
