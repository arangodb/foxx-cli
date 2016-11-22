import {bold, white} from 'chalk'
import {common, validateServiceArgs} from '../util/cli'
import client from '../util/client'
import {resolveToFileStream} from '../util/fs'
import {fatal} from '../util/log'
import {inline as il} from '../util/text'
import resolveMount from '../resolveMount'

export const command = 'replace <mount-path> [source]'
export const description = 'Replace a mounted service'

const describe = description

const args = [
  ['mount-path', 'Database-relative path the service is mounted on'],
  ['source', `URL or file system path of the replacement service. Use ${bold('-')} to pass a zip file from stdin`, '[default: "."]']
]

export const builder = (yargs) => common(yargs, {command, describe, args})
.options({
  teardown: {
    describe: `Run the teardown script before replacing the service. Use ${bold('--no-teardown')} to disable`,
    type: 'boolean',
    default: true
  },
  setup: {
    describe: `Run the setup script after replacing the service. Use ${bold('--no-setup')} to disable`,
    type: 'boolean',
    default: true
  },
  development: {
    describe: 'Install the update in development mode. You can edit the service\'s files on the server and changes will be reflected automatically',
    alias: 'D',
    type: 'boolean',
    default: false
  },
  legacy: {
    describe: 'Install the update in legacy compatibility mode for legacy services written for ArangoDB 2.8 and earlier',
    type: 'boolean',
    default: false
  },
  force: {
    describe: 'If no service exists at the given mount path, fall back to installing the service instead of failing',
    alias: 'f',
    type: 'boolean',
    default: false
  },
  remote: {
    describe: `Let the ArangoDB server resolve ${bold('source')} instead of resolving it locally`,
    alias: 'R',
    type: 'boolean',
    default: false
  },
  cfg: {
    describe: 'Pass a configuration option as a name=value pair. This option can be specified multiple times',
    alias: 'c',
    type: 'string'
  },
  dep: {
    describe: 'Pass a dependency option as a name=/mountPath pair. This option can be specified multiple times',
    alias: 'd',
    type: 'string'
  }
})

export function handler (argv) {
  const opts = validateServiceArgs(argv)
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

    return replace(argv, server, opts)
  })
  .catch(fatal)
}

async function replace (argv, server, opts) {
  const source = (
    argv.remote
    ? argv.source
    : await resolveToFileStream(argv.source)
  )
  const db = client(server)
  const result = await db.replaceService(
    server.mount,
    source,
    {...opts, setup: argv.setup, teardown: argv.teardown}
  )
  console.log(JSON.stringify(result, null, 2))
}
