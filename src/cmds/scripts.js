"use strict";
const { common, serverArgs } = require("../util/cli");
const { detail, fatal, info, json } = require("../util/log");

const client = require("../util/client");
const { group } = require("../util/text");
const resolveServer = require("../resolveServer");

const command = (exports.command = "scripts <mount>");
exports.description = "List available scripts for a mounted service";

const describe =
  "Fetches a list of the scripts defined by the service. Returns an object mapping the raw script names to human-friendly names.";

const args = [["mount", "Mount path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, describe, args }).options({
    ...serverArgs,
    raw: {
      describe: "Output raw JSON response",
      type: "boolean",
      default: false
    }
  });

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    const scripts = await db.listServiceScripts(argv.mount);
    const names = Object.keys(scripts);
    if (argv.raw) {
      json(scripts);
    } else if (names.length) {
      info(group(...names.map(name => [name, scripts[name]])));
    } else if (argv.verbose) {
      detail("No scripts available.");
    }
  } catch (e) {
    fatal(e);
  }
};
