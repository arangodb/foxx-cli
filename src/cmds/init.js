"use strict";
const { bold } = require("chalk");
const { readdirSync, exists } = require("fs");
const { basename, join } = require("path");
const { common } = require("../util/cli");
const { warn, fatal } = require("../util/log");
const { inline: il } = require("../util/text");
const generateFiles = require("../generator");
const wizard = require("../generator/wizard");
const fs = require("fs");
const path = require("path");

const command = (exports.command = "init [target]");
exports.description = "Create a new Foxx service";

const describe = "Creates a new Foxx service in the given file system path.";

const args = [
  ["target", "File system path of the service to create.", '[default: "."]']
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
  const cwd = argv.target ? argv.target : process.cwd();
  if (!fs.existsSync(cwd)) {
    fatal(`Directory '${cwd}' does not exists.`);
  }
  if (!fs.lstatSync(cwd).isDirectory()) {
    fatal(`'${cwd}' is not a directory.`);
  }
  if (readdirSync(cwd).length > 0) {
    fatal(`Directory '${cwd}' is not empty.`);
  }
  let options = {
    cwd,
    example: argv.example && !argv.interactive,
    mainFile: "index.js",
    name: basename(cwd),
    version: "0.0.0",
    engineVersion: "^3.0.0"
  };
  if (options.example) {
    options.name = "Hello World Foxx Service";
    options.authorName = "ArangoDB GmbH";
    options.license = "Apache-2.0";
    options.description = "A simple Hello Word Foxx service";
  }
  if (argv.interactive) {
    options = await wizard(options);
  }
  try {
    const files = await generateFiles(options);
    await Promise.all(
      files.map(file =>
        fs.writeFile(path.resolve(cwd, file.name), file.content, () => {})
      )
    );
    for (const file of files) {
      console.log();
      console.log(file.name);
      console.log("-".repeat(file.name.length));
      console.log(file.content);
      console.log();
    }
    // console.log(JSON.stringify(options, null, 2));
  } catch (e) {
    fatal(e);
  }
  // const manifestPath = join(cwd, "manifest.json");
  // if (await exists(manifestPath)) {
  //   if (!argv.force) {
  //     fatal(il`
  //       Manifest file already exists.
  //       Use ${bold("--force")} to overwrite.
  //     `);
  //   } else if (argv.verbose) {
  //     warn("Overwriting existing manifest file.");
  //   }
  // }
  // let mainFile = "index.js";
  // const indexFileExists = !await exists(join(cwd, mainFile));
  // if (!indexFileExists) {
  //   const jsFiles = readdir(cwd).filter(
  //     name => !name.startsWith(".") && name.endsWith(".js")
  //   );
  //   if (jsFiles.length) mainFile = jsFiles.sort()[0];
  // }
  // if (argv.yes) {
  //   console.log("TODO", JSON.stringify(argv, null, 2));
  //   process.exit(0);
  // }

  // const answers = await wizard({
  //   cwd,
  //   mainFile,
  //   all: argv.all,
  //   name: basename(cwd),
  //   version: "0.0.0",
  //   engineVersion: "^3.0.0"
  // });
};
