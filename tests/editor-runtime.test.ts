// @vitest-environment node
import { expect, it, vi } from 'vitest'
import { resolve } from 'node:path'
import { build } from 'esbuild'
import playgroundEditor from '../tooling/playground-editor.mjs'

vi.mock('esbuild', () => ({ build: vi.fn(async () => ({ outputFiles: [] })) }))
vi.mock('../tooling/prepare-input-source.mjs', () => ({ prepareInputSource: vi.fn() }))

it('rebuilds preview resources for Vite-normalized library paths and the runtime entry', async () => {
  const root = process.cwd()
  const plugin = playgroundEditor()
  plugin.configResolved({ root, base: '/' })
  const send = vi.fn()
  const update = (path: string) => plugin.handleHotUpdate({ file: resolve(root, path).replaceAll('\\', '/'), server: { ws: { send } } })

  expect(await update('src/components/button.ts')).toEqual([])
  expect(await update('src/styles/base.css')).toEqual([])
  expect(await update('playground/editor/runtime.ts')).toEqual([])
  expect(build).toHaveBeenCalledTimes(3)
  expect(send).toHaveBeenCalledTimes(3)
  expect(send).toHaveBeenLastCalledWith({ type: 'full-reload', path: '*' })

  expect(await update('src-sibling/button.ts')).toBeUndefined()
  expect(await update('playground/editor/ComponentPlayground.vue')).toBeUndefined()
  expect(build).toHaveBeenCalledTimes(3)
})
