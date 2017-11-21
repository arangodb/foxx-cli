"use strict";
const { gray, white } = require("chalk");
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveMount = require("../resolveMount");
const { fatal } = require("../util/log");
const { group, inline: il } = require("../util/text");

const command = (exports.command =
  "run <mount-path> [script-name] [options..]");
const description = (exports.description =
  "Run a script for a mounted service");
const aliases = (exports.aliases = ["run-script", "script", "scripts"]);

const describe = description;

const args = [
  ["mount-path", "Database-relative path of the service"],
  ["script-name", "Name of the script to execute"],
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
    const server = await resolveMount(argv.mountPath);
    if (!server.mount) {
      fatal(il`
        Not a valid mount path: "${white(argv.mountPath)}".
        Make sure the mount path always starts with a leading slash.
      `);
    }

    if (!server.url) {
      fatal(il`
        Not a valid server: "${white(server.name)}".
        Make sure the mount path always starts with a leading slash.
      `);
    }

    const db = client(server);
    if (!argv.scriptName) {
      return await listScripts(db, server.mount, argv.raw);
    }
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
