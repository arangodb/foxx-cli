import {common} from '../util/cli'
import {group, inline as il} from '../util/text'

export const command = 'server <command>'
export const description = 'Manage ArangoDB server credentials'
export const aliases = ['remote']

const describe = il`
  The server commands allow defining server names that can be used with
  other commands or as part of service mount paths to avoid passing the
  same credentials to every command.

  It is also possible to invoke commands with the following environment
  variables to override the default server without explicitly defining
  credentials:
` + '\n\n' + group(
  ['FOXX_ARANGODB_SERVER_URL', 'Fully qualified URL of the ArangoDB database'],
  ['FOXX_ARANGODB_SERVER_USERNAME', 'Username to authenticate with'],
  ['FOXX_ARANGODB_SERVER_PASSWORD', 'Password to authenticate with'],
  ['FOXX_ARANGODB_SERVER_TOKEN', 'Bearer token to authenticate with (overrides username/password)']
)

export const builder = (yargs) => common(yargs, {command, aliases, describe})
.command(require('./server/info'))
.command(require('./server/remove'))
.command(require('./server/set'))
