"use strict";
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { fatal } = require("../util/log");

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
    return await runScript(db, server.mount, argv);
  } catch (e) {
    fatal(e);
  }
};

async function runScript(db, mount, argv) {
  // TODO
  console.log(command, JSON.stringify(argv, null, 2));
  process.exit(0);
}
