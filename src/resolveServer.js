"use strict";
const { bold, white } = require("chalk");
const { fatal } = require("./util/log");
const { load: loadIni } = require("./ini");
const parseServerUrl = require("./util/parseServerUrl");
const { prompt } = require("inquirer");
const { unsplat } = require("./util/array");
const { readFile } = require("./util/fs");

async function resolve(endpointOrName = "default") {
  if (endpointOrName.match(/^((https?|tcp|ssl):)?\/\//)) {
    return parseServerUrl(endpointOrName);
  }
  const ini = await loadIni();
  if (ini.server[endpointOrName]) {
    return {
      ...ini.server[endpointOrName],
      name: endpointOrName
    };
  }
  if (endpointOrName === "default") {
    return { name: endpointOrName };
  }
  return null;
}

module.exports = async function resolveServer(argv) {
  if (argv.password && argv.token) {
    fatal(
      `Can not use both ${bold("password")} and ${bold(
        "token"
      )} as authentication for the same server.`
    );
  }
  if (argv.passwordFile && argv.token) {
    fatal(
      `Can not use both ${bold("passwordFile")} and ${bold(
        "token"
      )} as authentication for the same server.`
    );
  }
  if (argv.passwordFile && argv.password) {
    fatal(
      `Can not use both ${bold("passwordFile")} and ${bold(
        "password"
      )} as authentication for the same server.`
    );
  }
  if (argv.username && argv.token) {
    fatal(
      `Can not use both ${bold("username")} and ${bold(
        "token"
      )} as authentication for the same server.`
    );
  }
  const server = await resolve(unsplat(argv.server));
  if (!server) {
    fatal(`Not a valid server: "${white(argv.server)}".`);
  }
  if (server.url === undefined) {
    server.url = "http://localhost:8529";
  }
  if (argv.database) {
    server.database = unsplat(argv.database);
  } else if (server.database === undefined) {
    server.database = "_system";
  }
  if (argv.username) {
    delete server.token;
    server.username = unsplat(argv.username);
    server.password = "";
  }
  if (argv.passwordFile) {
    delete server.token;
    server.password = await readFile(argv.passwordFile, "utf-8");
  }
  if (argv.password) {
    delete server.token;
    const { password } = await prompt([
      {
        message: "Password",
        name: "password",
        type: "password"
      }
    ]);
    server.password = password;
  }
  if (argv.token) {
    delete server.username;
    delete server.password;
    const { token } = await prompt([
      {
        message: "Token",
        name: "token",
        type: "password",
        validate: Boolean
      }
    ]);
    server.token = token;
  }
  if (server.token === undefined) {
    if (server.username === undefined) {
      server.username = "root";
    }
    if (server.password === undefined) {
      server.password = "";
    }
  }
  return server;
};
