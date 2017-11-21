"use strict";
const { bold, white } = require("chalk");
const { common } = require("../../util/cli");
const { fatal } = require("../../util/log");
const { comma, inline: il, mask } = require("../../util/text");
const { load: loadIni } = require("../../ini");

const command = (exports.command = "show <name>");
const description = (exports.description = "Show server information");
const aliases = (exports.aliases = ["info"]);

const describe = description;

const args = [["name", "Server name to show details of"]];

exports.builder = yargs =>
  common(yargs, { command, sub: "server", aliases, describe, args }).describe(
    "verbose",
    "Include passwords and tokens"
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
    console.log("URL:", server.url);
    if (server.version !== undefined) {
      console.log("Version:", server.version);
    }
    if (server.username !== undefined) {
      console.log("Username:", server.username);
    }
    if (argv.verbose) {
      if (server.password !== undefined) {
        console.log("Password:", server.password);
      }
      if (server.token !== undefined) {
        console.log("Token:", server.token);
      }
    } else {
      if (server.password !== undefined) {
        console.log("Password:", mask(server.password));
      }
      if (server.token !== undefined) {
        console.log("Token:", mask(server.token));
      }
    }
    process.exit(0);
  } catch (e) {
    fatal(e);
  }
};
