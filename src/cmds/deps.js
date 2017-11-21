"use strict";
const { bold } = require("chalk");
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { fatal } = require("../util/log");
const { inline: il } = require("../util/text");

const command = (exports.command = "deps <path> [options..]");
const description = (exports.description =
  "Manage the dependencies of a mounted service");
const aliases = (exports.aliases = ["dependencies", "dep"]);

const describe = description;

const args = [
  ["path", "Database-relative path of the service"],
  [
    "options",
    `Key-value pairs to apply to the dependencies. Use ${bold(
      "-"
    )} to pass a JSON file from stdin`
  ]
];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args })
    .options({
      force: {
        describe: il`
          Clear existing values for any omitted dependencies.
          Note that clearing required dependencies will result in
          the service being disabled until new values are provided.
        `,
        alias: "f",
        type: "boolean",
        default: false
      },
      raw: {
        describe: "Output service dependencies as raw JSON",
        type: "boolean",
        default: false
      }
    })
    .example(
      "$0 deps /myfoxx",
      'Show the dependencies for the service mounted at "/foxxmail"'
    )
    .example(
      "$0 deps /myfoxx mailer=/foxxmail",
      'Sets the "mailer" dependency to the service mounted at "/foxxmail"'
    )
    .example(
      "$0 deps /myfoxx -f mailer=/foxxmail",
      'Sets the "mailer" dependency and clears any other dependencies'
    )
    .example(
      'echo \'{"mailer": "/foxxmail"}\' | $0 deps /myfoxx -',
      "Sets the dependency using JSON data from stdin"
    )
    .example("$0 deps /myfoxx -f", "Clears all configured dependencies");

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv.path);
    const db = client(server);
    // TODO handle write
    return await showDeps(db, server.mount, argv);
  } catch (e) {
    fatal(e);
  }
};

async function showDeps(db, mount, argv) {
  const config = await db.getServiceDependencies(mount);
  // TODO prettyprint if !argv.raw
  console.log(JSON.stringify(config, null, 2));
}
