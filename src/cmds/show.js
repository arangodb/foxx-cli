"use strict";
const { bold, white } = require("chalk");
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { error, fatal } = require("../util/log");
const { inline: il } = require("../util/text");
const { ERROR_SERVICE_NOT_FOUND } = require("../errors");

const command = (exports.command = "show <path>");
exports.description = "Show mounted service information";
const aliases = (exports.aliases = ["info"]);

const describe = il`
  Shows detailed information about the service installed at the
  given ${bold("path")}.
`;

const args = [["path", "Database-relative path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args }).options({
    raw: {
      describe: "Output raw JSON response",
      type: "boolean",
      default: false
    }
  });

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv.path);
    const db = client(server);
    try {
      const services = await db.getService(server.mount);
      console.log(JSON.stringify(services, null, 2));
      // TODO formatted output when raw != true
    } catch (e) {
      if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
        error(`No service found at "${white(server.mount)}".`);
        process.exit(1);
      }
      throw e;
    }
  } catch (e) {
    fatal(e);
  }
};
