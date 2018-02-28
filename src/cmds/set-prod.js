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
    fatal(e);
  }
};
