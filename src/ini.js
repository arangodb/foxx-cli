"use strict";
const { homedir } = require("os");
const { resolve } = require("path");
const { encode, decode } = require("ini");
const { exists, readFile, writeFile } = require("./util/fs");

const RC_FILENAME = ".foxxrc";

function getRcFilePath() {
  return process.env.FOXXRC_PATH || resolve(homedir(), RC_FILENAME);
}

exports.load = async function load() {
  const defaults = {
    server: {},
  };
  const rcfile = getRcFilePath();
  if (!(await exists(rcfile))) {
    return defaults;
  }
  const data = await readFile(rcfile, "utf-8");
  const obj = decode(data);
  return Object.assign(defaults, obj);
};

exports.save = async function save(obj) {
  const rcfile = getRcFilePath();
  const data = encode(obj);
  await writeFile(rcfile, data);
};
