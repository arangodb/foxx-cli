"use strict";
const errors = require("../errors");
const { bold, white } = require("chalk");
const { common, serverArgs, parseServiceOptions } = require("../util/cli");
const { inline: il } = require("../util/text");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const resolveToStream = require("../resolveToStream");
const { json, error, fatal } = require("../util/log");

const command = (exports.command = "replace <mount> [source]");
exports.description = "Replace a mounted service";

const describe = il`Removes the service at the given ${bold(
  "mount"
)} path from the database and file system. Then installs the given new service at the same ${bold(
  "mount"
)} path.

This is a slightly safer equivalent to performing an uninstall of the old service followed by installing the new service. The new service's main and script files (if any) will be checked for basic syntax errors before the old service is removed.`;

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
  common(yargs, { command, describe, args })
    .options({
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
    })
    .example(
      "$0 replace /hello",
      'Replace a Foxx service at the URL "/hello" with the current working directory'
    )
    .example(
      "$0 replace --dev /hello",
      "Replace the service in development mode"
    )
    .example(
      "$0 replace --server http://localhost:8530 /hello",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 replace --database mydb /hello",
      'Use the database "mydb" instead of the default'
    )
    .example(
      "$0 replace --server dev /hello",
      'Use the "dev" server instead of the default. See the "server" command for details'
    )
    .example(
      "$0 replace --no-setup /hello",
      "Replace the service without running the setup script afterwards"
    )
    .example(
      "$0 replace /hello demo.zip",
      'Replace the service with the bundle "demo.zip"'
    )
    .example(
      "$0 replace /hello /tmp/bundle.zip",
      'Replace the service with the bundle located at "/tmp/bundle.zip" (on the local machine)'
    )
    .example(
      "$0 replace /hello /tmp/my-service",
      'Bundle the directory "/tmp/my-service" (on the local machine) and replace the service with it'
    )
    .example(
      "$0 replace /hello -R /tmp/bundle.zip",
      'Replace the service with the bundle located at "/tmp/bundle.zip" (on the ArangoDB server)'
    )
    .example(
      "$0 replace /hello http://example.com/foxx.zip",
      'Download the bundle from "http://example.com/foxx.zip" locally and replace the service with it'
    )
    .example(
      "$0 replace /hello -R http://example.com/foxx.zip",
      'Instruct the ArangoDB server to download the bundle from "http://example.com/foxx.zip" and replace the service with it'
    )
    .example(
      "$0 replace /hello -d mailer=/mymail -d auth=/myauth",
      'Replace the service and set its "mailer" and "auth" dependencies'
    )
    .example(
      "cat foxx.zip | $0 replace /hello @",
      "Replace the service with the bundle read from stdin"
    );

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
    if (e.isArangoError) {
      switch (e.errorNum) {
        case errors.ERROR_SERVICE_NOT_FOUND:
          fatal(`No service found at "${white(argv.mount)}".`);
          break;
        case errors.ERROR_SERVICE_SOURCE_NOT_FOUND:
          fatal(`Server failed to resolve source "${white(argv.source)}".`);
          break;
        case errors.ERROR_SERVICE_SOURCE_ERROR:
          fatal(`Server failed to download source "${white(argv.source)}".`);
          break;
        case errors.ERROR_SERVICE_MANIFEST_NOT_FOUND:
          fatal("Service bundle does not contain a manifest.");
          break;
        case errors.ERROR_MALFORMED_MANIFEST_FILE:
          fatal("Service manifest is not a well-formed JSON file.");
          break;
        case errors.ERROR_INVALID_SERVICE_MANIFEST:
          error("Service manifest rejected due to errors:");
          error(e);
          process.exit(1);
          break;
      }
    }
    fatal(e);
  }
};
