"use strict";
const extractZip = require("extract-zip");
const fs = require("fs");
const { promisify } = require("util");
const { relative } = require("path");
const temp = require("temp");
const walkdir = require("walkdir");

exports.extract = promisify(extractZip);
exports.exists = promisify(fs.exists);
exports.readdir = promisify(fs.readdir);
exports.readFile = promisify(fs.readFile);
exports.stat = promisify(fs.stat);
exports.unlink = promisify(fs.unlink);
exports.writeFile = promisify(fs.writeFile);

exports.safeStat = async function safeStat(path) {
  try {
    const stats = await exports.stat(path);
    return stats;
  } catch (e) {
    return null;
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

exports.extractBuffer = async function extractBuffer(buf, ...args) {
  const tmpfile = temp.path({ suffix: ".zip" });
  try {
    await exports.writeFile(tmpfile, buf);
    await exports.extract(tmpfile, ...args);
  } finally {
    await exports.unlink(tmpfile);
  }
};
