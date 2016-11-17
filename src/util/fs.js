import fs from 'fs'
import {get} from 'http'
import {relative} from 'path'
import {parse} from 'url'
import walkdir from 'walkdir'
import {fatal} from './log'
import {inline as il} from './text'
import {promisify, promisify2} from './promise'
import createBundle from '../bundle'

export const readFile = promisify(fs.readFile)
export const writeFile = promisify(fs.writeFile)
export const exists = promisify2(fs.exists)
export const existsSync = fs.existsSync
export const createReadStream = fs.createReadStream
export const createWriteStream = fs.createWriteStream

export function isDirectorySync (path) {
  try {
    const stats = fs.statSync(path)
    return stats.isDirectory()
  } catch (e) {
    return false
  }
}

export function walk (basepath, shouldIgnore) {
  return new Promise((resolve, reject) => {
    const files = []
    const walker = walkdir(basepath)
    walker.on('file', (abspath, stats) => {
      if (!stats.isFile()) return
      const path = relative(basepath, abspath)
      if (shouldIgnore && shouldIgnore(path)) return
      files.push(path)
    })
    walker.on('error', (e) => reject(e))
    walker.on('end', () => resolve(files))
  })
}

export async function resolveToFileStream (path) {
  if (path === '-') {
    const stream = process.stdin
    stream.path = 'data.bin'
    return stream
  }

  const {protocol} = parse(path)
  if (protocol) return await downloadToStream(path)
  if (!(await exists(path))) {
    fatal(`No such file or directory: "${path}".`)
  }
  if (isDirectorySync(path)) return bundleToStream(path)
  return createReadStream(path)
}

function downloadToStream (path) {
  return new Promise((resolve) => {
    try {
      get(path, (res) => {
        if (res.statusCode >= 400) {
          fatal(il`
            Server responded with code ${
              res.statusCode
            } while fetching "${
              path
            }".
          `)
          process.exit(1)
        }
        resolve(res)
      })
    } catch (e) {
      fatal(`Failed to resolve URL "${path}".`)
    }
  })
}

async function bundleToStream (path) {
  const temppath = await createBundle(path)
  return createReadStream(temppath)
}
