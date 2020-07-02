"use strict";
const { common } = require("../../util/cli");
const { info, fatal } = require("../../util/log");
const { group } = require("../../util/text");
const { load: loadIni } = require("../../ini");

const command = (exports.command = "list");
exports.description = "List known servers";
const aliases = (exports.aliases = ["ls"]);

const describe = `List all known servers by their aliases.`;

exports.builder = (yargs) =>
  common(yargs, { command, sub: "server", aliases, describe })
    .describe("verbose", "Include URLs")
    .example("$0 server list", "Shows all known servers")
    .example("$0 server list -v", "Shows all known servers and their URLs");

exports.handler = async function handler(argv) {
  try {
    const ini = await loadIni();
    const servers = Object.keys(ini.server);
    if (!servers) return;
    if (argv.verbose) {
      info(group(...servers.map((name) => [name, ini.server[name].url])));
    } else {
      for (const name of servers) {
        info(name);
      }
    }
  } catch (e) {
    fatal(e);
  }
};
