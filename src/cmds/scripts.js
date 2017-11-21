"use strict";
const { gray } = require("chalk");
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { fatal } = require("../util/log");
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
  // TODO sanity check argv
  try {
    const server = await resolveServer(argv.path);
    const db = client(server);
    return await listScripts(db, server.mount, argv.raw);
  } catch (e) {
    fatal(e);
  }
};

async function listScripts(db, mount, raw) {
  const scripts = await db.listServiceScripts(mount);
  const names = Object.keys(scripts);
  if (raw) {
    for (const name of names) {
      console.log(name);
    }
  } else if (!names.length) {
    console.log(gray("No scripts available."));
  } else {
    console.log(group(...names.map(name => [name, scripts[name]])));
  }
  process.exit(0);
}
