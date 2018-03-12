"use strict";
const { bold, gray, white } = require("chalk");
const { common, serverArgs } = require("../util/cli");
const { fatal, info, json } = require("../util/log");

const client = require("../util/client");
const { ERROR_SERVICE_NOT_FOUND } = require("../errors");
const resolveServer = require("../resolveServer");

const command = (exports.command = "show <mount>");
exports.description = "Show mounted service information";
const aliases = (exports.aliases = ["info"]);

const describe = `Shows detailed information about the service installed at the given ${bold(
  "mount"
)}.`;

const args = [["mount", "Mount path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args })
    .options({
      ...serverArgs,
      raw: {
        describe: "Output raw JSON response",
        type: "boolean",
        default: false
      }
    })
    .example(
      "$0 show /hello",
      'Shows information about a Foxx service at the URL "/hello"'
    )
    .example(
      "$0 show --server http://locahost:8530 /hello",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 show --database mydb /hello",
      'Use the database "mydb" instead of the default'
    )
    .example(
      "$0 show --server dev /hello",
      'Use the "dev" server instead of the default. See the "server" command for details'
    );

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    const result = await db.getService(argv.mount);
    if (argv.raw) {
      json(result);
    } else {
      const parts = ["Mount:", result.mount];
      if (result.legacy) parts.push(gray("(legacy)"));
      if (result.development) parts.push(bold("[DEV]"));
      info(parts.join(" "));
      if (result.name) info(`Name: ${result.name}`);
      if (result.version) info(`Version: ${result.version}`);
      info(`Path: ${result.path}`);
      info(`Checksum: ${result.checksum}`);
    }
  } catch (e) {
    if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
      fatal(`No service found at "${white(argv.mount)}".`);
    }
    fatal(e);
  }
};
