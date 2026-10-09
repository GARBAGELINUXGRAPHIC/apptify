import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { createServer } from 'node:net'
import { createHash } from 'node:crypto'
import { execFileSync, spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium, expect } from '@playwright/test'
import { npmCommand } from './npm-command.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const scratch = await mkdtemp(join(tmpdir(), 'apptify-package-'))
const npm = npmCommand()
const run = (args, cwd = root) => execFileSync(npm.command, [...npm.args, ...args], { cwd, stdio: 'inherit', timeout: 240_000 })
console.log('Package acceptance workspace: ' + scratch)
const archiveInput = process.argv[2] ? resolve(process.argv[2]) : undefined
const archiveSha256 = archiveInput ? createHash('sha256').update(await readFile(archiveInput)).digest('hex') : undefined
const packArgs = ['pack', '--ignore-scripts', '--json', '--loglevel=error', '--pack-destination', scratch]
if (archiveInput) packArgs.push(archiveInput)
const packed = JSON.parse(execFileSync(npm.command, [...npm.args, ...packArgs], { cwd: root, encoding: 'utf8' }))[0]
const contents = new Set(packed.files.map(file => file.path))
const snapshot = archiveInput
  ? JSON.parse(execFileSync('tar', ['-xOf', join(scratch, packed.filename), 'package/templates/playground/source-snapshot.json'], { encoding: 'utf8' }))
  : JSON.parse(await readFile(join(root, 'templates/playground/source-snapshot.json'), 'utf8'))
for (const path of Object.keys(snapshot.files)) assert(contents.has('templates/playground/' + path), 'Missing template file: ' + path)
for (const path of ['package.json', 'vite.config.ts', 'tsconfig.json', 'README.md', 'gitignore', 'source-snapshot.json']) {
  assert(contents.has('templates/playground/' + path), 'Missing template configuration: ' + path)
}
assert(contents.has('tooling/create-playground.mjs'))
assert(contents.has('dist/apptify.js'))
assert(contents.has('dist/apptify.css'))
console.log('Pack manifest includes every playground source and public resource (' + Object.keys(snapshot.files).length + ' files).')

const installer = join(scratch, 'installer')
await mkdir(installer)
await writeFile(join(installer, 'package.json'), '{"name":"template-installer","private":true,"type":"module"}\n')
run(['install', '--ignore-scripts', '--no-audit', '--no-fund', join(scratch, packed.filename)], installer)
const app = join(scratch, 'editable-app')
const cli = join(installer, 'node_modules/apptify/tooling/create-playground.mjs')
run(['exec', '--offline', '--', 'apptify-playground', app], installer)
let refused = false
try { execFileSync(process.execPath, [cli, app], { cwd: installer, stdio: 'pipe' }) } catch { refused = true }
assert(refused, 'Copy command must not overwrite a nonempty directory')
// Remove the installation used to invoke the command: the copied app must be portable.
await rm(installer, { recursive: true, force: true })
const appManifest = JSON.parse(await readFile(join(app, 'package.json'), 'utf8'))
assert(appManifest.dependencies.apptify.startsWith('file:./vendor/'))
assert((await readFile(join(app, '.gitignore'), 'utf8')).includes('node_modules/'))
for (const [path, hash] of Object.entries(snapshot.files)) {
  if (path.startsWith('public/')) assert.equal(createHash('sha256').update(await readFile(join(app, path))).digest('hex'), hash)
}
run(['install', '--no-audit', '--no-fund'], app)
run(['run', 'typecheck'], app)
run(['run', 'build'], app)

// Verify the packed library's original consumer, without repository aliases.
const consumer = join(app, 'library-consumer')
await cp(join(root, 'tests/consumer'), consumer, { recursive: true })
await writeFile(join(consumer, 'vite.config.ts'), [
  "import { defineConfig } from 'vite'",
  "import vue from '@vitejs/plugin-vue'",
  "import apptifyRoutes from 'apptify/vite'",
  "import { fileURLToPath } from 'node:url'",
  "export default defineConfig({ root: fileURLToPath(new URL('.', import.meta.url)), plugins: [apptifyRoutes(), vue()], build: { outDir: 'dist' } })", '',
].join('\n'))
execFileSync(process.execPath, [join(app, 'node_modules/vite/bin/vite.js'), 'build', '--config', join(consumer, 'vite.config.ts')], { cwd: app, stdio: 'inherit' })
const hasConsumerTypes = await readFile(join(consumer, 'image-api-types.ts')).then(() => true).catch(error => { if (error.code === 'ENOENT') return false; throw error })
if (hasConsumerTypes) {
  await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify({ extends: '../tsconfig.json', include: ['image-api-types.ts'] }, null, 2) + '\n')
  execFileSync(process.execPath, [join(app, 'node_modules/vue-tsc/bin/vue-tsc.js'), '--noEmit', '-p', join(consumer, 'tsconfig.json')], { cwd: app, stdio: 'inherit' })
}

