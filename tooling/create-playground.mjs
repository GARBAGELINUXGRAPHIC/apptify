#!/usr/bin/env node
import { cp, mkdir, readFile, readdir, realpath, rename, writeFile } from 'node:fs/promises'
import { resolve, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { npmCommand } from './npm-command.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const destination = process.argv[2]
if (!destination || ['--help', '-h'].includes(destination)) {
  console.log('Usage: apptify-playground <empty-directory>\nCopies the complete editable playground and a portable local library archive.\nThen run npm install and npm run dev in that directory.')
  process.exit(destination ? 0 : 1)
}
try {
  const target = resolve(destination)
  const packageRoot = await realpath(root)
  if (target === packageRoot || target.startsWith(packageRoot + sep)) throw new Error('Destination must be outside the installed apptify package')
  const existing = await readdir(target).catch(error => { if (error.code === 'ENOENT') return []; throw error })
  if (existing.length) throw new Error('Destination must be empty: ' + target)
  const template = join(root, 'templates/playground')
  await readFile(join(template, 'package.json'))
  await mkdir(target, { recursive: true })
  await cp(template, target, { recursive: true })
  await rename(join(target, 'gitignore'), join(target, '.gitignore'))
  const vendor = join(target, 'vendor')
  await mkdir(vendor)
  const npm = npmCommand()
  const packed = JSON.parse(execFileSync(npm.command, [...npm.args, 'pack', '--ignore-scripts', '--json', '--loglevel=error', '--pack-destination', vendor], { cwd: root, encoding: 'utf8' }))
  const manifest = JSON.parse(await readFile(join(target, 'package.json'), 'utf8'))
  manifest.dependencies.apptify = 'file:./vendor/' + packed[0].filename
  await writeFile(join(target, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log('Created ' + target + '\nNext: cd ' + JSON.stringify(target) + ' && npm install && npm run dev')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
