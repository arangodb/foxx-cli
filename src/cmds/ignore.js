"use strict";
const { resolve } = require("path");
const { common } = require("../util/cli");
const { fatal } = require("../util/text");
const { save: saveIgnore } = require("../ignore");

const command = (exports.command = "ignore [patterns..]");
exports.description = "Add one or more patterns to the .foxxignore file";
const aliases = (exports.aliases = ["exclude"]);

const describe =
  "Add one or more patterns to the .foxxingore file which is used to exclude files from being archived with the command bundle.";

const args = [["patterns", "Patterns to add to the .foxxignore file"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args }).options({
    force: {
      describe: "Overwrite existing patterns (including defaults)",
      alias: "f",
      type: "boolean",
      default: false
    }
  });

exports.handler = async function handler(argv) {
  const foxxignore = resolve(process.cwd(), ".foxxignore");
  try {
    await saveIgnore(foxxignore, argv.patterns, argv.force);
  } catch (e) {
    fatal(e);
  }
};
