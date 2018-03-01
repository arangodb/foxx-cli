"use strict";

const exec = require("child_process").execSync;
const path = require("path");

module.exports = (command, raw = false, options) => {
  const foxx = `node ${path.resolve(__dirname, "..", "..", "bin", "foxx")}`;
  if (raw) return JSON.parse(exec(`${foxx} ${command} --raw`, options));
  else return exec(`${foxx} ${command}`, options).toString("utf-8");
};
