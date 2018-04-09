"use strict";
const { common } = require("../util/cli");

const command = (exports.command = "add <command>");
exports.description = "Generate additional service files";

const describe = "TODO";

exports.builder = yargs =>
  common(yargs, { command, describe })
    .command(require("./add/script"))
    .command(require("./add/router"));
