"use strict";
const { bold } = require("chalk");
const { common, serverArgs, parseServiceOptions } = require("../util/cli");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const resolveToStream = require("../resolveToStream");
const { json, fatal } = require("../util/log");

const command = (exports.command = "replace <mount> [source]");
const description = (exports.description = "Replace a mounted service");

const describe = description;

const args = [
  ["mount", "Mount path of the service"],
  [
    "source",
    `URL or file system path of the replacement service. Use ${bold(
      "@"
    )} to pass a zip file from stdin`,
    '[default: "."]'
  ]
];

exports.builder = yargs =>
  common(yargs, { command, describe, args }).options({
    ...serverArgs,
    teardown: {
      describe: `Run the teardown script before replacing the service. Use ${bold(
        "--no-teardown"
      )} to disable`,
      type: "boolean",
      default: true
    },
    setup: {
      describe: `Run the setup script after replacing the service. Use ${bold(
        "--no-setup"
      )} to disable`,
      type: "boolean",
      default: true
    },
    development: {
      describe:
        "Install the update in development mode. You can edit the service's files on the server and changes will be reflected automatically",
      alias: "dev",
      type: "boolean",
      default: false
    },
    legacy: {
      describe:
        "Install the update in legacy compatibility mode for legacy services written for ArangoDB 2.8 and earlier",
      type: "boolean",
      default: false
    },
    remote: {
      describe: `Let the ArangoDB server resolve ${bold(
        "source"
      )} instead of resolving it locally`,
      alias: "R",
      type: "boolean",
      default: false
    },
    cfg: {
      describe:
        "Pass a configuration option as a name=value pair. This option can be specified multiple times",
      alias: "c",
      type: "string"
    },
    dep: {
      describe:
        "Pass a dependency option as a name=/path pair. This option can be specified multiple times",
      alias: "d",
      type: "string"
    }
  });

exports.handler = async function handler(argv) {
  const opts = parseServiceOptions(argv);
  try {
    const server = await resolveServer(argv);
    const source = argv.remote
      ? argv.source
      : await resolveToStream(argv.source);
    const db = client(server);
    const result = await db.replaceService(argv.mount, source, {
      ...opts,
      setup: argv.setup,
      teardown: argv.teardown
    });
    if (argv.raw) {
      json(result);
    } else {
      console.log(result); // TODO pretty-print
    }
  } catch (e) {
    fatal(e);
  }
};
