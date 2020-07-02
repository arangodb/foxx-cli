"use strict";
const { Database } = require("arangojs");

module.exports = function (server) {
  const db = new Database({ url: server.url });
  if (server.database !== "_system") {
    db.useDatabase(server.database);
  }
  if (server.token) {
    db.useBearerAuth(server.token);
  } else if (server.username || server.password) {
    db.useBasicAuth(server.username, server.password);
  }
  return db;
};
