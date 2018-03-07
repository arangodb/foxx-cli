"use strict";
const { common, serverArgs } = require("../../util/cli");
const { load: loadIni, save: saveIni } = require("../../ini");

const { fatal } = require("../../util/log");
const { omit } = require("lodash");
const resolveServer = require("../../resolveServer");
const { white } = require("chalk");

const command = (exports.command = "set <name> <server>");
exports.description = "Define server";
const aliases = (exports.aliases = ["add"]);

const describe =
  "Defines a server under a given alias including its credentials.";

const args = [
  ["name", "Server name to define"],
  ["server", "URL of the ArangoDB server"]
];

exports.builder = yargs =>
  common(yargs, { command, sub: "server", aliases, describe, args })
    .options({
      ...omit(serverArgs, ["server"])
    })
    .example(
      "$0 server set dev http://localhost:8529",
      'Set the "dev" server to the ArangoDB instance at "http://localhost:8529" with the default username and password'
    )
    .example(
      "$0 server set dev http://localhost:8529 -D mydb",
      'Use the database "mydb" instead of "_system"'
    )
    .example(
      "$0 server set dev http://localhost:8529 -u devel",
      'Authenticate with user "devel" and an empty password'
    )
    .example(
      "$0 server set dev http://localhost:8529 -u devel -P",
      'Authenticate with user "devel" and a password read from stdin'
    )
    .example(
      "$0 server set dev http://localhost:8529 -T",
      "Authenticate with a bearer token read from stdin"
    )
    .example(
      "$0 server set dev http://devel:@mydbserver.example:8529",
      "Username and password can be passed via the URL (in this case the password is empty)"
    )
    .example(
      "$0 server set dev tcp://localhost:8529",
      'The protocol "tcp" can be used as an alias for "http"'
    )
    .example(
      "$0 server set dev ssl://localhost:8529",
      'The protocol "ssl" can be used as an alias for "https"'
    )
    .example(
      "$0 server set dev //localhost:8529",
      'If omitted the protocol defaults to "http"'
    )
    .example(
      "$0 server set dev http://localhost:8529 -V 3.2.0",
      "Explicitly setting the expected ArangoDB version can be useful when using servers running different versions"
    );

exports.handler = async function handler(argv) {
  if (argv.name.startsWith("/")) {
    fatal(
      `The server name must not start with a slash: "${white(argv.name)}".`
    );
  }
  try {
    const server = await resolveServer(argv);
    const ini = await loadIni();
    ini.server[argv.name] = omit(server, ["name"]);
    return await saveIni(ini);
  } catch (e) {
    fatal(e);
  }
};
