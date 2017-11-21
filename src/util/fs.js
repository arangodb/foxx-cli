"use strict";
const fs = require("fs");
const walkdir = require("walkdir");
const { relative } = require("path");
const { promisify } = require("util");

exports.stat = promisify(fs.stat);
exports.readFile = promisify(fs.readFile);
exports.writeFile = promisify(fs.writeFile);
exports.exists = promisify(fs.exists);

exports.isDirectory = async function isDirectory(path) {
  try {
    const stats = await exports.stat(path);
    return stats.isDirectory();
  } catch (e) {
    return false;
  }
};

exports.walk = function walk(basepath, shouldIgnore) {
  return new Promise((resolve, reject) => {
    const files = [];
    const walker = walkdir(basepath);
    walker.on("file", (abspath, stats) => {
      if (!stats.isFile()) return;
      const path = relative(basepath, abspath);
      if (shouldIgnore && shouldIgnore(path)) return;
      files.push(path);
    });
    walker.on("error", e => reject(e));
    walker.on("end", () => resolve(files));
  });
};
