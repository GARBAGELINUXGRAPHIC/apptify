import { readFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = new URL('../../', import.meta.url)
const pending = []

for (const path of ['./', 'packages/create-apptify/']) {
  const directory = new URL(path, root)
  const { name, version } = JSON.parse(await readFile(new URL('package.json', directory), 'utf8'))
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`, {
    signal: AbortSignal.timeout(30_000),
  })

  if (response.ok) {
    console.log(`${name}@${version} is already published; skipping.`)
  } else if (response.status === 404) {
    pending.push({ directory, name, version })
  } else {
    throw new Error(`Cannot check ${name}@${version}: npm registry returned ${response.status}.`)
  }
}

for (const { directory, name, version } of pending) {
  console.log(`Publishing ${name}@${version}…`)
  execFileSync('npm', [
    'publish', '--access', 'public', '--registry', 'https://registry.npmjs.org/',
    '--tag', version.includes('-') ? 'next' : 'latest',
  ], { cwd: fileURLToPath(directory), stdio: 'inherit' })
}
