"use strict";

const exec = require("child_process").execSync;
const path = require("path");

module.exports = (command, raw = false, cwd) => {
  const foxx = `node ${path.resolve(__dirname, "..", "..", "bin", "foxx")}`;
  if (raw) return JSON.parse(exec(`${foxx} ${command} --raw`, { cwd }));
  else return exec(`${foxx} ${command}`, { cwd }).toString("utf-8");
};
