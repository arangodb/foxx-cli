"use strict";
const { createBundle } = require("./bundle");
const { createReadStream } = require("fs");
const { fatal } = require("./util/log");
const request = require("request");
const { parse: parseUrl } = require("url");
const { safeStat } = require("./util/fs");

function get(path) {
  return new Promise((resolve, reject) => {
    request(path, { encoding: null }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

module.exports = async function resolveToStream(path) {
  if (path === "@") {
    const stream = process.stdin;
    stream.path = "data.bin";
    return stream;
  }
  const stats = await safeStat(path);
  if (stats) {
    if (stats.isDirectory(path)) {
      return bundleToStream(path);
    }
    return createReadStream(path);
  }
  const { protocol } = parseUrl(path);
  if (protocol) {
    return await downloadToBuffer(path);
  }
  fatal(`No such file or directory: "${path}".`);
};

async function downloadToBuffer(path) {
  try {
    const res = await get(path);
    if (res.statusCode >= 400) {
      fatal(
        `Server responded with code ${res.statusCode} while fetching "${path}".`
      );
    }
    return res.body;
  } catch (e) {
    fatal(`Failed to resolve URL "${path}".`);
  }
}

async function bundleToStream(path) {
  const temppath = await createBundle(path);
  return createReadStream(temppath);
}
