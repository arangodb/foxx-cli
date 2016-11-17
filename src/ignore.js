import {Minimatch} from 'minimatch'
import {exists, readFile, writeFile} from './util/fs'

const defaults = ['.git/', '.svn/', '.hg/', '*.swp', '.DS_Store']

export async function buildMatcher (foxxignore) {
  const blacklist = []
  const whitelist = []
  let lines
  if (await exists(foxxignore)) {
    const text = await readFile(foxxignore, 'utf-8')
    lines = text.split(/\n|\r/g)
  } else {
    lines = defaults
  }
  for (const line of lines) {
    let list = blacklist
    let pattern = line.trim()
    if (pattern.startsWith('!')) {
      list = whitelist
      pattern = pattern.slice(1)
    }
    if (!pattern) continue
    if (pattern.endsWith('/')) pattern += ''
    if (!pattern.startsWith('/')) pattern = '**/' + pattern
    else pattern = pattern.slice(1)
    list.push(new Minimatch(pattern, {dot: true, nonegate: true}))
  }
  return (path) => (
    whitelist.every((matcher) => !matcher.match(path)) &&
    blacklist.some((matcher) => matcher.match(path))
  )
}

export async function save (foxxignore, values, overwrite) {
  const patterns = new Set(values)
  if (!overwrite) {
    if (await exists(foxxignore)) {
      const text = await readFile(foxxignore, 'utf-8')
      for (const line of text.split(/\n|\r/g)) {
        if (!line) continue
        patterns.add(line)
      }
    } else {
      for (const line of defaults) {
        patterns.add(line)
      }
    }
  }
  const lines = Array.from(patterns.values())
  await writeFile(foxxignore, lines.join('\n') + '\n')
}
