"use strict";
const { common } = require("../../util/cli");
const { fatal } = require("../../util/log");
const { load: loadIni, save: saveIni } = require("../../ini");

const command = (exports.command = "remove <name>");
const description = (exports.description = "Remove server");
const aliases = (exports.aliases = ["rm"]);

const describe = description;

const args = [["name", "Server name to forget"]];

exports.builder = yargs =>
  common(yargs, { command, sub: "server", aliases, describe, args }).example(
    "$0 server remove dev",
    'Removes the server named "dev"'
  );

exports.handler = async function handler(argv) {
  try {
    const ini = await loadIni();
    const servers = Object.keys(ini.server);
    if (!servers || !servers.includes(argv.name)) return;
    delete ini.server[argv.name];
    return await saveIni(ini);
  } catch (e) {
    fatal(e);
  }
};
