"use strict";
const { parse: parseUrl } = require("url");
const { parse: parseQuery } = require("querystring");

module.exports = function parseServerUrl(input) {
  const url = parseUrl(input);
  const server = {};
  if (url.auth) {
    const [username, ...password] = url.auth.split(":");
    server.username = username;
    if (password.length) {
      server.password = password.join(":");
    }
  }
  if (url.hash) {
    const query = parseQuery(url.hash.slice(1));
    if (query.version !== undefined) server.version = query.version;
    if (query.mount !== undefined) server.mount = query.mount;
    if (query.token !== undefined) server.token = query.token;
  }
  const protocol =
    url.protocol === "tcp:"
      ? "http:"
      : url.protocol === "ssl:" ? "https:" : url.protocol;
  server.url = `${protocol}//${url.host}${url.pathname}`;
  return server;
};
