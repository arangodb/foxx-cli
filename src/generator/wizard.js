import {existsSync} from 'fs'
import {join} from 'path'
import {red, gray, green} from 'chalk'
import {prompt} from 'inquirer'
import {valid as validVersion, validRange} from 'semver'
import licenses from 'spdx-license-list'
import {uniq} from '../util/array'

const licenseMap = Object.create(null)
for (const key of Object.keys(licenses)) {
  licenseMap[key.toUpperCase()] = key
}

export default async function wizard (options) {
  const answers = await foxxWizard(options)
  answers.configuration = undefined
  answers.dependencies = undefined
  answers.provides = undefined

  const {defineConfiguration} = await prompt([
    {
      name: 'defineConfiguration',
      message: 'Define configuration options?',
      type: 'confirm',
      default: false
    }
  ])

  if (defineConfiguration) {
    const config = await configWizard()
    if (Object.keys(config).length) {
      answers.configuration = config
    }
    console.log()
  }
  const {defineDependencies} = await prompt([
    {
      name: 'defineDependencies',
      message: 'Define Foxx dependencies used by this service?',
      type: 'confirm',
      default: false
    }
  ])
  if (defineDependencies) {
    const deps = await depsWizard()
    if (Object.keys(deps).length) {
      answers.dependencies = deps
    }
    console.log()
  }
  const {defineProvided} = await prompt([
    {
      name: 'defineProvided',
      message: 'Define Foxx dependencies provided by this service?',
      type: 'confirm',
      default: false
    }
  ])
  if (defineProvided) {
    const provided = await providedWizard()
    if (Object.keys(provided).length) {
      answers.provides = provided
    }
    console.log()
  }
  return answers
}

