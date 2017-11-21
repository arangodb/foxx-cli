"use strict";
const { version } = require("../package.json");
const { info } = require("./util/log");
const yargs = require(".");

const argv = yargs.argv;
if (!argv._.length) {
  if (argv.version) {
    info(version);
    process.exit(0);
  } else {
    yargs.showHelp();
    process.exit(1);
  }
}
