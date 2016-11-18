import {bold, white} from 'chalk'
import {common} from '../util/cli'
import client from '../util/client'
import {fatal} from '../util/log'
import {inline as il} from '../util/text'
import resolveMount from '../resolveMount'

export const command = 'config <mount-path> [options..]'
export const description = 'Manage the configuration of a mounted service'
export const aliases = ['configuration', 'cfg']

const describe = description

const args = [
  ['mount-path', 'Database-relative path of the service'],
  ['options', `Key-value pairs to apply to the configuration. Use ${bold('-')} to pass a JSON file from stdin`]
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  force: {
    describe: il`
      Clear existing values for any omitted configuration options.
      Note that clearing required options with no default value will
      result in the service being disabled until new values are provided.
    `,
    alias: 'f',
    type: 'boolean',
    default: false
  },
  // interactive: {
  //   describe: 'Prompt for configuration values',
  //   alias: 'i',
  //   type: 'boolean',
  //   default: false
  // },
  raw: {
    describe: 'Output service configuration as raw JSON',
    type: 'boolean',
    default: false
  }
})
.example('$0 config /myfoxx', 'Shows the configuration for the mounted service at the URL "/myfoxx"')
.example('$0 config /myfoxx someNumber=23', 'Sets the "someNumber" configuration option to the number 23')
.example('echo \'{"someNumber": 23}\' | $0 config /myfoxx -', 'Sets the configuration using JSON data from stdin')
.example('$0 config /myfoxx -f', 'Clears the service configuration')

export function handler (argv) {
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
    // TODO handle write
    return showConfig(db, server.mount, argv)
  })
  .catch(fatal)
}

async function showConfig (db, mount, argv) {
  const config = await db.getServiceConfiguration(mount)
  // TODO prettyprint if !argv.raw
  console.log(JSON.stringify(config, null, 2))
}
