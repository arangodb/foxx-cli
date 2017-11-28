"use strict";
const { json, fatal } = require("../util/log");

const client = require("../util/client");
const { common } = require("../util/cli");
const parseOptions = require("../util/parseOptions");
const resolveServer = require("../resolveServer");
const streamToBuffer = require("../util/streamToBuffer");

const command = (exports.command = "run <path> <name> [options..]");
const description = (exports.description =
  "Run a script for a mounted service");
const aliases = (exports.aliases = ["script"]);

const describe = description;

const args = [
  ["path", "Database-relative path of the service"],
  ["name", "Name of the script to execute"],
  ["options", "Arguments that will be passed to the script"]
];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args }).options({
    raw: {
      describe: "Output raw JSON response",
      type: "boolean",
      default: false
    }
  });

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
    const server = await resolveServer(argv.path);
    const db = client(server);
    const result = await db.runServiceScript(server.mount, argv.name, options);
    if (argv.raw) {
      json(result);
    } else {
      console.log("TODO", result);
    }
  } catch (e) {
    fatal(e);
  }
};
