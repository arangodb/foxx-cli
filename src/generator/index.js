import {render} from 'ejs'
import {join} from 'path'
import {readFileSync} from 'fs'

const TEMPLATE_PATH = join(__dirname, '..', '..', 'templates')

export function generateManifest (options) {
  const manifest = {
    name: options.name,
    version: options.version,
    engines: {
      arangodb: options.engineVersion
    },
    main: options.mainFile
  }

  if (options.license) manifest.license = options.license.id
  else if (options.generateLicense) manifest.license = 'SEE LICENSE IN LICENSE'

  if (options.description) manifest.description = options.description
  if (options.configuration) manifest.configuration = options.configuration
  if (options.dependencies) manifest.dependencies = options.dependencies
  if (options.provides) manifest.provides = options.provides

  if (options.authorEmail) {
    manifest.author = `${options.authorName || options.authorEmail.split('@')[0]} <${options.authorEmail}>`
  } else if (options.authorName) manifest.author = options.authorName

  if (options.generateSetup || options.generateTeardown) {
    manifest.scripts = {}
    if (options.generateSetup) manifest.scripts.setup = 'setup.js'
    if (options.generateTeardown) manifest.scripts.teardown = 'teardown.js'
  }

  return JSON.stringify(manifest, null, 2)
}

export function generateFile (name, data) {
  const template = readFileSync(join(TEMPLATE_PATH, `${name}.ejs`), 'utf-8')
  return render(template, data)
}

export function generateLicense (options) {
  if (!options.license) return generateFile('LICENSE', options)
  const path = require.resolve(`spdx-license-list/licenses/${options.license.id}.txt`)
  return readFileSync(path, 'utf-8')
  .replace(/<<var;name=[^;]+;original=([^;]+);match=[^>]+>>/g, '$1')
  .replace(/<<beginOptional;name=[^>]+>>/g, '')
  .replace(/<<endOptional>>/g, '')
}

export default function generateFiles (options) {
  const files = []
  files.push({name: 'manifest.json', content: generateManifest(options)})
  if (options.generateReadMe) {
    files.push({name: 'README.md', content: generateFile('README.md', options)})
  }
  if (options.generateLicense) {
    files.push({name: 'LICENSE', content: generateLicense(options)})
  }
  return files
}
