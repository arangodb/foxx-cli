"use strict";
const { bold } = require("chalk");
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { fatal } = require("../util/log");
const { ERROR_SERVICE_NOT_FOUND } = require("../errors");

const command = (exports.command = "uninstall <path>");
const description = (exports.description = "Uninstall a mounted service");
const aliases = (exports.aliases = ["remove", "purge"]);

const describe = description;

const args = [["path", "Database-relative path the service is mounted on"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args }).options({
    teardown: {
      describe: `Run the teardown script before uninstalling the service. Use ${bold(
        "--no-teardown"
      )} to disable`,
      type: "boolean",
      default: true
    }
  });

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv.path);
    return await uninstall(argv, server);
  } catch (e) {
    fatal(e);
  }
};

async function uninstall(argv, server) {
  const db = client(server);
  try {
    await db.uninstallService(server.mount, { teardown: argv.teardown });
  } catch (e) {
    if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
      console.log(
        `No service found at "${server.mount}".\nNothing to uninstall.`
      );
      process.exit(0);
    }
    throw e;
  }
}
