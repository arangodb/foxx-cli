import {resolve} from 'path'
import {common} from '../util/cli'
import {fatal} from '../util/text'
import {save as saveIgnore} from '../ignore'

export const command = 'ignore [patterns..]'
export const description = 'Add one or more patterns to the .foxxignore file'
export const aliases = ['exclude']

const describe = description

const args = [
  ['patterns', 'Patterns to add to the .foxxignore file']
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  force: {
    describe: 'Overwrite existing patterns (including defaults)',
    alias: 'f',
    type: 'boolean',
    default: false
  }
})

export function handler (argv) {
  const foxxignore = resolve(process.cwd(), '.foxxignore')
  saveIgnore(foxxignore, argv.patterns, argv.force)
  .catch(fatal)
}
