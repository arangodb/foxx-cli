"use strict";
const { common } = require("../../util/cli");
const { fatal } = require("../../util/log");
const { load: loadIni, save: saveIni } = require("../../ini");

const command = (exports.command = "remove <name>");
exports.description = "Remove server";
const aliases = (exports.aliases = ["rm"]);

const describe = "Removes a server from the list of known servers.";

const args = [["name", "Server name to forget"]];

exports.builder = yargs =>
  common(yargs, { command, sub: "server", aliases, describe, args });

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
