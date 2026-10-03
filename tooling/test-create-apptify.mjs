import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('../', import.meta.url))
const scratch = await mkdtemp(join(tmpdir(), 'create-apptify-test-'))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const env = { ...process.env, npm_config_cache: join(scratch, 'cache'), npm_config_offline: 'true' }
const installer = join(scratch, 'installer')
const creator = join(installer, 'node_modules/create-apptify')
const library = join(installer, 'node_modules/apptify')
const cli = join(creator, 'bin/create-apptify.mjs')

async function unpack(cwd, destination) {
  const packed = JSON.parse(execFileSync(npm, ['pack', '--ignore-scripts', '--json', '--pack-destination', scratch], { cwd, env, encoding: 'utf8' }))[0]
  await mkdir(destination, { recursive: true })
  execFileSync('tar', ['-xzf', join(scratch, packed.filename), '--strip-components=1', '-C', destination])
  return packed
}

try {
  // Use real tarballs in an installed layout, without fetching dependencies.
  // The generator only reads/copies the library; it never imports its Vue code.
  const packed = await unpack(join(root, 'packages/create-apptify'), creator)
  const files = new Set(packed.files.map(file => file.path))
  for (const path of ['package.json', 'bin/create-apptify.mjs', 'README.md', 'LICENSE']) assert(files.has(path), 'Missing creator file: ' + path)
  await unpack(root, library)
  await mkdir(join(installer, 'node_modules/.bin'))
  await symlink('../create-apptify/bin/create-apptify.mjs', join(installer, 'node_modules/.bin/create-apptify'))
  await writeFile(join(installer, 'package.json'), JSON.stringify({ private: true, dependencies: { 'create-apptify': packed.version } }) + '\n')

  const run = (args, cwd = installer) => spawnSync(process.execPath, [cli, ...args], { cwd, env, encoding: 'utf8' })
  const help = run(['--help'])
  assert.equal(help.status, 0, help.stderr)
  assert.match(help.stdout, /npm create apptify@latest/)
  assert.equal(run([]).status, 1)
  assert.match(run([]).stderr, /Destination must be empty/)
  assert.equal(run(['--unknown']).status, 1)
  assert.equal(run(['one', 'two']).status, 1)

  const app = join(scratch, 'my app')
  const result = spawnSync(npm, ['create', 'apptify', '--offline', '--', app], { cwd: installer, env, encoding: 'utf8', timeout: 60_000 })
  assert.equal(result.status, 0, result.stdout + result.stderr)
  const manifest = JSON.parse(await readFile(join(app, 'package.json'), 'utf8'))
  assert.match(manifest.dependencies.apptify, /^file:\.\/vendor\/apptify-/)
  assert.match(await readFile(join(app, '.gitignore'), 'utf8'), /node_modules/)
  await readFile(join(app, 'playground/App.vue'))
  const archive = join(app, manifest.dependencies.apptify.slice('file:./'.length))
  const portableManifest = JSON.parse(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }))
  assert.equal(portableManifest.name, 'apptify')

  const before = await readFile(join(app, 'package.json'), 'utf8')
  const refused = run([app])
  assert.equal(refused.status, 1)
  assert.match(refused.stderr, /Destination must be empty/)
  assert.equal(await readFile(join(app, 'package.json'), 'utf8'), before)
  assert.equal(run([join(library, 'unsafe')]).status, 1)
  const alias = join(scratch, 'library-alias')
  await symlink(library, alias, 'dir')
  assert.equal(run([join(alias, 'unsafe')]).status, 1)

  const empty = join(scratch, 'existing-empty')
  await mkdir(empty)
  const copied = run([empty])
  assert.equal(copied.status, 0, copied.stderr)
  await readFile(join(empty, 'playground/App.vue'))
  const current = join(scratch, 'current-directory')
  await mkdir(current)
  const defaultTarget = run([], current)
  assert.equal(defaultTarget.status, 0, defaultTarget.stderr)
  await readFile(join(current, 'playground/router/index.ts'))
  assert.match(JSON.parse(await readFile(join(current, 'package.json'), 'utf8')).dependencies.apptify, /^file:\.\/vendor\//)
  await rm(installer, { recursive: true, force: true })
  execFileSync('tar', ['-t', '-f', archive])
  console.log('create-apptify: packed CLI, npm create, portable archive, help, argument validation and overwrite protection passed.')
  await rm(scratch, { recursive: true, force: true })
} catch (error) {
  console.error('Acceptance workspace retained: ' + scratch)
  throw error
}
