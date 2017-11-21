"use strict";
const { resolve } = require("path");
const { walk } = require("./util/fs");
const zip = require("./util/zip");
const { buildMatcher } = require("./ignore");

module.exports = async function createBundle(path, dest) {
  const foxxignore = resolve(path, ".foxxignore");
  const shouldIgnore = await buildMatcher(foxxignore);
  const files = await walk(path, shouldIgnore);
  return await zip(files, dest);
};
