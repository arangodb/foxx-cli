import {bold, white} from 'chalk'
import {common} from '../../util/cli'
import {fatal} from '../../util/log'
import {comma, group, inline as il, mask} from '../../util/text'
import {load as loadIni} from '../../ini'

export const command = 'info [name]'
export const description = 'Show server information'
export const aliases = ['show', 'list', 'ls']

const describe = description

const args = [
  ['name', 'Server name to show details of']
]

export const builder = (yargs) => common(yargs, {command, sub: 'server', aliases, describe, args})
.options({
  verbose: {
    describe: 'Include passwords and tokens in details or URLs in list',
    alias: ['v'],
    type: 'boolean',
    default: false
  }
})

export function handler (argv) {
  loadIni()
  .then((ini) => {
    const servers = Object.keys(ini.server)
    if (argv.name) {
      if (!servers.length) {
        fatal('No servers defined.')
      }
      if (!servers.includes(argv.name)) {
        fatal(il`
          No such server: "${white(argv.name)}".
          Known servers: ${comma(servers.sort().map((name) => bold(name)))}
        `)
      }
      const server = ini.server[argv.name]
      console.log(argv.name)
      console.log('URL:', server.url)
      if (hasOwnProperty.call(server, 'version')) console.log('Version:', server.version)
      if (hasOwnProperty.call(server, 'username')) console.log('Username:', server.username)
      if (argv.verbose) {
        if (hasOwnProperty.call(server, 'password')) console.log('Password:', server.password)
        if (hasOwnProperty.call(server, 'token')) console.log('Token:', server.token)
      } else {
        if (hasOwnProperty.call(server, 'password')) console.log('Password:', mask(server.password))
        if (hasOwnProperty.call(server, 'token')) console.log('Token:', mask(server.token))
      }
      process.exit(0)
    }
    if (!servers) return
    if (!argv.verbose) {
      for (const name of servers) {
        console.log(name)
      }
      return
    }
    console.log(group(
      ...servers.map((name) => [
        name,
        ini.server[name].url
      ])
    ))
  })
  .catch(fatal)
}
