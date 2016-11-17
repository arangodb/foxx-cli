import {Database} from 'arangojs'

export default function (server) {
  const db = new Database({
    url: server.url,
    databaseName: false
  })
  if (server.token) {
    db.useBearerAuth(server.token)
  } else if (server.username || server.password) {
    db.useBasicAuth(server.username, server.password)
  }
  return db
}
