"use strict";

const exec = require("child_process").execSync;
const path = require("path");

module.exports = (command, raw = false) => {
  const options = {
    cwd: path.resolve(__dirname, "..", "..", "bin")
  };
  if (raw) return JSON.parse(exec(`node foxx ${command} --raw`, options));
  else return exec(`node foxx ${command}`, options).toString("utf-8");
};
