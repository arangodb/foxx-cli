"use strict";
const { json, fatal } = require("../util/log");

const { bold } = require("chalk");
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
  ["options", "Arguments that will be passed to the script"]
];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args }).options({
    ...serverArgs,
    raw: {
      describe: "Output raw JSON response",
      type: "boolean",
      default: false
    }
  });

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
    if (argv.raw) {
      json(result);
    } else {
      console.log(result); // TODO pretty-print
    }
  } catch (e) {
    fatal(e);
  }
};
