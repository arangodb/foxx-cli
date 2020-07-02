"use strict";
const extractZip = require("extract-zip");
const fs = require("fs");
const promisify = require("util.promisify");
const path = require("path");

const promisify2 = (fn) => (...args) =>
  new Promise((resolve, reject) => {
    try {
      fn(...args, (result) => {
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
exports.realpath = promisify(fs.realpath);

exports.safeStat = async function safeStat(path) {
  try {
    const stats = await exports.stat(path);
    return stats;
  } catch (e) {
    return null;
  }
};

exports.walk = async function walk(basepath, shouldIgnore) {
  const followed = [await exports.realpath(basepath)];
  const dirs = [basepath];
  const files = [];
  for (const dirpath of dirs) {
    const names = await exports.readdir(dirpath);
    await Promise.all(
      names.map(async (name) => {
        const abspath = path.join(dirpath, name);
        const stats = await exports.safeStat(abspath);
        if (stats.isDirectory()) {
          const realpath = await exports.realpath(abspath);
          if (realpath !== abspath) {
            if (followed.includes(realpath)) return;
            followed.push(realpath);
          }
          dirs.push(abspath);
        } else if (stats.isFile()) {
          const relpath = path.relative(basepath, abspath);
          if (shouldIgnore && shouldIgnore(relpath)) return;
          files.push(relpath);
        }
      })
    );
  }
  return files;
};
