"use strict";
const createBundle = require("../bundle");
const fs = require("fs");
const http = require("http");
const walkdir = require("walkdir");
const { relative } = require("path");
const { parse } = require("url");
const { fatal } = require("./log");
const { promisify } = require("util");

exports.stat = promisify(fs.stat);
exports.readFile = promisify(fs.readFile);
exports.writeFile = promisify(fs.writeFile);
exports.exists = promisify(fs.exists);
exports.createReadStream = fs.createReadStream;
exports.createWriteStream = fs.createWriteStream;

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(path, res => resolve(res)).on("error", err => reject(err));
  });
}

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

exports.resolveToFileStream = async function resolveToFileStream(path) {
  if (path === "-") {
    const stream = process.stdin;
    stream.path = "data.bin";
    return stream;
  }

  const { protocol } = parse(path);
  if (protocol) return await downloadToStream(path);
  if (!await exports.exists(path)) {
    fatal(`No such file or directory: "${path}".`);
  }
  if (await exports.isDirectory(path)) {
    return bundleToStream(path);
  }
  return exports.createReadStream(path);
};

async function downloadToStream(path) {
  try {
    const res = await get(path);
    if (res.statusCode >= 400) {
      fatal(
        `Server responded with code ${res.statusCode} while fetching "${path}".`
      );
      process.exit(1);
    }
    return res;
  } catch (e) {
    fatal(`Failed to resolve URL "${path}".`);
  }
}

async function bundleToStream(path) {
  const temppath = await createBundle(path);
  return exports.createReadStream(temppath);
}
