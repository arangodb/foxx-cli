"use strict";
const { bold } = require("chalk");
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { fatal } = require("../util/log");
const { inline: il } = require("../util/text");

const command = (exports.command = "config <path> [options..]");
const description = (exports.description =
  "Manage the configuration of a mounted service");
const aliases = (exports.aliases = ["configuration", "cfg"]);

const describe = description;

const args = [
  ["path", "Database-relative path of the service"],
  [
    "options",
    `Key-value pairs to apply to the configuration. Use ${bold(
      "-"
    )} to pass a JSON file from stdin`
  ]
];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args })
    .options({
      force: {
        describe: il`
          Clear existing values for any omitted configuration options.
          Note that clearing required options with no default value will
          result in the service being disabled until new values are provided.
        `,
        alias: "f",
        type: "boolean",
        default: false
      },
      raw: {
        describe: "Output service configuration as raw JSON",
        type: "boolean",
        default: false
      }
    })
    .example(
      "$0 config /myfoxx",
      'Shows the configuration for the mounted service at the URL "/myfoxx"'
    )
    .example(
      "$0 config /myfoxx someNumber=23",
      'Sets the "someNumber" configuration option to the number 23'
    )
    .example(
      "$0 config /myfoxx -f someNumber=23",
      'Sets the "someNumber" configuration option and clears all other options'
    )
    .example(
      "echo '{\"someNumber\": 23}' | $0 config /myfoxx -",
      "Sets the configuration using JSON data from stdin"
    )
    .example("$0 config /myfoxx -f", "Clears the service configuration");

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv.path);
    const db = client(server);
    // TODO handle write
    return await showConfig(db, server.mount, argv);
  } catch (e) {
    fatal(e);
  }
};

async function showConfig(db, mount, argv) {
  const config = await db.getServiceConfiguration(mount);
  // TODO prettyprint if !argv.raw
  console.log(JSON.stringify(config, null, 2));
}
