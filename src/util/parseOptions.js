"use strict";
const { splat } = require("./array");

module.exports = function parseOptions(options) {
  if (!options || !options.length) return null;
  const parsed = {};
  for (const pair of splat(options)) {
    const [key, ...tail] = pair.split("=");
    const value = tail.join("=");
    parsed[key] = value;
  }
  return parsed;
};
