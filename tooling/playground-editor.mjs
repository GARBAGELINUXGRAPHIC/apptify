import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { parse, compileScript, compileStyle } from 'vue/compiler-sfc'

// The editor runtime uses esbuild, so compile library SFCs just as Vite does.
const vueComponents = {
  name: 'vue-components',
  setup(builder) {
    builder.onResolve({ filter: /\.vue\?style$/ }, args => ({ path: args.path.slice(0, -6), namespace: 'vue-style' }))
    builder.onLoad({ filter: /\.vue$/ }, async args => {
      const { descriptor, errors } = parse(await readFile(args.path, 'utf8'), { filename: args.path })
      if (errors.length) throw errors[0]
      const id = createHash('sha256').update(args.path).digest('hex').slice(0, 8)
      const scope = `data-v-${id}`
      if (args.namespace === 'vue-style') {
        const styles = descriptor.styles.map(style => {
          const result = compileStyle({ source: style.content, filename: args.path, id: scope, scoped: style.scoped })
          if (result.errors.length) throw result.errors[0]
          return result.code
        })
        return { contents: styles.join('\n'), loader: 'css' }
      }
      const script = compileScript(descriptor, { id, inlineTemplate: true, genDefaultAs: '__component' })
      return {
        contents: `${script.content}\n__component.__scopeId = ${JSON.stringify(scope)};\nexport default __component;\nimport ${JSON.stringify(args.path + '?style')};`,
        loader: 'ts', resolveDir: resolve(args.path, '..'),
      }
    })
  },
}

/** Local-only resources for the official Vue REPL. No CDN or compile service. */
export default function playgroundEditor() {
  let config
  let resources
  let rebuilding = Promise.resolve()
  function rebuild() { rebuilding = rebuilding.catch(() => {}).then(prepare); return rebuilding }
  async function prepare() {
    if (existsSync(resolve(config.root, 'src/components/forms.ts'))) {
      const { prepareInputSource } = await import('./prepare-input-source.mjs')
      await prepareInputSource()
    }
    const require = createRequire(resolve(config.root, 'package.json'))
    const bundle = await build({
      absWorkingDir: config.root, entryPoints: ['playground/editor/runtime.ts'],
      bundle: true, format: 'esm', platform: 'browser', external: ['vue'],
      outfile: 'runtime.js', write: false, minify: true,
      define: { 'process.env.NODE_ENV': '"production"' },
      plugins: [vueComponents],
    })
    resources = new Map(bundle.outputFiles.map(file => [file.path.endsWith('.css') ? 'runtime.css' : 'runtime.js', file.contents]))
    resources.set('vue.js', await readFile(require.resolve('vue/dist/vue.runtime.esm-browser.prod.js')))
    resources.set('shims.js', await readFile(require.resolve('es-module-shims')))
  }
  return {
    name: 'apptify-local-editor', enforce: 'pre',
    configResolved(value) { config = value },
    // Harden the official sandbox without replacing its compiler or module processing.
    // Fail closed when upstream changes the reviewed implementation.
    transform(code, id) {
      if (!id.split('?')[0].replaceAll('\\', '/').endsWith('/@vue/repl/dist/vue-repl.js')) return
      for (const permission of ['allow-forms', 'allow-modals', 'allow-pointer-lock', 'allow-popups', 'allow-same-origin', 'allow-top-navigation-by-user-activation']) {
        const token = `"${permission}",`
        if (!code.includes(token) && !code.includes(`"${permission}"\n`)) throw new Error('Vue REPL sandbox changed: review permissions before updating')
        code = code.replace(token, '').replace(`"${permission}"\n`, '')
      }
      code = code.replace('const html = sandbox.contentDocument?.documentElement;', 'const html = null; // Opaque origin: rebuild on theme changes.')
      code = code.replace('sandbox.contentWindow?.location.reload();', 'createSandbox();')
      code = code.replace('\n\t\t\t\tswitchPreviewTheme();', '') // srcdoc already has the initial theme; avoid rebuilding on load.
      return { code, map: null }
    },
    async handleHotUpdate(ctx) {
      const source = resolve(config.root, 'src') + '/'
      if (!ctx.file.startsWith(source) && ctx.file !== resolve(config.root, 'playground/editor/runtime.ts')) return
      // Preview resources are an in-memory bundle, separate from Vite's normal CSS HMR.
      // Rebuild it when library files change, then recreate the preview realm.
      await rebuild()
      ctx.server.ws.send({ type: 'full-reload', path: '*' })
      return []
    },
    async configureServer(server) {
      await rebuild()
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0]
        const prefix = config.base + 'assets/editor/'
        if (!path.startsWith(prefix)) return next()
        const name = path.slice(prefix.length), content = resources.get(name)
        if (!content) return next()
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Cache-Control', 'no-store')
        res.setHeader('Content-Type', name.endsWith('.css') ? 'text/css' : 'text/javascript')
        res.end(content)
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if ((req.url || '').startsWith(config.base + 'assets/editor/')) {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Cache-Control', 'no-cache')
        }
        next()
      })
    },
    async buildStart() {
      if (config.command !== 'build') return
      await prepare()
      for (const [name, source] of resources) this.emitFile({ type: 'asset', fileName: 'assets/editor/' + name, source })
    },
  }
}
