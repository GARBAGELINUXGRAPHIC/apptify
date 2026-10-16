#!/usr/bin/env node
import { readFile, realpath } from 'node:fs/promises'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: npm create apptify@latest [empty-directory]\nDefaults to the current directory, which must be empty.\nCreates an editable Vue app with navigation, settings and component examples.\nThen run npm install and npm run dev in that directory.')
  process.exit(0)
}
if (args.length > 1 || args[0]?.startsWith('-')) {
  console.error('Expected one target directory. Run create-apptify --help for usage.')
  process.exit(1)
}

async function destinationPath(path) {
  try {
    return await realpath(path)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return resolve(await destinationPath(dirname(path)), basename(path))
  }
}

try {
  // Resolve without importing the browser component library. Reuse the
  // generator shipped with apptify so its template and library stay together.
  const root = resolve(dirname(fileURLToPath(import.meta.resolve('apptify'))), '..')
  const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
  const cli = manifest.bin?.['apptify-playground']
  if (!cli) throw new Error('Installed apptify does not include the playground generator.')
  // Normalize existing parents too, so symlinks cannot bypass the generator's
  // protection against copying into its own installed package.
  const target = await destinationPath(resolve(args[0] ?? '.'))
  const result = spawnSync(process.execPath, [resolve(root, cli), target], { stdio: 'inherit' })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
