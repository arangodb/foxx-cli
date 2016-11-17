import {bold} from 'chalk'
import {common} from '../util/cli'
import {inline as il} from '../util/text'

export const command = 'deps <mount-path> [options..]'
export const description = 'Manage the dependencies of a mounted service'
export const aliases = ['dependencies', 'dep']

const describe = description

const args = [
  ['mount-path', 'Database-relative path of the service'],
  ['options', `Key-value pairs to apply to the dependencies. Use ${
    bold('-')
  } to pass a JSON file from stdin`]
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  force: {
    describe: il`
      Clear existing values for any omitted dependencies.
      Note that clearing required dependencies will result in
      the service being disabled until new values are provided.
    `,
    alias: 'f',
    type: 'boolean',
    default: false
  },
  interactive: {
    describe: 'Prompt for dependency values',
    alias: 'i',
    type: 'boolean',
    default: false
  },
  raw: {
    describe: 'Output service dependencies as raw JSON',
    type: 'boolean',
    default: false
  }
})
.example('$0 deps /myfoxx', 'Show the dependencies for the service mounted at "/foxxmail"')
.example('$0 deps /myfoxx mailer=/foxxmail', 'Sets the "mailer" dependency to the service mounted at "/foxxmail"')
.example('echo \'{"mailer": "/foxxmail"}\' | $0 deps /myfoxx -', 'Sets the dependency using JSON data from stdin')
.example('$0 deps /myfoxx -f', 'Clears all configured dependencies')

export function handler (argv) {
  console.log(command, JSON.stringify(argv, null, 2))
}
