"use strict";
const { white } = require("chalk");
const { common } = require("../util/cli");
const client = require("../util/client");
const resolveMount = require("../resolveMount");
const { fatal } = require("../util/log");
const { inline: il } = require("../util/text");

const command = (exports.command = "set-dev <mount-path>");
const description = (exports.description =
  "Activate development mode for a mounted service");
const aliases = (exports.aliases = ["set-development"]);

const describe = description;

const args = [["mount-path", "Database-relative path of the service"]];

exports.builder = yargs => common(yargs, { command, aliases, describe, args });

exports.handler = async function handler(argv) {
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
    return await db.enableServiceDevelopmentMode(server.mount);
  } catch (e) {
    fatal(e);
  }
};
