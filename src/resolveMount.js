import {load as loadIni} from './ini'

const defaults = {
  url: 'http://localhost:8529/_db/_system',
  username: 'root',
  password: ''
}

export default async function resolveMount (mount = '') {
  let name
  const i = mount.lastIndexOf(':')
  if (i !== -1) {
    name = mount.slice(0, i)
    mount = mount.slice(i + 1)
  }
  if (!name) {
    if (mount && !mount.startsWith('/')) {
      name = mount
      mount = ''
    } else {
      name = 'default'
      if (process.env.FOXX_ARANGODB_SERVER_URL) {
        const server = {url: process.env.FOXX_ARANGODB_SERVER_URL, mount, name}
        if (process.env.FOXX_ARANGODB_SERVER_VERSION) {
          server.version = process.env.FOXX_ARANGODB_SERVER_VERSION
        }
        if (
          process.env.FOXX_ARANGODB_SERVER_USERNAME ||
          hasOwnProperty.call(process.env, 'FOXX_ARANGODB_SERVER_PASSWORD')
        ) {
          server.username = process.env.FOXX_ARANGODB_SERVER_USERNAME || 'root'
          server.password = process.env.FOXX_ARANGODB_SERVER_PASSWORD || ''
        } else if (process.env.FOXX_ARANGODB_SERVER_TOKEN) {
          server.token = process.env.FOXX_ARANGODB_SERVER_TOKEN
        }
        return server
      }
    }
  }
  const ini = await loadIni()
  if (hasOwnProperty.call(ini.server, name)) {
    return {...ini.server[name], name, mount}
  }
  if (name === 'default') {
    return {...defaults, name, mount}
  }
  return {name, mount}
}
