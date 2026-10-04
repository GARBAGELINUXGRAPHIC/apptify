import { existsSync, realpathSync } from 'node:fs'
import { delimiter, dirname, join } from 'node:path'

// Run npm through Node so Windows .cmd shims never need shell quoting.
export function npmCommand(env = process.env) {
  const candidates = [env.npm_execpath, join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js')]
  for (const directory of (env.PATH ?? env.Path ?? '').split(delimiter)) {
    if (!directory) continue
    candidates.push(join(directory, 'node_modules/npm/bin/npm-cli.js'))
    const executable = join(directory, 'npm')
    if (existsSync(executable)) candidates.push(realpathSync(executable))
  }
  const cli = candidates.find(path => path?.endsWith('npm-cli.js') && existsSync(path))
  if (!cli) throw new Error('Cannot find npm-cli.js. Install npm alongside Node.js or set npm_execpath to its entry point.')
  return { command: process.execPath, args: [cli] }
}
