"use strict";
const { common } = require("../util/cli");

const command = (exports.command = "server <command>");
exports.description = "Manage ArangoDB server credentials";
const aliases = (exports.aliases = ["remote"]);

const describe = `The server commands allow defining server aliases that can be used instead of URLs to avoid passing the same credentials to every command.`;

exports.builder = yargs =>
  common(yargs, { command, aliases, describe })
    .command(require("./server/list"))
    .command(require("./server/remove"))
    .command(require("./server/set"))
    .command(require("./server/show"));
