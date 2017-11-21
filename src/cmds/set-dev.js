"use strict";
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { fatal } = require("../util/log");

const command = (exports.command = "set-dev <path>");
const description = (exports.description =
  "Activate development mode for a mounted service");
const aliases = (exports.aliases = ["set-development"]);

const describe = description;

const args = [["path", "Database-relative path of the service"]];

exports.builder = yargs => common(yargs, { command, aliases, describe, args });

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv.path);
    const db = client(server);
    return await db.enableServiceDevelopmentMode(server.mount);
  } catch (e) {
    fatal(e);
  }
};
