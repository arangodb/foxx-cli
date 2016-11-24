import {bold} from 'chalk'
import {readdirSync, existsSync} from 'fs'
import {basename, join} from 'path'
import {common} from '../util/cli'
import {warn, fatal} from '../util/log'
import {inline as il} from '../util/text'
import generateFiles from '../generator'
import wizard from '../generator/wizard'

export const command = 'init'
export const description = 'Create a new Foxx service'

const describe = description

export const builder = (yargs) => common(yargs, {command, describe})
.options({
  yes: {
    describe: 'Use default and example values instead of prompting for input',
    alias: 'y',
    type: 'boolean',
    default: false
  },
  no: {
    describe: 'Use minimal default values instead of prompting for input',
    alias: 'n',
    type: 'boolean',
    default: false
  },
  force: {
    describe: 'Overwrite manifest file if it already exists',
    alias: 'f',
    type: 'boolean',
    default: false
  },
  verbose: {
    describe: 'More output',
    alias: 'v',
    type: 'count'
  }
})

export function handler (argv) {
  if (argv.yes && argv.no) {
    fatal(il`
      Can't mix ${bold('--yes')} and ${bold('--no')}.
      You have to pick one or neither.`
    )
  }
  const cwd = process.cwd()
  const manifestPath = join(cwd, 'manifest.json')
  if (existsSync(manifestPath)) {
    if (!argv.force) {
      fatal(il`
        Manifest file already exists.
        Use ${bold('--force')} to overwrite.
      `)
    } else if (argv.verbose) {
      warn('Overwriting existing manifest file.')
    }
  }
  let mainFile = 'index.js'
  const indexFileExists = !existsSync(join(cwd, mainFile))
  if (!indexFileExists) {
    const jsFiles = readdirSync(cwd)
    .filter((name) => (!name.startsWith('.') && name.endsWith('.js')))
    if (jsFiles.length) mainFile = jsFiles.sort()[0]
  }
  if (argv.yes || argv.no) {
    console.log(JSON.stringify(argv, null, 2))
    process.exit(0)
  }
  wizard({
    cwd,
    mainFile,
    name: basename(cwd),
    version: '0.0.0',
    engineVersion: '^3.0.0'
  })
  .then((answers) => {
    const files = generateFiles(answers)
    console.log(JSON.stringify(files, null, 2))
  })
  .catch(fatal)
}
