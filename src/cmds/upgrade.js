"use strict";
const { common, parseServiceOptions, serverArgs } = require("../util/cli");
const { fatal, json } = require("../util/log");

const { bold } = require("chalk");
const { inline: il } = require("../util/text");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const resolveToStream = require("../resolveToStream");

const command = (exports.command = "upgrade <mount> [source]");
exports.description = "Upgrade a mounted service";

const describe = il`Installs the given new service on top of the service currently installed at the given ${bold(
  "mount"
)} path.

This is only recommended for switching between different versions of the same service. Unlike replacing a service, upgrading a service retains the old service's configuration and dependencies (if any) and should therefore only be used to migrate an existing service to a newer or equivalent service.`;

const args = [
  ["mount", "Mount path of the service"],
  [
    "source",
    `URL or file system path of the upgrade service. Use ${bold(
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
        describe: "Run the teardown script before upgrading the service",
        type: "boolean",
        default: false
      },
      setup: {
        describe: `Run the setup script after upgrading the service. Use ${bold(
          "--no-setup"
        )} to disable`,
        type: "boolean",
        default: true
      },
      development: {
        describe:
          "Install the replacement in development mode. You can edit the service's files on the server and changes will be reflected automatically",
        alias: "dev",
        type: "boolean",
        default: false
      },
      legacy: {
        describe:
          "Install the replacement in legacy compatibility mode for legacy services written for ArangoDB 2.8 and earlier",
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
      "$0 upgrade /hello",
      'Upgrade a Foxx service at the URL "/hello" with the current working directory'
    )
    .example(
      "$0 upgrade --dev /hello",
      "Upgrade the service in development mode"
    )
    .example(
      "$0 upgrade --server http://localhost:8530 /hello",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 upgrade --database mydb /hello",
      'Use the database "mydb" instead of the default'
    )
    .example(
      "$0 upgrade --server dev /hello",
      'Use the "dev" server instead of the default. See the "server" command for details'
    )
    .example(
      "$0 upgrade --no-setup /hello",
      "Upgrade the service without running the setup script afterwards"
    )
    .example(
      "$0 upgrade /hello demo.zip",
      'Upgrade the service with the bundle "demo.zip"'
    )
    .example(
      "$0 upgrade /hello /tmp/bundle.zip",
      'Upgrade the service with the bundle located at "/tmp/bundle.zip" (on the local machine)'
    )
    .example(
      "$0 upgrade /hello /tmp/my-service",
      'Bundle the directory "/tmp/my-service" (on the local machine) and upgrade the service with it'
    )
    .example(
      "$0 upgrade /hello -R /tmp/bundle.zip",
      'Upgrade the service with the bundle located at "/tmp/bundle.zip" (on the ArangoDB server)'
    )
    .example(
      "$0 upgrade /hello http://example.com/foxx.zip",
      'Download the bundle from "http://example.com/foxx.zip" locally and upgrade the service with it'
    )
    .example(
      "$0 upgrade /hello -R http://example.com/foxx.zip",
      'Instruct the ArangoDB server to download the bundle from "http://example.com/foxx.zip" and upgrade the service with it'
    )
    .example(
      "$0 upgrade /hello -d mailer=/mymail -d auth=/myauth",
      'Upgrade the service and set its "mailer" and "auth" dependencies'
    )
    .example(
      "cat foxx.zip | $0 upgrade /hello @",
      "Upgrade the service with the bundle read from stdin"
    );

exports.handler = async function handler(argv) {
  const opts = parseServiceOptions(argv);
  try {
    const server = await resolveServer(argv);
    const source = argv.remote
      ? argv.source
      : await resolveToStream(argv.source);
    const db = client(server);
    const result = await db.upgradeService(argv.mount, source, {
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
