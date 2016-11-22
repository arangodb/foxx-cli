import {red, yellow, bold} from 'chalk'
import {format, isError} from 'util'
import packageJson from '../../package.json'

const bugsUrl = packageJson.bugs.url

export function warn (message) {
  if (isError(message)) message = message.stack || message.message || message
  console.error(yellow(format(message)))
}

export function error (message) {
  if (isError(message)) message = message.stack || message.message || message
  console.error(red(format(message)))
}

export function fatal (err) {
  if (err.code === 'ECONNREFUSED') {
    error(`Connection refused: ${
      red.bold(err.address)}:${red.bold(err.port)
    }\nAre you offline?`)
  } else if (err.isArangoError) {
    error(`Unexpected ArangoDB error (Code: ${
      err.errorNum || '?'
    }):\n${
      err.message
    }`)
  } else {
    error(
      `Sorry! An unexpected error occurred. This is likely a bug in ${bold('foxx-cli')}.\n` +
      `Please open an issue at ${bold(bugsUrl)} with a full copy of the following error message ` +
      'and a description of what you were trying to do when this problem occured.\n\n' +
      bold(format(err.stack || err.message || err)) + '\n\n' +
      'We apologize for the inconvenience.'
    )
  }
  process.exit(1)
}
