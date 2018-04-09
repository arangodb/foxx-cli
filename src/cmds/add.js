"use strict";
const { common } = require("../util/cli");

const command = (exports.command = "add <command>");
exports.description = "Generate additional service files";

const describe =
  "Generates additional files for the local service and adds them, depending on the file, to the manifest.json and/or main Javascript file.";

exports.builder = yargs =>
  common(yargs, { command, describe })
    .command(require("./add/script"))
    .command(require("./add/router"))
    .command(require("./add/crud"))
    .command(require("./add/test"));
