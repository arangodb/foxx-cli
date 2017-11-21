"use strict";
const { homedir } = require("os");
const { resolve } = require("path");
const { encode, decode } = require("ini");
const { exists, readFile, writeFile } = require("./util/fs");

const RC_FILENAME = ".foxxrc";

exports.load = async function load() {
  const defaults = {
    server: {}
  };
  const rcfile = resolve(homedir(), RC_FILENAME);
  if (!await exists(rcfile)) {
    return defaults;
  }
  const data = await readFile(rcfile, "utf-8");
  const obj = decode(data);
  return Object.assign(defaults, obj);
};

exports.save = async function save(obj) {
  const rcfile = resolve(homedir(), RC_FILENAME);
  const data = encode(obj);
  await writeFile(rcfile, data);
};
