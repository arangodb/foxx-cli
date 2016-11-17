import {bold} from 'chalk'
import yargs from 'yargs'
import {unsplat} from '../util/array'
import {common} from '../util/cli'
import {fatal} from '../util/log'
import {inline as il} from '../util/text'

export const command = 'download <mount-path>'
export const description = 'Download a mounted service'
export const aliases = ['dl']

const describe = description

const args = [
  ['mount-path', 'Database-relative path of the service']
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  outfile: {
    describe: 'Write or extract the bundle to this path. If omitted, bundle will be written to stdout or extracted to the current working directory',
    alias: 'o',
    type: 'string'
  },
  extract: {
    describe: 'Extract zip bundle instead of just downloading it',
    alias: 'x',
    type: 'boolean',
    default: false
  },
  force: {
    describe: `If ${
      bold('--outfile')
    } and/or ${
      bold('--extract')
    } were specified, any existing files will be overwritten.\nIf neither ${
      bold('--outfile')
    } nor ${
      bold('--extract')
    } were specified, write to stdout no matter what stdout is`,
    alias: 'f',
    type: 'boolean',
    default: false
  },
  delete: {
    describe: `When using ${
      bold('--extract')
    } delete any existing files in the directory that are not contained in the bundle`,
    type: 'boolean',
    default: false
  },
  verbose: {
    describe: 'More output',
    alias: 'v',
    type: 'boolean',
    count: true,
    default: false
  }
})
.example('$0 download /hello', 'Downloads the Foxx service mounted at the URL "/hello" and writes the bundle to stdout')
.example('$0 download -x /hello', 'Extracts the bundle to the current directory')
.example('$0 download /hello -o hello.zip ', 'Writes the bundle to the file "hello.zip"')
.example('$0 download -f /hello -o hello.zip ', 'Writes the bundle to "hello.zip" even if that file already exists')
.example('$0 download -x /hello -o /tmp/hello', 'Extracts the bundle to the directory "/tmp/hello"')
.example('$0 download -xf /hello -o /tmp/hello', 'Extracts the bundle and overwrites any existing files')
.example('$0 download -x --delete /hello -o /tmp/hello', 'Extracts the bundle and removes any other existing files')

export function handler (argv) {
  console.log(command, JSON.stringify(argv, null, 2))
  argv.outfile = unsplat(argv.outfile)
  if (argv.delete && !argv.extract) {
    yargs.showHelp()
    fatal(il`
      Must use ${bold('--extract')} for ${bold('--delete')} to have any effect.
    `)
  }
}
