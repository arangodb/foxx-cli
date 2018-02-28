"use strict";
const { common, serverArgs } = require("../util/cli");

const client = require("../util/client");
const { fatal } = require("../util/log");
const resolveServer = require("../resolveServer");

const command = (exports.command = "set-dev <mount>");
const description = (exports.description =
  "Activate development mode for a mounted service");
const aliases = (exports.aliases = ["set-development"]);

const describe = description;

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
    fatal(e);
  }
};
