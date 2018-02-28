"use strict";
const { common, serverArgs } = require("../util/cli");
const { detail, fatal, info, json } = require("../util/log");

const client = require("../util/client");
const { group } = require("../util/text");
const resolveServer = require("../resolveServer");

const command = (exports.command = "scripts <mount>");
const description = (exports.description =
  "List available scripts for a mounted service");

const describe = description;

const args = [["mount", "Mount path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, describe, args })
    .options({
      ...serverArgs,
      raw: {
        describe: "Output raw JSON response",
        type: "boolean",
        default: false
      }
    })
    .example(
      "$0 scripts /hello",
      'Shows all scripts of the service at the URL "/hello"'
    )
    .example(
      "$0 scripts /hello --server http://localhost:8530",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 scripts /hello --database mydb",
      'Use the database "mydb" instead of the default'
    );

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
