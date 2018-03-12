"use strict";
const { common, serverArgs } = require("../util/cli");
const { ERROR_SERVICE_NOT_FOUND } = require("../errors");
const { white } = require("chalk");

const client = require("../util/client");
const { fatal } = require("../util/log");
const { inline: il } = require("../util/text");
const resolveServer = require("../resolveServer");

const command = (exports.command = "set-dev <mount>");
exports.description = "Activate development mode for a mounted service";
const aliases = (exports.aliases = ["set-development"]);

const describe = il`Puts the service into development mode.

While the service is running in development mode the service will be reloaded from the filesystem and its setup script (if any) will be re-executed every time the service handles a request.

When running ArangoDB in a cluster with multiple coordinators note that changes to the filesystem on one coordinator will not be reflected across the other coordinators. This means you should treat your coordinators as inconsistent as long as any service is running in development mode.`;

const args = [["mount", "Mount path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args })
    .options(serverArgs)
    .example(
      "$0 set-dev /hello",
      'Activates the development mode for a Foxx service at the URL "/hello"'
    )
    .example(
      "$0 set-dev --server http://locahost:8530 /hello",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 set-dev --database mydb /hello",
      'Use the database "mydb" instead of the default'
    )
    .example(
      "$0 set-dev --server dev /hello",
      'Use the "dev" server instead of the default. See the "server" command for details'
    );

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    return await db.enableServiceDevelopmentMode(argv.mount);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
      fatal(`No service found at "${white(argv.mount)}".`);
    }
    fatal(e);
  }
};
