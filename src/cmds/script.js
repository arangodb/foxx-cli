import {gray, white} from 'chalk'
import {common} from '../util/cli'
import client from '../util/client'
import {fatal} from '../util/log'
import {group, inline as il} from '../util/text'
import resolveMount from '../resolveMount'

export const command = 'run <mount-path> [script-name] [options..]'
export const description = 'Run a script for a mounted service'
export const aliases = ['run-script', 'script', 'scripts']

const describe = description

const args = [
  ['mount-path', 'Database-relative path of the service'],
  ['script-name', 'Name of the script to execute'],
  ['options', 'Arguments that will be passed to the script']
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  raw: {
    describe: 'Output raw JSON response',
    type: 'boolean',
    default: false
  }
})

export function handler (argv) {
  // TODO sanity check argv
  resolveMount(argv.mountPath)
  .then((server) => {
    if (!server.mount) {
      fatal(il`
        Not a valid mount path: "${white(argv.mountPath)}".
        Make sure the mount path always starts with a leading slash.
      `)
    }

    if (!server.url) {
      fatal(il`
        Not a valid server: "${white(server.name)}".
        Make sure the mount path always starts with a leading slash.
      `)
    }

    const db = client(server)
    if (!argv.scriptName) return listScripts(db, server.mount, argv.raw)
    return runScript(db, server.mount, argv)
  })
  .catch(fatal)
}

async function runScript (db, mount, argv) {
  // TODO
  console.log(command, JSON.stringify(argv, null, 2))
  process.exit(0)
}

async function listScripts (db, mount, raw) {
  const scripts = await db.listServiceScripts(mount)
  const names = Object.keys(scripts)
  if (raw) {
    for (const name of names) {
      console.log(name)
    }
  } else if (!names.length) {
    console.log(gray('No scripts available.'))
  } else {
    console.log(group(
      ...names.map((name) => [
        name,
        scripts[name]
      ])
    ))
  }
  process.exit(0)
}
