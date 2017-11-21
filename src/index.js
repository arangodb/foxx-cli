"use strict";
const { green } = require("chalk");
const yargs = require("yargs");
const { common } = require("./util/cli");

const foxx = green(
  `
   /\\
  (~(
   ) )     /\\_/\\
  (_ -----_(@ @)
    (       \\ /
    /|/--\\|\\ V
    " "   " "'
`.slice(1, -1)
);

common(yargs, { command: "<command>", describe: foxx })
  .wrap(Math.min(160, yargs.terminalWidth()))
  .help("help", "Show this usage information and exit")
  .command("help [command]", "Show help for a given command")
  .command(require("./cmds/bundle"))
  .command(require("./cmds/config"))
  .command(require("./cmds/deps"))
  .command(require("./cmds/download"))
  .command(require("./cmds/ignore"))
  .command(require("./cmds/info"))
  .command(require("./cmds/init"))
  .command(require("./cmds/install"))
  .command(require("./cmds/replace"))
  .command(require("./cmds/script"))
  .command(require("./cmds/server"))
  .command(require("./cmds/set-dev"))
  .command(require("./cmds/set-prod"))
  .command(require("./cmds/test"))
  .command(require("./cmds/uninstall"))
  .command(require("./cmds/upgrade"))
  .recommendCommands()
  .options({
    version: {
      describe: "Show version information and exit",
      alias: "V",
      type: "boolean",
      default: false
    },
    verbose: {
      describe: "More output",
      alias: "v",
      type: "count"
    }
  })
  .global("verbose")
  .group(["version", "help", "verbose"], "General options:");

module.exports = yargs;
