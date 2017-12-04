"use strict";
const { parse: parseUrl } = require("url");

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
  const protocol =
    url.protocol === "tcp:"
      ? "http:"
      : url.protocol === "ssl:" ? "https:" : url.protocol;
  if (protocol && url.host) {
    server.url = `${protocol}//${url.host}`;
  } else if (url.href.startsWith("//")) {
    server.url = `http:${url.href}`;
  }
  return server;
};
