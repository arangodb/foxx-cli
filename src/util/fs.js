"use strict";
const extractZip = require("extract-zip");
const fs = require("fs");
const promisify = require("util.promisify");
const { relative } = require("path");
const walkdir = require("walkdir");

const promisify2 = fn => (...args) =>
  new Promise((resolve, reject) => {
    try {
      fn(...args, result => {
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });

exports.extract = promisify(extractZip);
exports.exists = promisify2(fs.exists);
exports.mkdir = promisify(fs.mkdir);
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
