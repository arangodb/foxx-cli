"use strict";

const exec = require("child_process").execSync;
const path = require("path");

module.exports = (command, raw = false) => {
  if (raw)
    return JSON.parse(
      exec(`node foxx ${command} --raw`, {
        cwd: path.resolve(__dirname, "..", "..", "bin")
      })
    );
  else
    return exec(`node foxx ${command}`, {
      cwd: path.resolve(__dirname, "..", "..", "bin")
    }).toString("utf-8");
};
