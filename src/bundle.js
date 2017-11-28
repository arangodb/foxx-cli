"use strict";
const { load } = require("./ignore");
const { resolve } = require("path");
const { walk } = require("./util/fs");
const { zip } = require("./util/zip");

exports.gatherFiles = async function gatherFiles(path) {
  const foxxignore = resolve(path, ".foxxignore");
  const shouldIgnore = await load(foxxignore);
  return await walk(path, shouldIgnore);
};

exports.createBundle = async function createBundle(path, dest) {
  const files = await exports.gatherFiles(path);
  return await zip(files, dest);
};
