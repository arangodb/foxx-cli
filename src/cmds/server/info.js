"use strict";
const { bold, white } = require("chalk");
const { common } = require("../../util/cli");
const { fatal } = require("../../util/log");
const { comma, group, inline: il, mask } = require("../../util/text");
const { load: loadIni } = require("../../ini");

const command = (exports.command = "info [name]");
const description = (exports.description = "Show server information");
const aliases = (exports.aliases = ["show", "list", "ls"]);

const describe = description;

const args = [["name", "Server name to show details of"]];

exports.builder = yargs =>
  common(yargs, { command, sub: "server", aliases, describe, args }).describe(
    "verbose",
    "Include passwords and tokens in details or URLs in list"
  );

exports.handler = async function handler(argv) {
  try {
    const ini = await loadIni();
    const servers = Object.keys(ini.server);
    if (argv.name) {
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
      console.log(argv.name);
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
    }
    if (!servers) return;
    if (argv.verbose) {
      console.log(group(...servers.map(name => [name, ini.server[name].url])));
    } else {
      for (const name of servers) {
        console.log(name);
      }
    }
  } catch (e) {
    fatal(e);
  }
};
