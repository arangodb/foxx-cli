import {white} from 'chalk'
import {common} from '../util/cli'
import client from '../util/client'
import {fatal} from '../util/log'
import {inline as il} from '../util/text'
import resolveMount from '../resolveMount'

export const command = 'set-prod <mount-path>'
export const description = 'Disable development for a mounted service'
export const aliases = ['set-production']

const describe = description

const args = [
  ['mount-path', 'Database-relative path of the service']
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})

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
    return db.disableServiceDevelopmentMode(server.mount)
  })
  .catch(fatal)
}
