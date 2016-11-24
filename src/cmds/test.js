import {white, bold} from 'chalk'
import {common} from '../util/cli'
import client from '../util/client'
import {error, fatal} from '../util/log'
import {group, inline as il} from '../util/text'
import * as reporters from '../reporters'
import resolveMount from '../resolveMount'
import * as errors from '../errors'

export const command = 'test <mount-path>'
export const description = 'Run the tests of a mounted service'
export const aliases = ['tests', 'run-tests']

const describe = il`
  Run the tests of a mounted service.

  Output is controlled with the ${bold('--reporter')} option:
` + '\n\n' + group(
  ['spec', 'Hierarchical specification of nested test cases', '[aliases: suite]'],
  ['json', `Single large JSON object (implies ${bold('--raw')})`, '[aliases: default]'],
  ['list', 'Simple list of test cases'],
  ['min', 'Just the summary and failures'],
  ['tap', 'Output suitable for Test-Anything-Protocol consumers'],
  ['stream', 'Line-delimited JSON stream of "events" beginning with a single "start", followed by "pass" or "fail" for each test and ending with a single "end"'],
  ['xunit', 'Jenkins-compatible xUnit-style XML output']
)

const args = [
  ['mount-path', 'Database-relative path of the service']
]

export const builder = (yargs) => common(yargs, {command, aliases, describe, args})
.options({
  raw: {
    describe: 'Output unformated JSON response',
    type: 'boolean',
    default: false
  },
  reporter: {
    describe: 'Reporter to use for result data',
    alias: 'R',
    choices: [
      'spec',
      'suite',
      'json',
      'default',
      'list',
      'min',
      'tap',
      'stream',
      'xunit'
    ],
    default: 'spec'
  }
})

export function handler (argv) {
  resolveMount(argv.mountPath)
  .then((server) => {
    if (!server.mount) {
      fatal(il`
        Not a valid mount path: "${white(argv.mountPath)}".
        Make sure the mount path always starts with a leading slash.
      `)
    }

    if (!server.url) {
      fatal(il`
        Not a valid server: "${white(server.name)}".
        Make sure the mount path always starts with a leading slash.
      `)
    }

    const db = client(server)
    return runTests(db, server.mount, argv)
  })
  .catch(fatal)
}

async function runTests (db, mount, {reporter: cliReporter, raw}) {
  if (cliReporter === 'spec') cliReporter = 'suite'
  else if (cliReporter === 'json') cliReporter = 'default'
  let apiReporter = cliReporter

  if (
    cliReporter === 'list' ||
    cliReporter === 'min' ||
    cliReporter === 'tap' ||
    cliReporter === 'xunit'
  ) {
    apiReporter = 'default'
  }

  try {
    const start = new Date().toISOString()
    const result = await db.runServiceTests(mount, {reporter: apiReporter})

    if (raw || cliReporter === 'default') {
      console.log(JSON.stringify(result, null, 2))
      switch (apiReporter) {
        case 'suite':
        case 'default':
          process.exit(result.stats.failures ? 1 : 0)
          break
        case 'stream':
          process.exit(result[result.length - 1][1].failures ? 1 : 0)
          break
        default:
          throw new Error(`Unknown reporter type "${white(apiReporter)}".`)
      }
    }

    switch (cliReporter) {
      case 'list':
      case 'min':
        reporters.list(result, cliReporter === 'min')
        break
      case 'suite':
        reporters.suite(result)
        break
      case 'stream':
        reporters.stream(result)
        break
      case 'tap':
        reporters.tap(result)
        break
      case 'xunit':
        const hostname = db._connection._baseUrl.hostname
        reporters.xunit(result, {start, mount, hostname})
        break
      default:
        throw new Error(`Unknown reporter type "${white(apiReporter)}".`)
    }
  } catch (e) {
    if (e.isArangoError) {
      switch (e.errorNum) {
        case errors.ERROR_SERVICE_NOT_FOUND:
          error(`No service found at "${white(mount)}".`)
          process.exit(1)
          break
        case errors.ERROR_SERVICE_NEEDS_CONFIGURATION:
          error(`Service at "${white(mount)}" is missing configuration or dependencies.`)
          process.exit(1)
          break
        case errors.ERROR_MODULE_NOT_FOUND:
          error('An error occured while trying to execute the tests:')
          error(e)
          error('This typically means the tests tried to require a path that does not exist.')
          error('Make sure the service bundle includes all the files you expect.')
          process.exit(1)
          break
        case errors.ERROR_MODULE_FAILURE:
          error('An error occured while trying to execute the tests:')
          error(e)
          error(il`
            Make sure all tests are specified via the manifest
            not loaded directly from another test file.
          `)
          process.exit(1)
          break
      }
    }
    throw e
  }
}
