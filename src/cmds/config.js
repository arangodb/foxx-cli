"use strict";
const { ERROR_SERVICE_NOT_FOUND } = require("../errors");
const { common, serverArgs } = require("../util/cli");
const { error, fatal, json } = require("../util/log");

const { bold, white } = require("chalk");
const client = require("../util/client");
const { inline: il } = require("../util/text");
const parseOptions = require("../util/parseOptions");
const resolveServer = require("../resolveServer");
const streamToBuffer = require("../util/streamToBuffer");

const command = (exports.command = "config <mount> [options..]");
exports.description = "Manage the configuration of a mounted service";
const aliases = (exports.aliases = ["configuration", "cfg"]);

const describe = il`Updates or fetches the current configuration for the service at the given ${bold(
  "mount"
)} path.

Returns an object mapping the configuration option names to their definitions including a human-friendly title and the current value (if any).`;

const args = [
  ["mount", "Mount path of the service"],
  [
    "options",
    `Key-value pairs to apply to the configuration. Use ${bold(
      "@"
    )} to pass a JSON file from stdin`
  ]
];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args })
    .options({
      ...serverArgs,
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
      },
      minimal: {
        describe: "Print minimal output",
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
      "echo '{\"someNumber\": 23}' | $0 config /myfoxx @",
      "Sets the configuration using JSON data from stdin"
    )
    .example("$0 config /myfoxx -f", "Clears the service configuration");

exports.handler = async function handler(argv) {
  let options = parseOptions(argv.options);
  if (!options && argv.force) {
    options = {};
  } else if (options === "@") {
    const output = await streamToBuffer(process.stdin);
    let json;
    try {
      json = output.toString("utf-8");
    } catch (e) {
      fatal("Not a valid JSON string");
    }
    try {
      options = JSON.parse(json);
    } catch (e) {
      fatal(e.message);
    }
  }
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    let result;
    if (!options) {
      result = await db.getServiceConfiguration(argv.mount, argv.minimal);
    } else if (argv.force) {
      result = await db.replaceServiceConfiguration(
        argv.mount,
        options,
        argv.minimal
      );
    } else {
      result = await db.updateServiceConfiguration(
        argv.mount,
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
      console.log(result.values); // TODO pretty-print
    } else {
      console.log(result); // TODO pretty-print
    }
  } catch (e) {
    if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
      fatal(`No service found at "${white(argv.mount)}"`);
    }
    fatal(e);
  }
};
