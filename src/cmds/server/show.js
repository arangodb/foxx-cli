"use strict";
const { bold, white, gray } = require("chalk");
const { common } = require("../../util/cli");
const { info, fatal } = require("../../util/log");
const { comma, inline: il } = require("../../util/text");
const { load: loadIni } = require("../../ini");

const command = (exports.command = "show <name>");
exports.description = "Show server information";
const aliases = (exports.aliases = ["info"]);

const describe = `Shows information about a server including its alias and URL.`;

const args = [["name", "Server name to show details of"]];

exports.builder = yargs =>
  common(yargs, { command, sub: "server", aliases, describe, args })
    .describe("verbose", "Include passwords and tokens")
    .example(
      "$0 server show dev",
      'Shows information about the server named "dev" not including password and token'
    )
    .example(
      "$0 server show dev -v",
      'Shows information about the server named "dev" including password and token'
    );

exports.handler = async function handler(argv) {
  try {
    const ini = await loadIni();
    const servers = Object.keys(ini.server);
    if (!servers.length) {
      fatal("No servers defined.");
    }
    if (!servers.includes(argv.name)) {
      fatal(il`
        No such server: "${white(argv.name)}".
        Known servers: ${comma(servers.sort().map(name => bold(name)))}
      `);
    }
    const server = ini.server[argv.name];
    info(`URL: ${server.url}`);
    if (server.database !== undefined) {
      info(`Database: ${server.database}`);
    }
    if (server.version !== undefined) {
      info(`Version: ${server.version}`);
    }
    if (server.username !== undefined) {
      info(`Username: ${server.username}`);
    }
    if (argv.verbose) {
      if (server.password !== undefined) {
        info(
          `Password: ${server.password ? server.password : gray("(empty)")}`
        );
      }
      if (server.token !== undefined) {
        info(`Token: ${server.token}`);
      }
    } else {
      if (server.password !== undefined) {
        info(`Password: ${gray("(hidden)")}`);
      }
      if (server.token !== undefined) {
        info(`Token: ${gray("(hidden)")}`);
      }
    }
  } catch (e) {
    fatal(e);
  }
};
