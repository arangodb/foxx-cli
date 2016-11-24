import {red, yellow, bold} from 'chalk'
import {format, isError} from 'util'
import packageJson from '../../package.json'

const bugsUrl = packageJson.bugs.url

export function indentable (start = 0) {
  return {
    level: start,
    log (...messages) {
      if (!messages.length) console.log()
      else if (this.level <= 0) console.log(...messages)
      else console.log(' '.repeat(this.level * 2 - 1), ...messages)
    },
    indent (level = 1) {
      this.level += level
    },
    dedent (level = 1) {
      this.level -= level
    }
  }
}

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
  } else if (err.statusCode === 401) {
    error('Authentication failed. Bad username or password?')
  } else if (typeof err.statusCode === 'number') {
    error(
      `The server responded with a ${bold(err.statusCode)} status code.\n` +
      (
        err.statusCode >= 500
        ? 'This typically indicates a server-side error.\n'
        : 'This typically indicates a problem with the request.\n'
      ) +
      'Please check the ArangoDB log file to determine the cause of this error.\n\n' +
      `If you believe this to be an bug in ${bold('foxx-cli')} ` +
      `please open an issue at ${bold(bugsUrl)} with the relevant part of the ArangoDB log` +
      'and a description of what you were trying to do when this problem occured.\n\n' +
      'We apologize for the inconvenience.'
    )
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
