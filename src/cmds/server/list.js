"use strict";
const { common } = require("../../util/cli");
const { fatal } = require("../../util/log");
const { group } = require("../../util/text");
const { load: loadIni } = require("../../ini");

const command = (exports.command = "list");
const description = (exports.description = "List known servers");
const aliases = (exports.aliases = ["ls"]);

const describe = description;

exports.builder = yargs =>
  common(yargs, { command, sub: "server", aliases, describe }).describe(
    "verbose",
    "Include URLs"
  );

exports.handler = async function handler(argv) {
  try {
    const ini = await loadIni();
    const servers = Object.keys(ini.server);
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
