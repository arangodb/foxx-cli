import {version} from '../package.json'
import yargs from '.'

const argv = yargs.argv
if (!argv._.length) {
  if (argv.version) {
    console.log(version)
    process.exit(0)
  } else {
    yargs.showHelp()
    process.exit(1)
  }
}
