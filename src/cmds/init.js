"use strict";
const { bold } = require("chalk");
const { readdir, exists } = require("fs");
const { basename, join } = require("path");
const { common } = require("../util/cli");
const { warn, fatal } = require("../util/log");
const { inline: il } = require("../util/text");
const generateFiles = require("../generator");
const wizard = require("../generator/wizard");

const command = (exports.command = "init");
const description = (exports.description = "Create a new Foxx service");

const describe = description;

exports.builder = yargs =>
  common(yargs, { command, describe }).options({
    yes: {
      describe: "Use default and example values instead of prompting for input",
      alias: "y",
      type: "boolean",
      default: false
    },
    no: {
      describe: "Use minimal default values instead of prompting for input",
      alias: "n",
      type: "boolean",
      default: false
    },
    force: {
      describe: "Overwrite manifest file if it already exists",
      alias: "f",
      type: "boolean",
      default: false
    }
  });

exports.handler = async function handler(argv) {
  if (argv.yes && argv.no) {
    fatal(il`
      Can't mix ${bold("--yes")} and ${bold("--no")}.
      You have to pick one or neither.
    `);
  }
  const cwd = process.cwd();
  const manifestPath = join(cwd, "manifest.json");
  if (await exists(manifestPath)) {
    if (!argv.force) {
      fatal(il`
        Manifest file already exists.
        Use ${bold("--force")} to overwrite.
      `);
    } else if (argv.verbose) {
      warn("Overwriting existing manifest file.");
    }
  }
  let mainFile = "index.js";
  const indexFileExists = !await exists(join(cwd, mainFile));
  if (!indexFileExists) {
    const jsFiles = readdir(cwd).filter(
      name => !name.startsWith(".") && name.endsWith(".js")
    );
    if (jsFiles.length) mainFile = jsFiles.sort()[0];
  }
  if (argv.yes || argv.no) {
    console.log(JSON.stringify(argv, null, 2));
    process.exit(0);
  }
  try {
    const answers = await wizard({
      cwd,
      mainFile,
      name: basename(cwd),
      version: "0.0.0",
      engineVersion: "^3.0.0"
    });
    const files = await generateFiles(answers);
    for (const file of files) {
      console.log();
      console.log(file.name);
      console.log("-".repeat(file.name.length));
      console.log(file.content);
      console.log();
    }
    console.log(JSON.stringify(answers, null, 2));
  } catch (e) {
    fatal(e);
  }
};
