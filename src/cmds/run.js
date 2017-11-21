"use strict";
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { json, fatal } = require("../util/log");

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
  // TODO sanity check argv
  try {
    const server = await resolveServer(argv.path);
    const db = client(server);
    const result = await db.runServiceScript(server.mount, argv.options);
    if (argv.raw) {
      json(result);
    } else {
      console.log("TODO", result);
    }
  } catch (e) {
    fatal(e);
  }
};