async function foxxWizard ({cwd, ...options}) {
  const answers = await prompt([
    {
      name: 'name',
      message: 'Name',
      default: options.name
    },
    {
      name: 'version',
      message: 'Version',
      default: options.version,
      validate: (answer) => (
        Boolean(validVersion(answer)) ||
        `Not a valid semver version: "${red(answer)}"`
      )
    },
    {
      name: 'license',
      message: `License (ex: ${gray('MIT')})`,
      default: options.license,
      filter: (answer) => licenseMap[answer.toUpperCase()] || answer,
      validate: (answer) => {
        if (!answer) return true
        const licenseKey = answer.toUpperCase()
        if (hasOwnProperty.call(licenseMap, licenseKey)) return true
        const matches = Object.keys(licenseMap)
        .filter((key) => key.includes(licenseKey))
        .sort()
        .map((key) => green(licenseMap[key]))
        if (matches.length) {
          return (
            `Not a valid SPDX license: "${
              red(answer)
            }". Did you mean ${
              matches.length > 1
              ? `${
                matches.slice(0, -1).join(', ')
              } or ${
                matches[matches.length - 1]
              }`
              : matches[0]
            }?`
          )
        }
        return (
          `Not a valid SPDX license: "${
            red(answer)
          }". Leave empty for "all rights reserved".`
        )
      }
    },
    {
      name: 'authorEmail',
      message: `Author e-mail (ex: ${gray('jd@example.com')})`,
      default: options.authorEmail
    },
    {
      name: 'authorName',
      message: `Author name (ex: ${gray('John Doe')})`,
      default: (answers) => options.authorName || (
        answers.authorEmail
        ? answers.authorEmail.split('@')[0]
        : options.authorName
      )
    },
    {
      name: 'engineVersion',
      message: 'ArangoDB version',
      default: options.engineVersion,
      validate: (answer) => (
        Boolean(validRange(answer)) ||
        `Not a valid semver range: "${red(answer)}"`
      )
    },
    {
      name: 'description',
      message: 'Description',
      default: options.description
    },
    {
      name: 'documentCollections',
      message: `Document collection names (ex: ${gray('foo, bar')})`,
      default: options.documentCollections,
      filter: (answer) => {
        const names = uniq(
          answer.split(',')
          .map((name) => name.replace(/(^\s+|\s+$)/, ''))
          .filter(Boolean)
        )
        return names.length ? names : ''
      },
      validate: (answer) => {
        if (!answer) return true
        const bad = answer
        .filter((name) => !/^[_a-z][_a-z0-9]+$/i.test(name))
        .map((name) => `"${red(name)}"`)
        if (bad.length === 1) {
          return `The name ${bad[0]} is not a valid collection name.`
        }
        if (bad.length) {
          return (
            `The names ${
              bad.slice(0, -1).join(', ')
            } and ${
              bad[bad.length - 1]
            } are not valid collection names.`
          )
        }
        return true
      }
    },
    {
      name: 'edgeCollections',
      message: `Edge collection names (ex: ${gray('qux, baz')})`,
      default: options.edgeCollections,
      filter: (answer) => {
        const names = uniq(
          answer.split(',')
          .map((name) => name.replace(/(^\s+|\s+$)/, ''))
          .filter(Boolean)
        )
        return names.length ? names : ''
      },
      validate: (answer, answers) => {
        if (!answer || !answers.documentCollections) return true
        const bad = answer
        .filter((name) => !/^[_a-z][_a-z0-9]+$/i.test(name))
        .map((name) => `"${red(name)}"`)
        if (bad.length === 1) {
          return `The name ${bad[0]} is not a valid collection name.`
        }
        if (bad.length) {
          return (
            `The names ${
              bad.slice(0, -1).join(', ')
            } and ${
              bad[bad.length - 1]
            } are not valid collection names.`
          )
        }
        const dupes = answer
        .filter((name) => answers.documentCollections.includes(name))
        .map((name) => `"${red(name)}"`)
        if (dupes.length === 1) {
          return `The collection ${dupes[0]} is already a document collection.`
        }
        if (dupes.length) {
          return (
            `The collections ${
              dupes.slice(0, -1).join(', ')
            } and ${
              dupes[dupes.length - 1]
            } are already document collections.`
          )
        }
        return true
      }
    },
    {
      name: 'mainFile',
      message: 'Main entry file',
      default: options.mainFile,
      validate: (answer) => (
        (answer.length > 3 && answer.endsWith('.js')) ||
        `Not a valid JavaScript file name: "${red(answer)}"`
      )
    },
    {
      name: 'generateMain',
      message: (answers) => (
        existsSync(join(cwd, answers.mainFile))
        ? `Overwrite existing main entry file (${answers.mainFile})?`
        : `Generate main entry file (${answers.mainFile})?`
      ),
      type: 'confirm',
      default: (answers) => !existsSync(join(cwd, answers.mainFile))
    },
    {
      name: 'generateSetup',
      message: () => (
        existsSync(join(cwd, 'setup.js'))
        ? `Overwrite existing file "setup.js" with setup script?`
        : `Generate setup script (setup.js)?`
      ),
      type: 'confirm',
      default: (answers) => !existsSync(join(cwd, 'setup.js')) && Boolean(
        answers.documentCollections ||
        answers.edgeCollections
      )
    },
    {
      name: 'generateTeardown',
      message: () => (
        existsSync(join(cwd, 'teardown.js'))
        ? `Overwrite existing file "teardown.js" with teardown script?`
        : `Generate teardown script (teardown.js)?`
      ),
      type: 'confirm',
      default: (answers) => !existsSync(join(cwd, 'teardown.js')) && Boolean(
        answers.documentCollections ||
        answers.edgeCollections
      )
    },
    {
      name: 'generateLicense',
      message: (answers) => (
        existsSync(join(cwd, 'LICENSE'))
        ? `Overwrite existing license file (LICENSE)?`
        : `Generate license template (LICENSE)?`
      ),
      type: 'confirm',
      default: () => !existsSync(join(cwd, 'LICENSE'))
    },
    {
      name: 'generateReadMe',
      message: () => (
        existsSync(join(cwd, 'README.md'))
        ? `Overwrite existing readme file (README.md)?`
        : `Generate readme file (README.md)?`
      ),
      type: 'confirm',
      default: () => !existsSync(join(cwd, 'README.md'))
    },
    {
      name: 'generateDocumentRouters',
      message: 'Generate REST routes for document collections?',
      when: (answers) => Boolean(answers.documentCollections),
      type: 'confirm',
      default: false
    },
    {
      name: 'generateEdgeRouters',
      message: 'Generate REST routes for edge collections?',
      when: (answers) => Boolean(answers.edgeCollections),
      type: 'confirm',
      default: false
    },
    {
      name: 'generateExamples',
      message: (answers) => (
        (answers.generateDocumentRouters || answers.generateEdgeRouters)
        ? 'Generate additional example routes?'
        : 'Generate example routes?'
      ),
      when: (answers) => Boolean(answers.generateMain),
      type: 'confirm',
      default: false
    }
  ])
  const confirm = await prompt([
    {
      name: 'ok',
      message: 'Is this information correct?',
      type: 'confirm',
      default: true
    },
    {
      name: 'retry',
      message: 'Try again?',
      when: (answers) => !answers.ok,
      type: 'confirm',
      default: false
    }
  ])
  if (confirm.retry) {
    console.log()
    return await foxxWizard({...answers, cwd})
  }
  if (!confirm.ok) throw new Error('Aborted.')
  answers.license = {
    ...licenses[answers.license],
    id: answers.license
  }
  return answers
}

