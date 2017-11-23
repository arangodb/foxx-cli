"use strict";
const { json, fatal } = require("../util/log");

const { bold } = require("chalk");
const client = require("../util/client");
const { common } = require("../util/cli");
const { inline: il } = require("../util/text");
const parseOptions = require("../util/parseOptions");
const resolveServer = require("../resolveServer");

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
      },
      minimal: {
        describe: "Print minimal output",
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
  let options;
  if (argv.options === "-") {
    console.error("TODO", "read from stdin");
    process.exit(1);
  } else {
    options = parseOptions(argv.options);
  }
  try {
    const server = await resolveServer(argv.path);
    const db = client(server);
    let result;
    if (!options) {
      result = await db.getServiceDependencies(server.mount, argv.minimal);
    } else if (argv.force) {
      result = await db.replaceServiceDependencies(
        server.mount,
        options,
        argv.minimal
      );
    } else {
      result = await db.updateServiceDependencies(
        server.mount,
        options,
        argv.minimal
      );
    }
    if (argv.raw) {
      json(result);
    } else if (argv.minimal) {
      if (result.warnings) {
        for (const key of Object.keys(result.warnings)) {
          error(`${key}: ${result.warnings[key]}`);
        }
      }
      console.log("TODO", result.values);
    } else {
      console.log("TODO", result);
    }
  } catch (e) {
    fatal(e);
  }
};
