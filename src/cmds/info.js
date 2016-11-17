import {bold, gray, white} from 'chalk'
import {common} from '../util/cli'
import client from '../util/client'
import {fatal} from '../util/log'
import {group, inline as il} from '../util/text'
import resolveMount from '../resolveMount'

export const command = 'info [mount-path]'
export const description = 'Show mounted service information'
export const aliases = ['show', 'list', 'ls']

const describe = il`
  Shows detailed information about the service installed at the
  given ${bold('mount-path')}.

  If ${bold('mount-path')} is a server name or omitted,
  an overview of all installed services will be printed instead.
`

const args = [
  ['mount-path', 'Database-relative path of the service']
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  raw: {
    describe: 'Output raw JSON responses',
    type: 'boolean',
    default: false
  }
})

export function handler (argv) {
  resolveMount(argv.mountPath)
  .then((server) => {
    if (!server.url) {
      fatal(il`
        Not a valid server: "${white(server.name)}".
        Make sure the mount path always starts with a leading slash.
      `)
    }
    const db = client(server)
    if (!server.mount) return listServices(db, argv.raw)
    return showService(db, server.mount, argv.raw)
  })
  .catch(fatal)
}

async function showService (db, mount, raw) {
  const services = await db.getService(mount)
  console.log(JSON.stringify(services, null, 2))
  process.exit(0)
  // TODO formatted output when raw != true
}

async function listServices (db, raw) {
  const services = await db.listServices()
  if (raw) {
    console.log(JSON.stringify(services, null, 2))
    process.exit(0)
  }

  console.log(group(
    ...services.map((service) => [
      service.development ? bold(service.mount) : service.mount,
      prettyVersion(service)
    ])
  ))
}

function prettyVersion (service) {
  let parts = []
  if (service.name && service.version) {
    parts.push(`${service.name}@${service.version}`)
  } else {
    if (service.name) parts.push(service.name)
    if (service.version) parts.push(service.version)
  }
  if (service.legacy) parts.push(gray('(legacy)'))
  if (service.development) parts.push(bold('[DEV]'))
  return parts.join(' ')
}
