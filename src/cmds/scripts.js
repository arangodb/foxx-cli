"use strict";
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { info, detail, json, fatal } = require("../util/log");
const { group } = require("../util/text");

const command = (exports.command = "scripts <path>");
const description = (exports.description =
  "List available scripts for a mounted service");

const describe = description;

const args = [["path", "Database-relative path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, describe, args }).options({
    raw: {
      describe: "Output raw JSON response",
      type: "boolean",
      default: false
    }
  });

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv.path);
    const db = client(server);
    const scripts = await db.listServiceScripts(server.mount);
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
