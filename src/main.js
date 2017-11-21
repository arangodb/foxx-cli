"use strict";
const { version } = require("../package.json");
const yargs = require(".");

const argv = yargs.argv;
if (!argv._.length) {
  if (argv.version) {
    console.log(version);
    process.exit(0);
  } else {
    yargs.showHelp();
    process.exit(1);
  }
}
