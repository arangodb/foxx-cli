import {bold, white} from 'chalk'
import {resolve} from 'path'
import {unsplat} from '../util/array'
import {common} from '../util/cli'
import {existsSync, isDirectorySync} from '../util/fs'
import {fatal} from '../util/log'
import {inline as il} from '../util/text'
import bundle from '../bundle'

export const command = 'bundle [source]'
export const description = 'Create a service bundle for a service'
export const aliases = ['zip']

const describe = description

const args = [
  ['source', 'File system path of the service directory to bundle', '[default: "."]']
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  outfile: {
    describe: 'Write the zip bundle to this file. If omitted, bundle is written to stdout',
    alias: 'o',
    type: 'string'
  },
  force: {
    describe: `Write to stdout if no ${
      bold('--outfile')
    } was specified, no matter what stdout is`,
    alias: 'f',
    type: 'boolean',
    default: false
  },
  sloppy: {
    describe: 'Continue even if no manifest file is present in the source directory',
    alias: 's',
    type: 'boolean',
    default: false
  }
})

export function handler (argv) {
  const source = unsplat(argv.source) || process.cwd()
  console.log(JSON.stringify(argv, null, 2))
  if (!isDirectorySync(source)) {
    fatal(il`
      Source directory "${
        white(source)
      }" is either not a directory or does not exist.
    `)
  }
  if (!argv.sloppy && !existsSync(resolve(source, 'manifest.json'))) {
    fatal(il`
      Source directory "${
        white(source)
      }" does not contain a manifest file. Use ${
        bold('--sloppy')
      } if you want to skip this check.
    `)
  }
  let out = argv.outfile
  if (!out) {
    if (!argv.force && process.stdout.isTTY) {
      fatal(il`
        Refusing to write binary data to stdout. Use ${
          bold('--force')
        } if you really want to do this.
      `)
    }
    out = process.stdout
  }
  bundle(source, out)
  .catch(fatal)
}
