import {red, green, cyan, gray, white, bold} from 'chalk'
import {common} from '../util/cli'
import client from '../util/client'
import {fatal, indentable as indentableLog} from '../util/log'
import {group, inline as il} from '../util/text'
import resolveMount from '../resolveMount'

function attr (str) {
  return String(str)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
}

function cdata (str) {
  return String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
}

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
      listReporter(result, cliReporter === 'min')
      break
    case 'suite':
      suiteReporter(result)
      break
    case 'stream':
      streamReporter(result)
      break
    case 'tap':
      tapReporter(result)
      break
    case 'xunit':
      const hostname = db._connection._baseUrl.hostname
      xunitReporter(result, {start, mount, hostname})
      break
    default:
      throw new Error(`Unknown reporter type "${white(apiReporter)}".`)
  }
}

function streamReporter (result) {
  let failed = false
  for (const row of result) {
    console.log(JSON.stringify(row))
    if (row[0] === 'fail') failed = true
  }
  process.exit(failed ? 1 : 0)
}

function tapReporter (result) {
  const logger = indentableLog()
  logger.log(`1..${result.stats.tests}`)
  for (let i = 0; i < result.tests.length; i++) {
    const test = result.tests[i]
    if (test.err.stack) {
      logger.log('not ok', i + 1, test.fullTitle)
      const [message, ...stack] = test.err.stack.split('\n')
      logger.indent()
      logger.log(message)
      for (const line of stack) {
        logger.log(line)
      }
      logger.dedent()
    } else if (!hasOwnProperty.call(test, 'duration')) {
      logger.log('ok', i + 1, test.fullTitle, '# SKIP -')
    } else {
      logger.log('ok', i + 1, test.fullTitle)
    }
  }
  logger.log('# tests', result.stats.tests)
  logger.log('# pass', result.stats.passes)
  logger.log('# fail', result.stats.failures)
  process.exit(result.stats.failures ? 1 : 0)
}

function xunitReporter (result, {start, mount}) {
  const logger = indentableLog(0)
  logger.log('<?xml version="1.0" encoding="UTF-8"?>')
  logger.log(il`
    <testsuite
    name="${attr(mount)}"
    timestamp=${start}
    tests="${result.stats.tests || 0}"
    errors="0"
    failures="${result.stats.failures || 0}"
    skip="${result.stats.pending || 0}"
    time="${result.stats.duration || 0}">
  `)
  logger.indent()
  for (const test of result.tests) {
    const parentName = test.fullTitle.slice(0, -(test.title.length + 1)) || 'global'
    logger.log(il`
      <testcase
      classname="${attr(parentName)}"
      name="${attr(test.title)}"
      time="${test.duration || 0}"${test.err.stack ? '' : '/'}>
    `)
    if (test.err.stack) {
      const [cause, ...stack] = test.err.stack.split('\n')
      const [type, ...message] = cause.split(': ')
      logger.indent()
      logger.log(il`
        <failure
        type="${attr(type)}"
        message="${attr(message.join(': '))}">
      `)
      logger.indent()
      logger.log(cdata(cause))
      for (const line of stack) {
        logger.log(cdata(line))
      }
      logger.dedent()
      logger.log('</failure>')
      logger.dedent()
      logger.log('</testcase>')
    }
  }
  logger.dedent()
  logger.log('</testsuite>')
  process.exit(result.stats.failures ? 1 : 0)
}

function listReporter (result, minimal = false) {
  const logger = indentableLog(1)
  const errors = []
  logger.log()
  if (minimal) {
    for (const test of result.tests) {
      if (test.err.stack) {
        errors.push({stack: test.err.stack, fullTitle: test.fullTitle})
      }
    }
  } else {
    for (const test of result.tests) {
      if (test.err.stack) {
        logger.log(red(`${errors.length}) ${test.fullTitle}`))
        errors.push({stack: test.err.stack, fullTitle: test.fullTitle})
      } else if (!hasOwnProperty.call(test, 'duration')) {
        logger.log(green('-'), cyan(test.fullTitle))
      } else {
        logger.log(green('․'), gray(`${test.fullTitle}:`), gray(`${test.duration}ms`))
      }
    }
    logger.log()
  }
  printSummaryAndErrors(result.stats, logger, errors)
  logger.log()
  process.exit(errors.length ? 1 : 0)
}

function suiteReporter (result) {
  const logger = indentableLog(1)
  const errors = []
  logger.log()
  printSuite(result, logger, errors, [])
  logger.log()
  printSummaryAndErrors(result.stats, logger, errors)
  logger.log()
  process.exit(errors.length ? 1 : 0)
}

function printSuite (suite, logger, errors, title) {
  if (suite.title) logger.log(suite.title)
  if (!suite.stats) logger.indent()
  for (const test of suite.tests) {
    if (test.err.stack) {
      logger.log(red(`${errors.length}) ${test.title}`))
      errors.push({stack: test.err.stack, fullTitle: [...title, test.title].join(' ')})
    } else if (!hasOwnProperty.call(test, 'duration')) {
      logger.log(cyan('-'), cyan(test.title))
    } else {
      logger.log(green('✓'), gray(test.title), gray(`(${test.duration}ms)`))
    }
  }
  if (suite.stats && suite.tests.length && suite.suites.length) logger.log()
  for (const child of suite.suites) {
    printSuite(child, logger, errors, suite.title ? [...title, suite.title] : title)
    if (suite.stats) logger.log()
  }
  if (!suite.stats) logger.dedent()
}

function printSummaryAndErrors (stats, logger, errors) {
  if (stats.passes || !errors.length) {
    logger.log(
      green(`${stats.passes} passing`),
      gray(`(${stats.duration}ms)`)
    )
  }
  if (stats.pending) {
    logger.log(cyan(`${stats.pending} pending`))
  }
  if (errors.length) {
    logger.log(red(`${stats.failures} failing`))
    logger.log()
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i]
      logger.log(`${i}) ${error.fullTitle}`)
      const [message, ...stack] = error.stack.split('\n')
      logger.indent()
      logger.log(red(message))
      logger.indent()
      for (const line of stack) {
        logger.log(gray(line.trimLeft()))
      }
      logger.dedent(2)
      logger.log()
    }
  }
}