async function configWizard (configs = {}) {
  const {name, ...config} = await prompt([
    {
      name: 'name',
      message: 'Name',
      filter: (answer) => answer.replace(/(^\s+|\s+$)/g, '').replace(/\s+/g, '_'),
      validate: (answer) => (
        (answer && hasOwnProperty.call(configs, answer))
        ? `An option with the name "${red(answer)}" already exists.`
        : true
      )
    },
    {
      name: 'description',
      message: 'Description',
      when: (answers) => Boolean(answers.name)
    },
    {
      name: 'type',
      message: 'Type',
      when: (answers) => Boolean(answers.name),
      type: 'rawlist',
      choices: [
        {value: 'boolean', name: 'Boolean'},
        {value: 'string', name: 'String'},
        {value: 'password', name: 'Password (masked)'},
        {value: 'number', name: 'Number (decimal)'},
        {value: 'integer', name: 'Number (integer)'},
        {value: 'json', name: 'JSON expression'}
      ]
    },
    {
      name: 'default',
      message: 'Default value (JSON)',
      when: (answers) => Boolean(answers.name),
      validate: (answer) => {
        try {
          if (answer) JSON.parse(answer)
        } catch (e) {
          return (
            `Not a valid JSON expression: "${
              red(answer)
            }". Error: ${
              red(e.message)
            }`
          )
        }
        return true
      }
    },
    {
      name: 'required',
      message: 'Required?',
      when: (answers) => Boolean(answers.name) && !answers.default,
      type: 'confirm',
      default: true
    }
  ])
  if (!name) return configs
  if (!config.required) config.required = false
  if (!config.description) delete config.description
  if (!config.default) delete config.default
  configs[name] = config
  return await configWizard(configs)
}

async function depsWizard (deps = {}) {
  console.log()
  const {alias, ...dep} = await prompt([
    {
      name: 'alias',
      message: 'Local alias',
      filter: (answer) => answer.replace(/(^\s+|\s+$)/g, '').replace(/\s+/g, '_'),
      validate: (answer) => (
        (answer && hasOwnProperty.call(deps, answer))
        ? `A dependency with the alias "${red(answer)}" already exists.`
        : true
      )
    },
    {
      name: 'name',
      message: `Dependency name (ex: ${gray('@foxx/sessions')})`,
      when: (answers) => Boolean(answers.alias),
      default: '*',
      validate: (answer) => {
        if (!answer) return 'Dependency name can not be empty.'
        if (answer.includes(':')) return 'Dependency name must not contain colon.'
        return true
      }
    },
    {
      name: 'version',
      message: `Dependency version range (ex: ${gray('^1.0.0')})`,
      when: (answers) => Boolean(answers.alias),
      default: '*',
      validate: (answer) => (
        answer === '*' || Boolean(validRange(answer)) ||
        `Not a valid semver range: "${red(answer)}"`
      )
    },
    {
      name: 'required',
      message: 'Required?',
      when: (answers) => Boolean(answers.alias),
      type: 'confirm',
      default: true
    }
  ])
  if (!alias) return deps
  if (!dep.required) dep.required = false
  deps[alias] = dep
  return await depsWizard(deps)
}

async function providedWizard (provided = {}) {
  const {name, version} = await prompt([
    {
      name: 'name',
      message: `Dependency name (ex: ${gray('@foxx/sessions')})`,
      validate: (answer) => {
        if (!answer) return true
        if (hasOwnProperty.call(provided, answer)) {
          return `The service already provides "${red(answer)}".`
        }
        if (answer.includes(':')) {
          return 'Dependency name must not contain colon.'
        }
        return true
      }
    },
    {
      name: 'version',
      message: `Dependency version (ex: ${gray('1.0.0')})`,
      when: (answers) => Boolean(answers.name),
      validate: (answer) => (
        Boolean(validVersion(answer)) ||
        `Not a valid semver version: "${red(answer)}"`
      )
    }
  ])
  if (!name) return provided
  provided[name] = version
  return await providedWizard(provided)
}
