"use strict";
const { common, serverArgs } = require("../util/cli");
const { ERROR_SERVICE_NOT_FOUND } = require("../errors");
const { white } = require("chalk");

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
  common(yargs, { command, aliases, describe, args })
    .options(serverArgs)
    .example(
      "$0 set-prod /hello",
      'Disables the development mode for a Foxx service at the URL "/hello"'
    )
    .example(
      "$0 set-prod --server http://locahost:8530 /hello",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 set-prod --database mydb /hello",
      'Use the database "mydb" instead of the default'
    )
    .example(
      "$0 set-prod --server dev /hello",
      'Use the "dev" server instead of the default. See the "server" command for details'
    );

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    return await db.disableServiceDevelopmentMode(argv.mount);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
      fatal(`No service found at "${white(argv.mount)}".`);
    }
    fatal(e);
  }
};
