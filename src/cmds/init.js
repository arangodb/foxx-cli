"use strict";
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
  ["dest", "File system path of the service to create.", '[default: "."]']
];

exports.builder = yargs =>
  common(yargs, { command, describe, args })
    .options({
      example: {
        describe: "Generate example code",
        alias: "e",
        type: "boolean",
        default: false
      },
      interactive: {
        describe: "Prompt for input instead of using default values",
        alias: "i",
        type: "boolean",
        default: false
      }
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
  const stat = await fs.safeStat(dest);
  if (!stat) {
    await fs.mkdir(path.resolve(dest));
  } else if (!stat.isDirectory()) {
    fatal(`'${dest}' is not a directory.`);
  }
  if ((await fs.readdir(dest)).length > 0) {
    fatal(`Directory '${dest}' is not empty.`);
  }
  let options = {
    cwd: dest,
    example: argv.example && !argv.interactive,
    name: path.basename(dest),
    version: "0.0.0",
    mainFile: "index.js",
    engineVersion: "^3.0.0"
  };
  if (options.example) {
    options.name = "hello-world";
    options.authorName = "ArangoDB GmbH";
    options.license = "Apache-2.0";
    options.description = "A simple Hello Word Foxx service";
  }
  if (argv.interactive) {
    options = Object.assign(options, await wizard(options));
  }
  try {
    const files = await generateFiles(options);
    await fs.mkdir(path.resolve(dest, "api"));
    await fs.mkdir(path.resolve(dest, "scripts"));
    await fs.mkdir(path.resolve(dest, "test"));
    await Promise.all(
      files.map(file =>
        fs.writeFile(path.resolve(dest, file.name), file.content)
      )
    );
  } catch (e) {
    fatal(e);
  }
};
