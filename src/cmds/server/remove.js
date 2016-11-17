import {common} from '../../util/cli'
import {fatal} from '../../util/log'
import {load as loadIni, save as saveIni} from '../../ini'

export const command = 'remove <name>'
export const description = 'Remove server'
export const aliases = ['rm']

const describe = description

const args = [
  ['name', 'Server name to forget']
]

export const builder = (yargs) => common(yargs, {command, sub: 'server', aliases, describe, args})

export function handler (argv) {
  loadIni()
  .then((ini) => {
    const servers = Object.keys(ini.server)
    if (!servers || !servers.includes(argv.name)) return
    delete ini.server[argv.name]
    return saveIni(ini)
  })
  .catch(fatal)
}
