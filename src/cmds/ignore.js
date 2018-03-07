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
  common(yargs, { command, aliases, describe, args })
    .options({
      force: {
        describe: "Overwrite existing patterns (including defaults)",
        alias: "f",
        type: "boolean",
        default: false
      }
    })
    .example(
      "$0 ignore",
      "Creates a .foxxignore file with defaults in the current directory if it does not already exist"
    )
    .example(
      "$0 ignore example/",
      'Adds the pattern for a directory "example" to the .foxxignore file'
    )
    .example(
      "$0 ignore example.md",
      'Adds the pattern for a file "example.md" to the .foxxignore file'
    )
    .example("$0 ignore example/ example.md", "Adds multiple patterns")
    .example(
      "$0 ignore *.md",
      'Adds a pattern to ignore all files ending with ".md"'
    )
    .example(
      "$0 ignore -f example/",
      "Overwrites all patterns with the given one"
    )
    .example("$0 ignore -f", "Removes all patterns from .foxxignore");

exports.handler = async function handler(argv) {
  const foxxignore = resolve(process.cwd(), ".foxxignore");
  try {
    await saveIgnore(foxxignore, argv.patterns, argv.force);
  } catch (e) {
    fatal(e);
  }
};