async function serve() {
  const reservation = createServer()
  await new Promise((resolve, reject) => {
    reservation.once('error', reject)
    reservation.listen(0, '127.0.0.1', resolve)
  })
  const port = reservation.address().port
  await new Promise((resolve, reject) => reservation.close(error => error ? reject(error) : resolve()))
  const child = spawn(npm.command, [...npm.args, 'run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: app, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32' })
  const stop = () => {
    if (process.platform !== 'win32') { try { process.kill(-child.pid, 'SIGTERM') } catch {} }
    else child.kill('SIGTERM')
  }
  let output = ''
  const url = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Dev server did not start: ' + output)), 20_000)
    const collect = chunk => {
      output += chunk
      const match = output.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, '').match(/http:\/\/127\.0\.0\.1:\d+\//)
      if (match) { clearTimeout(timer); resolve(match[0]) }
    }
    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    child.once('exit', code => { clearTimeout(timer); reject(new Error('Dev server exited ' + code + ': ' + output)) })
  }).catch(error => { stop(); throw error })
  return { url, stop }
}

const browser = await chromium.launch({ channel: 'chrome' })
const errors = []
async function settledScreenshot(page, name) {
  await page.evaluate(async () => { await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame) })
  await page.waitForFunction(() => !document.getAnimations().some(animation => animation.playState === 'running' && Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))))
  await page.screenshot({ path: join(scratch, name) })
}
async function checkPage(baseURL, path, check) {
  const page = await browser.newPage()
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(new URL(path, baseURL).href)
  await check(page)
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page overflow: ' + path)
  await page.close()
}
async function checkTableHandbook(page) {
  await expect(page.getByTestId('component-playground')).toHaveAttribute('data-component', 'AppleTable')
  const frame = page.frameLocator('.vue-repl iframe')
  await frame.getByRole('button', { name: '评分', exact: true }).click()
  await expect(frame.locator('tbody tr').first()).toContainText('Alex')
  await expect(frame.getByRole('textbox', { name: '事件记录内容' })).toHaveValue(/update:sortBy "score"/)
  await expect(page.getByTestId('component-document').locator('iframe')).toHaveCount(0)
}
let server
try {
  server = await serve()
  await checkPage(server.url, '/', async page => {
    await page.locator('.site-nav').waitFor()
    await page.locator('main').waitFor()
    await page.locator('.site-nav').getByRole('link', { name: '设置', exact: true }).click()
    await page.waitForURL(new URL('/settings', server.url).href)
    await page.goBack()
    await page.waitForURL(server.url)
    await settledScreenshot(page, 'complete-home.png')
  })
  await checkPage(server.url, '/components', async page => {
    const image = page.locator('#apple-image img').first()
    await image.scrollIntoViewIfNeeded()
    assert.equal(await image.evaluate(async image => { await image.decode(); return image.naturalWidth > 0 }), true)
    await page.locator('.component-index [role=treeitem][aria-selected=true]').first().waitFor()
  })
  await checkPage(server.url, '/component-docs/apple-input', async page => {
    const frame = page.frameLocator('[data-testid="input-playground"] .vue-repl iframe')
    await expect(frame.locator('.apple-input-wrap input').first()).toBeVisible()
    await frame.locator('.apple-input-wrap input').first().fill('Template src preview')
    await expect(frame.locator('.apple-input-wrap input').first()).toHaveValue('Template src preview')
  })
  await checkPage(server.url, '/component-docs/apple-table', checkTableHandbook)
  await checkPage(server.url, '/settings', async page => {
    await page.setViewportSize({ width: 320, height: 900 })
    await page.getByRole('button', { name: '深色', exact: true }).click()
    await page.getByRole('slider', { name: '玻璃不透明度', exact: true }).waitFor()
    await page.getByRole('button', { name: '打开用户菜单', exact: true }).click()
    await page.getByRole('button', { name: /登录 Login/ }).click()
    await page.locator('.user-auth-form').getByRole('textbox', { name: /^电子邮箱/ }).fill('template@example.com')
    await page.locator('.user-auth-form').getByLabel(/^密码/).fill('template-password')
    assert.equal(await page.locator('.user-auth-form input[type=password]').count(), 1)
    await settledScreenshot(page, 'settings-login-320.png')
  })
  await checkPage(server.url, '/template-missing-page', async page => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.getByRole('heading', { name: '页面不存在', exact: true }).waitFor()
    await page.locator('.paper-scene__art').waitFor()
    await settledScreenshot(page, '404-current.png')
    await page.getByRole('link', { name: '返回首页', exact: true }).click()
    await page.waitForURL(server.url)
  })
  for (const path of Object.keys(snapshot.files).filter(path => path.startsWith('public/'))) {
    const response = await fetch(new URL(path.slice('public/'.length), server.url))
    assert.equal(response.status, 200, 'Missing served resource: ' + path)
    assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), snapshot.files[path])
  }
  server.stop()
  server = undefined

  await rm(join(app, 'src/views/index.vue'))
  await rm(join(app, 'src/views/components.vue'))
  // These files only served the removed overview page. Deleting them must be optional.
  await rm(join(app, 'src/ComponentDemo.vue'))
  await rm(join(app, 'src/catalog.ts'))
  await rm(join(app, 'src/components/ComponentIndex.vue'))
  run(['run', 'typecheck'], app)
  run(['run', 'build'], app)
  server = await serve()
  await checkPage(server.url, '/component-docs/apple-table', checkTableHandbook)
  await checkPage(server.url, '/settings', async page => {
    assert.equal(await page.locator('.site-nav a.apple-navibar__item').count(), 1)
    assert.equal(await page.locator('.site-nav .brand').getAttribute('href'), '/settings')
    await page.getByRole('button', { name: '打开用户菜单', exact: true }).click()
    await page.getByRole('dialog', { name: '用户菜单', exact: true }).waitFor()
    await settledScreenshot(page, 'reduced-settings.png')
  })
  await checkPage(server.url, '/new-business-page', async page => {
    await page.getByRole('heading', { name: '页面不存在', exact: true }).waitFor()
    assert.equal(await page.getByRole('link', { name: '返回首页', exact: true }).getAttribute('href'), '/settings')
    await page.getByRole('link', { name: '返回首页', exact: true }).click()
    await page.waitForURL(new URL('/settings', server.url).href)
  })
  assert.deepEqual(errors, [], 'Browser runtime errors')
} finally {
  server?.stop()
  await browser.close()
}
for (const [path, hash] of Object.entries(snapshot.files)) {
  assert.equal(createHash('sha256').update(await readFile(join(root, snapshot.sourcePaths?.[path] ?? path))).digest('hex'), hash, 'Source changed during packing; rerun for its latest snapshot: ' + path)
}
for (const [path, hash] of Object.entries(snapshot.buildSources || {})) {
  assert.equal(createHash('sha256').update(await readFile(join(root, path))).digest('hex'), hash, 'Build source changed after this archive was created; pack the latest version: ' + path)
}
if (archiveInput) assert.equal(createHash('sha256').update(await readFile(archiveInput)).digest('hex'), archiveSha256, 'Archive was overwritten during acceptance')
await writeFile(join(scratch, 'acceptance.json'), JSON.stringify({ package: packed.filename, archiveInput, archiveSha256, packageBytes: packed.size, packageFileCount: packed.files.length, templateSourceFiles: Object.keys(snapshot.files).length, completeTemplate: true, removedDemoPages: true, libraryConsumer: true, libraryConsumerTypes: hasConsumerTypes, browserErrors: errors, nodeVersion: process.version, sourceSnapshot: snapshot }, null, 2) + '\n')
console.log('Complete editable template, reduced app, routes/resources/account/settings/404, and packed library consumer all passed.\nEvidence: ' + scratch)
