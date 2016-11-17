import {homedir} from 'os'
import {resolve} from 'path'
import {encode, decode} from 'ini'
import {exists, readFile, writeFile} from './util/fs'

const RC_FILENAME = '.foxxrc'

export async function load () {
  const defaults = {
    server: {}
  }
  const rcfile = resolve(homedir(), RC_FILENAME)
  if (!(await exists(rcfile))) {
    return defaults
  }
  const data = await readFile(rcfile, 'utf-8')
  const obj = decode(data)
  return Object.assign(defaults, obj)
}

export async function save (obj) {
  const rcfile = resolve(homedir(), RC_FILENAME)
  const data = encode(obj)
  await writeFile(rcfile, data)
}
