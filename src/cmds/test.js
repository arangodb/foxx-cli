import {unsplat} from '../util/array'
import {common} from '../util/cli'

export const command = 'test <mount-path>'
export const description = 'Run the tests of a mounted service'
export const aliases = ['tests', 'run-tests']

const describe = description

const args = [
  ['mount-path', 'Database-relative path of the service']
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  raw: {
    describe: `Don't format output`,
    type: 'boolean',
    default: false
  },
  reporter: {
    describe: 'Reporter to use for result data',
    type: 'string'
  }
})

export function handler (argv) {
  console.log(command, JSON.stringify(argv, null, 2))
  const reporter = unsplat(argv.reporter)
}
