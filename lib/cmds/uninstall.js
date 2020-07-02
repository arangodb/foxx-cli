"use strict";
const { common, serverArgs } = require("../util/cli");
const { detail, fatal } = require("../util/log");

const { bold } = require("chalk");
const client = require("../util/client");
const { ERROR_SERVICE_NOT_FOUND } = require("../errors");
const resolveServer = require("../resolveServer");

const command = (exports.command = "uninstall <mount>");
exports.description = "Uninstall a mounted service";
const aliases = (exports.aliases = ["remove", "purge"]);

const describe = `Removes the service at the given ${bold(
  "mount"
)} path from the database and file system.`;

const args = [["mount", "Mount path of the service"]];

exports.builder = (yargs) =>
  common(yargs, { command, aliases, describe, args })
    .options({
      ...serverArgs,
      teardown: {
        describe: `Run the teardown script before uninstalling the service. Use ${bold(
          "--no-teardown"
        )} to disable`,
        type: "boolean",
        default: true,
      },
    })
    .example(
      "$0 uninstall /hello",
      'Uninstalls a Foxx service at the URL "/hello"'
    )
    .example(
      "$0 uninstall --no-teardown /hello",
      "Does not run the teardown script before uninstalling"
    )
    .example(
      "$0 uninstall --server http://locahost:8530 /hello",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 uninstall --database mydb /hello",
      'Use the database "mydb" instead of the default'
    )
    .example(
      "$0 uninstall --server dev /hello",
      'Use the "dev" server instead of the default. See the "server" command for details'
    );

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    try {
      await db.uninstallService(argv.mount, { teardown: argv.teardown });
    } catch (e) {
      if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
        if (argv.verbose) {
          detail(`Service "${argv.mount}" not found.\nNothing to uninstall.`);
        }
        process.exit(0);
      }
      throw e;
    }
    if (argv.verbose) {
      detail(`Service "${argv.mount}" successfully removed.`);
    }
  } catch (e) {
    fatal(e);
  }
};
