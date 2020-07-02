"use strict";
const errors = require("../errors");
const { json, fatal } = require("../util/log");

const { bold, white } = require("chalk");
const client = require("../util/client");
const { common, serverArgs } = require("../util/cli");
const resolveServer = require("../resolveServer");
const streamToBuffer = require("../util/streamToBuffer");

const command = (exports.command = "run <mount> <name> [options]");
exports.description = "Run a script for a mounted service";
const aliases = (exports.aliases = ["script"]);

const describe = `Runs the given script for the service at the given ${bold(
  "mount"
)} path. Returns the exports of the script, if any.`;

const args = [
  ["mount", "Mount path of the service"],
  ["name", "Name of the script to execute"],
  ["options", "Arguments that will be passed to the script"],
];

exports.builder = (yargs) =>
  common(yargs, { command, aliases, describe, args })
    .options({ ...serverArgs })
    .example(
      "$0 run /hello send-email",
      'Runs a script "send-email" of the service at the URL "/hello"'
    )
    .example(
      `$0 run /hello send-email '{"hello": "world"}'`,
      "Pass an argument to the script"
    )
    .example(
      "$0 run /hello send-email --server http://localhost:8530",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 run /hello send-email --database mydb",
      'Use the database "mydb" instead of the default'
    );

exports.handler = async function handler(argv) {
  let options = argv.options;
  if (!options) {
    options = undefined;
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
  } else {
    try {
      options = JSON.parse(options);
    } catch (e) {
      fatal(e.message);
    }
  }
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    const result = await db.runServiceScript(argv.mount, argv.name, options);
    json(result);
  } catch (e) {
    if (e.isArangoError) {
      switch (e.errorNum) {
        case errors.ERROR_SERVICE_NOT_FOUND:
          fatal(`No service found at "${white(argv.mount)}".`);
          break;
        case errors.ERROR_SERVICE_NEEDS_CONFIGURATION:
          fatal(
            `Service at "${white(
              argv.mount
            )}" is missing configuration or dependencies.`
          );
          break;
        case errors.ERROR_SERVICE_UNKNOWN_SCRIPT:
          fatal(`Service does not have a script called "${white(argv.name)}".`);
          break;
        case errors.ERROR_MODULE_NOT_FOUND:
          fatal(
            `Server encountered errors trying to locate a JavaScript file:\n\n${e.message}\n\nMake sure the service bundle includes all files referenced in the manifest.`
          );
          break;
        case errors.ERROR_MODULE_FAILURE:
          fatal(
            `Server encountered errors executing a JavaScript file:\n\n${e.message}\n\nFor details check the arangod server logs.`
          );
          break;
        case errors.ERROR_MODULE_SYNTAX_ERROR:
          fatal(
            `Server encountered errors trying to parse a JavaScript file:\n\n${e.message}`
          );
          break;
      }
    }
    fatal(e);
  }
};
