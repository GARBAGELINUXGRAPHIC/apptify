import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

import { prepareInputSource } from './prepare-input-source.mjs'
await prepareInputSource()
const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, 'templates/playground')
const library = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
const copyOptions = { recursive: true, filter: source => basename(source) !== '.DS_Store' }
await cp(join(root, 'playground'), join(output, 'playground'), copyOptions)
await cp(join(root, 'public'), join(output, 'public'), copyOptions)
await cp(join(root, 'index.html'), join(output, 'index.html'))
await mkdir(join(output, 'tooling'), { recursive: true })
await cp(join(root, 'tooling/prepare-input-source.mjs'), join(output, 'tooling/prepare-input-source.mjs'))
await cp(join(root, 'tooling/playground-editor.mjs'), join(output, 'tooling/playground-editor.mjs'))

const snapshot = { createdAt: new Date().toISOString(), libraryVersion: library.version, files: {} }
async function record(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await record(path)
    else snapshot.files[relative(output, path)] = createHash('sha256').update(await readFile(path)).digest('hex')
  }
}
await record(output)
await writeFile(join(output, 'source-snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n')

async function adapt(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await adapt(path)
    else if (/\.(vue|ts)$/.test(entry.name)) {
      let source = await readFile(path, 'utf8')
      source = source.replace(/(['"])(?:\.\.\/)+src(?:\/(?:index|core\/motion|core\/context|components\/content))?\1/g, "'apptify'")
      if (/(['"])(?:\.\.\/)+src(?:\/[^'"]*)?\1/.test(source)) throw new Error('Unmapped private library import: ' + path)
      if (path === join(output, 'playground/editor/runtime.ts')) source = "import 'apptify/style.css'\n" + source
      if (entry.name === 'main.ts') source = "import 'apptify/style.css'\n" + source
      if (path === join(output, 'playground/App.vue')) {
        const navigationEnd = ']\n\nfunction navigate'
        if (!source.includes(navigationEnd)) throw new Error('App navigation layout changed; update template adaptation')
        source = source.replace('to="/" aria-label="Apptify 首页"', ':to="homePath" aria-label="Apptify 首页"')
        source = source.replace(navigationEnd, "].filter(item => router.getRoutes().some(page => page.path === item.href))\nconst homePath = navigation[0]?.href ?? '/'\n\nfunction navigate")
      }
      if (path === join(output, 'playground/views/[...all].vue')) {
        source = source.replace('to="/" custom', ':to="homePath" custom')
        source = source.replace('const router = useRouter()', "const router = useRouter()\nconst homePath = router.getRoutes().some(page => page.path === '/') ? '/' : '/settings'")
        source = source.replace("else void router.push('/')", 'else void router.push(homePath)')
      }
      await writeFile(path, source)
    }
  }
}
await adapt(join(output, 'playground'))
const manifest = {
  name: 'apptify-app', version: '0.0.0', private: true, type: 'module',
  scripts: { dev: 'vite', typecheck: 'vue-tsc --noEmit', build: 'vue-tsc --noEmit && vite build', preview: 'vite preview --host 127.0.0.1' },
  dependencies: {
    apptify: '^' + library.version, vue: library.peerDependencies.vue,
    'vue-router': library.devDependencies['vue-router'], vuetify: library.peerDependencies.vuetify,
    'lucide-vue-next': library.dependencies['lucide-vue-next'],
  },
  devDependencies: Object.fromEntries(['@vitejs/plugin-vue', 'typescript', 'vite', 'vite-plugin-pages', 'vue-tsc', '@vue/repl', 'es-module-shims', 'esbuild', 'postcss'].map(name => [name, library.devDependencies[name]])),
}
await writeFile(join(output, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
const tsconfig = JSON.parse(await readFile(join(root, 'tsconfig.json'), 'utf8'))
tsconfig.include = ['playground/**/*.ts', 'playground/**/*.vue']
await writeFile(join(output, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2) + '\n')
await writeFile(join(output, 'vite.config.ts'), [
  "import { defineConfig } from 'vite'",
  "import vue from '@vitejs/plugin-vue'",
  "import apptifyRoutes from 'apptify/vite'",
  "import playgroundEditor from './tooling/playground-editor.mjs'",
  '',
  'export default defineConfig({',
  "  optimizeDeps: { exclude: ['@vue/repl'] },",
  "  plugins: [playgroundEditor(), apptifyRoutes({ dirs: [{ dir: 'playground/views', baseRoute: '' }] }), vue()],",
  "  server: { host: '127.0.0.1' },",
  "  build: { outDir: 'dist' },",
  '})', '',
].join('\n'))
// npm excludes .gitignore from tarballs; the copy command restores its dot.
await writeFile(join(output, 'gitignore'), 'node_modules/\ndist/\n.env.local\n')
await writeFile(join(output, 'README.md'), [
  "# Apptify 应用模板",
  "",
  "可编辑的 Vue 应用，包含导航、账号表单、外观设置、404 与组件示例。建议 Node.js 22 或 24 LTS。",
  "",
  "```sh",
  "npm install",
  "npm run dev",
  "```",
  "",
  "检查：`npm run typecheck`、`npm run build`。",
  "",
  "- 页面：`playground/views/`，文件路由自动生成。",
  "- 布局与导航：`playground/App.vue` 的 `navigation` 数组。",
  "- 账号表单：`playground/components/UserMenu.vue`，需要接入自己的后端。",
  "- 样式：`playground/style.css`；图片与来源：`public/images/`。",
  "",
  "可删除 `views/index.vue` 和 `views/components.vue`，再添加业务页面；删除后重启开发服务。删除组件总览后，可一并删除 `ComponentDemo.vue`、`catalog.ts` 和 `components/ComponentIndex.vue`。",
  "",
  "复制命令在 `vendor/` 保存库归档，移动整个项目后仍可独立安装。使用 npm 更新库：`npm install apptify@latest`。手工复制模板时，将 `gitignore` 重命名为 `.gitignore`。",
  "",
  "部署时将页面请求回退到 `index.html`，保留 API 与静态资源路由。",
  "",
].join('\n'))
console.log('Prepared editable playground template: ' + output)
