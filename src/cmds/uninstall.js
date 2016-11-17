import {bold, white} from 'chalk'
import {common} from '../util/cli'
import client from '../util/client'
import {fatal} from '../util/log'
import {inline as il} from '../util/text'
import {ERROR_SERVICE_NOT_FOUND} from '../errors'
import resolveMount from '../resolveMount'

export const command = 'uninstall <mount-path>'
export const description = 'Uninstall a mounted service'
export const aliases = ['remove', 'purge']

const describe = description

const args = [
  ['mount-path', 'Database-relative path the service is mounted on']
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  teardown: {
    describe: `Run the teardown script before uninstalling the service. Use ${bold('--no-teardown')} to disable`,
    type: 'boolean',
    default: true
  }
})

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

    return uninstall(argv, server)
  })
  .catch(fatal)
}

async function uninstall (argv, server) {
  const db = client(server)
  try {
    await db.uninstallService(
      server.mount,
      {teardown: argv.teardown}
    )
  } catch (e) {
    if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
      console.log(`No service found at "${
        server.mount
      }".\nNothing to uninstall.`)
      process.exit(0)
    }
    throw e
  }
}
