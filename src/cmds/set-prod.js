"use strict";
const { common, serverArgs } = require("../util/cli");

const client = require("../util/client");
const { fatal } = require("../util/log");
const { inline: il } = require("../util/text");
const resolveServer = require("../resolveServer");

const command = (exports.command = "set-prod <mount>");
exports.description = "Disable development for a mounted service";
const aliases = (exports.aliases = ["set-production"]);

const describe = il`Puts the service at the given mount path into production mode.

When running ArangoDB in a cluster with multiple coordinators this will replace the service on all other coordinators with the version on this coordinator.`;

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
