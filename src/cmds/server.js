"use strict";
const { common } = require("../util/cli");
const { group, inline: il } = require("../util/text");

const command = (exports.command = "server <command>");
exports.description = "Manage ArangoDB server credentials";
const aliases = (exports.aliases = ["remote"]);

const describe =
  il`
    The server commands allow defining server names that can be used with
    other commands or as part of service mount paths to avoid passing the
    same credentials to every command.

    It is also possible to invoke commands with the following environment
    variables to override the default server without explicitly defining
    credentials:
  ` +
  "\n\n" +
  group(
    [
      "FOXX_ARANGODB_SERVER_URL",
      "Fully qualified URL of the ArangoDB database"
    ],
    ["FOXX_ARANGODB_SERVER_USERNAME", "Username to authenticate with"],
    ["FOXX_ARANGODB_SERVER_PASSWORD", "Password to authenticate with"],
    [
      "FOXX_ARANGODB_SERVER_TOKEN",
      "Bearer token to authenticate with (overrides username/password)"
    ]
  );

exports.builder = yargs =>
  common(yargs, { command, aliases, describe })
    .command(require("./server/list"))
    .command(require("./server/remove"))
    .command(require("./server/set"))
    .command(require("./server/show"));
