import assert from 'node:assert/strict'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { npmCommand } from './npm-command.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
async function sourceHashes() {
  const files = {}
  const record = async path => {
    files[relative(root, path).replaceAll('\\', '/')] = createHash('sha256').update(await readFile(path)).digest('hex')
  }
  const directory = async path => {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') continue
      const child = join(path, entry.name)
      if (entry.isDirectory()) await directory(child)
      else await record(child)
    }
  }
  for (const name of ['src', 'playground', 'public', 'docs']) await directory(join(root, name))
  for (const name of ['README.md', 'package.json', 'index.html', 'vite.config.ts', 'vite.lib.config.ts', 'tsconfig.json', 'tsconfig.lib.json', 'tooling/create-playground.mjs', 'tooling/npm-command.mjs', 'tooling/prepare-playground.mjs', 'tooling/prepare-package.mjs']) await record(join(root, name))
  return files
}
const before = await sourceHashes()
const npm = npmCommand()
execFileSync(npm.command, [...npm.args, 'run', 'build'], { cwd: root, stdio: 'inherit' })
execFileSync(process.execPath, [join(root, 'tooling/prepare-playground.mjs')], { cwd: root, stdio: 'inherit' })
assert.deepEqual(await sourceHashes(), before, 'Sources changed during the build; rerun packing to take the latest snapshot. No source file was restored.')
const snapshotPath = join(root, 'templates/playground/source-snapshot.json')
const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'))
snapshot.buildSources = before
await writeFile(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n')
console.log('Library build and editable template share the same source snapshot.')
