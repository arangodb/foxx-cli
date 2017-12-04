"use strict";
const { common, serverArgs } = require("../util/cli");

const client = require("../util/client");
const { fatal } = require("../util/log");
const resolveServer = require("../resolveServer");

const command = (exports.command = "set-prod <mount>");
const description = (exports.description =
  "Disable development for a mounted service");
const aliases = (exports.aliases = ["set-production"]);

const describe = description;

const args = [["mount", "Mount path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args }).options(serverArgs);

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    return await db.disableServiceDevelopmentMode(argv.mount);
  } catch (e) {
    fatal(e);
  }
};
