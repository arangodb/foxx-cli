"use strict";

const exec = require("child_process").execSync;
const path = require("path");

module.exports = command => {
  return JSON.parse(
    exec(`node foxx ${command} --raw`, {
      cwd: path.resolve(__dirname, "..", "..", "bin")
    })
  );
};
