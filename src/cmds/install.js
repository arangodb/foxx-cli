"use strict";
const errors = require("../errors");
const { common, parseServiceOptions, serverArgs } = require("../util/cli");
const { fatal, info, json } = require("../util/log");

const { bold, white } = require("chalk");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const resolveToStream = require("../resolveToStream");

const command = (exports.command = "install <mount> [source]");
exports.description = "Install a service at a given mount path";
const aliases = (exports.aliases = ["i"]);

const describe = `Installs the given new service at the given ${bold(
  "mount"
)} path.`;

const args = [
  ["mount", "Mount path of the service"],
  [
    "source",
    `URL or file system path of the service to install. Use ${bold(
      "@"
    )} to pass a zip file from stdin`,
    '[default: "."]'
  ]
];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args })
    .options({
      ...serverArgs,
      setup: {
        describe: `Run the setup script after installing the service. Use ${bold(
          "--no-setup"
        )} to disable`,
        type: "boolean",
        default: true
      },
      development: {
        describe:
          "Install the service in development mode. You can edit the service's files on the server and changes will be reflected automatically",
        alias: "dev",
        type: "boolean",
        default: false
      },
      legacy: {
        describe:
          "Install the service in legacy compatibility mode for legacy services written for ArangoDB 2.8 and earlier",
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
      "$0 install /hello",
      'Install the current working directory as a Foxx service at the URL "/hello"'
    )
    .example(
      "$0 install --dev /hello",
      "Install the service in development mode"
    )
    .example(
      "$0 install --server http://localhost:8530 /hello",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 install --database mydb /hello",
      'Use the database "mydb" instead of the default'
    )
    .example(
      "$0 install --server dev /hello",
      'Use the "dev" server instead of the default. See the "server" command for details'
    )
    .example(
      "$0 install --no-setup /hello",
      "Install the service without running the setup script afterwards"
    )
    .example("$0 install /hello demo.zip", 'Install the bundle "demo.zip"')
    .example(
      "$0 install /hello /tmp/bundle.zip",
      'Install the bundle located at "/tmp/bundle.zip" (on the local machine)'
    )
    .example(
      "$0 install /hello /tmp/my-service",
      'Bundle and install the directory "/tmp/my-service" (on the local machine)'
    )
    .example(
      "$0 install /hello -R /tmp/bundle.zip",
      'Install the bundle located at "/tmp/bundle.zip" (on the ArangoDB server)'
    )
    .example(
      "$0 install /hello http://example.com/foxx.zip",
      'Download the bundle from "http://example.com/foxx.zip" locally and install it'
    )
    .example(
      "$0 install /hello -R http://example.com/foxx.zip",
      'Instruct the ArangoDB server to download the bundle from "http://example.com/foxx.zip" and install it'
    )
    .example(
      "$0 install /hello -d mailer=/mymail -d auth=/myauth",
      'Install the service and set its "mailer" and "auth" dependencies'
    )
    .example(
      "cat foxx.zip | $0 install /hello @",
      "Install the bundle read from stdin"
    );

exports.handler = async function handler(argv) {
  const opts = parseServiceOptions(argv);
  try {
    const server = await resolveServer(argv);
    const source = argv.remote
      ? argv.source
      : await resolveToStream(argv.source);
    const db = client(server);
    const result = await db.installService(argv.mount, source, {
      ...opts,
      setup: argv.setup
    });
    if (argv.raw) {
      json(result);
    } else {
      info(`Installed service at "${white(argv.mount)}".`);
    }
  } catch (e) {
    if (e.isArangoError) {
      switch (e.errorNum) {
        case errors.ERROR_INVALID_MOUNTPOINT:
          fatal(`Not a valid mount path: "${white(argv.mount)}".`);
          break;
        case errors.ERROR_SERVICE_MOUNTPOINT_CONFLICT:
          fatal(`Mount path already in use: "${white(argv.mount)}".`);
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
          fatal(`Service manifest rejected due to errors:\n\n${e.message}`);
          break;
        case errors.ERROR_MODULE_NOT_FOUND:
          fatal(
            `Server encountered errors trying to locate a JavaScript file:\n\n${
              e.message
            }\n\nMake sure the service bundle includes all files referenced in the manifest.`
          );
          break;
        case errors.ERROR_MODULE_FAILURE:
          fatal(
            `Server encountered errors executing a JavaScript file:\n\n${
              e.message
            }\n\nFor details check the arangod server logs.`
          );
          break;
        case errors.ERROR_MODULE_SYNTAX_ERROR:
          fatal(
            `Server encountered errors trying to parse a JavaScript file:\n\n${
              e.message
            }`
          );
          break;
      }
    }
    fatal(e);
  }
};
