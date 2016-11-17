import {resolve} from 'path'
import {walk} from './util/fs'
import zip from './util/zip'
import {buildMatcher} from './ignore'

export default async function createBundle (path, dest) {
  const foxxignore = resolve(path, '.foxxignore')
  const shouldIgnore = await buildMatcher(foxxignore)
  const files = await walk(path, shouldIgnore)
  return await zip(files, dest)
}
