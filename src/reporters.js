import {red, green, cyan, gray} from 'chalk'
import {indentable as indentableLog} from './util/log'

export function list (result, minimal = false) {
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
  return errors.length
}

export function suite (result) {
  const logger = indentableLog(1)
  const errors = []
  logger.log()
  printSuite(result, logger, errors, [])
  logger.log()
  printSummaryAndErrors(result.stats, logger, errors)
  logger.log()
  return errors.length
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
