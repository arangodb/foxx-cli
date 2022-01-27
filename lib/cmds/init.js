"use strict";
const { white } = require("chalk");
const { common } = require("../util/cli");
const { fatal } = require("../util/log");
const { generateFiles } = require("../generator");
const wizard = require("../generator/wizard");
const fs = require("../util/fs");
const path = require("path");

const command = (exports.command = "init [dest]");
exports.description = "Create a new Foxx service";

const describe = "Creates a new Foxx service in the given file system path.";

const args = [
  ["dest", "File system path of the service to create.", '[default: "."]'],
];

exports.builder = (yargs) =>
  common(yargs, { command, describe, args })
    .options({
      example: {
        describe: "Generate example code",
        alias: "e",
        type: "boolean",
        default: false,
      },
      interactive: {
        describe: "Prompt for input instead of using default values",
        alias: "i",
        type: "boolean",
        default: false,
      },
    })
    .example(
      "$0 init",
      "Create a new Foxx service in the current directory using default values"
    )
    .example(
      "$0 init /tmp/my-service",
      'Create a new Foxx service in directory "/tmp/my-service" using default values'
    )
    .example(
      "$0 init --interactive",
      "Create a new Foxx service prompting for input"
    )
    .example("$0 init --example", "Create a new example Foxx service");

exports.handler = async function handler(argv) {
  const dest = argv.dest ? argv.dest : process.cwd();
  const stats = await fs.safeStat(dest);
  if (!stats) {
    await fs.mkdir(path.resolve(dest));
  } else if (!stats.isDirectory()) {
    fatal(`Destination "${white(dest)}" is not a directory.`);
  }
  if ((await fs.readdir(dest)).length > 0) {
    fatal(`Refusing to write to non-empty directory "${white(dest)}".`);
  }
  let options = {
    cwd: dest,
    example: argv.example && !argv.interactive,
    name: path.basename(dest),
    version: "0.0.0",
    mainFile: "index.js",
    engineVersion: "^3.0.0",
    tests: "test/**/*.js",
  };
  if (options.example) {
    options.name = "hello-world";
    options.authorName = "ArangoDB GmbH";
    options.license = "Apache-2.0";
    options.description = "A simple Hello World Foxx service";
  }
  if (argv.interactive) {
    options = Object.assign(options, await wizard(options));
  }
  try {
    const files = await generateFiles(options);
    await Promise.all([
      fs.mkdir(path.resolve(dest, "api")),
      fs.mkdir(path.resolve(dest, "scripts")),
      fs.mkdir(path.resolve(dest, "test")),
    ]);
    await Promise.all(
      files.map((file) =>
        fs.writeFile(path.resolve(dest, file.name), file.content)
      )
    );
  } catch (e) {
    fatal(e);
  }
};
