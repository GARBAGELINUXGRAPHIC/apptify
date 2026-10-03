import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const root = fileURLToPath(new URL('../', import.meta.url))
const output = join(root, 'templates/playground')
const library = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
const copyOptions = { recursive: true, filter: source => basename(source) !== '.DS_Store' }
await cp(join(root, 'playground'), join(output, 'playground'), copyOptions)
await cp(join(root, 'public'), join(output, 'public'), copyOptions)
await cp(join(root, 'index.html'), join(output, 'index.html'))

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
  devDependencies: Object.fromEntries(['@vitejs/plugin-vue', 'typescript', 'vite', 'vite-plugin-pages', 'vue-tsc'].map(name => [name, library.devDependencies[name]])),
}
await writeFile(join(output, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
const tsconfig = JSON.parse(await readFile(join(root, 'tsconfig.json'), 'utf8'))
tsconfig.include = ['playground/**/*.ts', 'playground/**/*.vue']
await writeFile(join(output, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2) + '\n')
await writeFile(join(output, 'vite.config.ts'), [
  "import { defineConfig } from 'vite'",
  "import vue from '@vitejs/plugin-vue'",
  "import apptifyRoutes from 'apptify/vite'",
  '',
  'export default defineConfig({',
  "  plugins: [apptifyRoutes({ dirs: [{ dir: 'playground/views', baseRoute: '' }] }), vue()],",
  "  server: { host: '127.0.0.1' },",
  "  build: { outDir: 'dist' },",
  '})', '',
].join('\n'))
// npm excludes .gitignore from tarballs; the copy command restores its dot.
await writeFile(join(output, 'gitignore'), 'node_modules/\ndist/\n.env.local\n')
await writeFile(join(output, 'README.md'), [
  '# Apptify 可编辑应用模板', '',
  '完整源码位于 playground/，静态图片与来源说明位于 public/images/。导航、账号/登录、设置、404 和页面动效均可直接编辑复用。', '',
  '通过 apptify-playground 复制命令创建时，vendor/ 包含本地组件库 tgz，package.json 使用相对 file: 依赖；移动整个项目后仍可独立安装。', '',
  '运行 npm install、npm run typecheck、npm run build；开发使用 npm run dev。请使用 Node.js 22 或 24 LTS。', '',
  '开始业务开发可直接删除 playground/views/index.vue 和 playground/views/components.vue，再添加自己的页面；文件路由自动生成，导航自动隐藏已删除页面，品牌链接回到第一个保留的导航页面。删除页面后重启开发服务。', '',
  '导航项在 playground/App.vue 的 navigation 数组；页面文件在 playground/views/；布局和账号入口在 App.vue 与 playground/components/UserMenu.vue。', '',
  '设置保留主题、动效与玻璃偏好。404 在 playground/views/[...all].vue；首页和组件总览没有被其他页面硬导入。ComponentDemo.vue、catalog.ts 和 ComponentIndex.vue 可以保留，也可在删除总览页后按需删除。', '',
  '登录、注册、忘记密码、邮箱验证码仍为 UI 演示入口，需要接入自己的后端。部署采用 history 路由，服务器应把未知页面路径回退到 index.html。', '',
  '若手工复制包内 templates/playground，先将 package.json 的 apptify 依赖替换为实际本地 tgz 路径，或安装自己的正式发布版本；当前项目尚未发布 npm。', '',
].join('\n'))
console.log('Prepared editable playground template: ' + output)
