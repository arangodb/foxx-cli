import {bold, white} from 'chalk'
import {prompt} from 'inquirer'
import {validRange} from 'semver'
import {unsplat} from '../../util/array'
import {common} from '../../util/cli'
import {fatal} from '../../util/log'
import {inline as il} from '../../util/text'
import {load as loadIni, save as saveIni} from '../../ini'

export const command = 'set <name> <url>'
export const description = 'Define server'
export const aliases = ['add']

const describe = description

const args = [
  ['name', 'Server name to define'],
  ['url', 'Fully qualified URL of the ArangoDB database']
]

export const builder = (yargs) => common(yargs, {command, sub: 'server', aliases, describe, args})
.options({
  'arango-version': {
    describe: 'ArangoDB server version',
    alias: 'V',
    type: 'string'
  },
  username: {
    describe: 'Username to authenticate with',
    alias: 'u',
    type: 'string',
    default: 'root'
  },
  password: {
    describe: 'Use password to authenticate',
    alias: 'P',
    type: 'boolean',
    default: false
  },
  token: {
    describe: 'Use bearer token to authenticate',
    alias: 'T',
    type: 'boolean',
    default: false
  }
})
.example('$0 server set dev http://localhost:8529/_db/_system', 'Set the "dev" server to the ArangoDB instance at "http://localhost:8529/_db/_system" with user "root" and empty password')
.example('$0 server set staging https://proxy.local', 'Set the "staging" server to the ArangoDB instance at "https://proxy.local" with user "root" and empty password')
.example('$0 server set staging https://proxy.local -u devel', 'Set the "staging" server to the ArangoDB instance at "https://proxy.local" with user "devel" and empty password')
.example('$0 server set staging https://proxy.local -u devel -P', 'Set the "staging" server to the ArangoDB instance at "https://proxy.local" with user "devel" and a password read from stdin')
.example('$0 server set staging https://proxy.local -T', 'Set the "staging" server to the ArangoDB instance at "https://proxy.local" with a bearer token read from stdin')

export function handler (argv) {
  if (argv.password && argv.token) {
    fatal(il`
      Can not use both ${
        bold('password')
      } and ${
        bold('token')
      } authentication for the same server.
    `)
  }
  if (argv.arangoVersion && !validRange(argv.arangoVersion)) {
    fatal(il`
      Not a valid semver version: "${white(argv.arangoVersion)}".
    `)
  }
  if (argv.name.startsWith('/')) {
    fatal(il`
      The server name must not start with a slash: "${white(argv.name)}".
    `)
  }
  buildServer(argv)
  .then((server) => (
    loadIni()
    .then((ini) => {
      ini.server[argv.name] = server
      return saveIni(ini)
    })
  ))
  .catch(fatal)
}

async function buildServer (argv) {
  const server = {url: argv.url}
  if (argv.arangoVersion) {
    server.version = unsplat(argv.arangoVersion)
  }
  if (argv.username) {
    server.username = unsplat(argv.username)
    server.password = ''
  }
  if (argv.password) {
    const {password} = await prompt([{
      message: 'Password',
      name: 'password',
      type: 'password'
    }])
    server.password = password
  }
  if (argv.token) {
    const {token} = await prompt([{
      message: 'Token',
      name: 'token',
      type: 'password',
      validate: Boolean
    }])
    server.token = token
  }
  return server
}
