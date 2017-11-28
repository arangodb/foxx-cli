"use strict";
const { createBundle } = require("./bundle");
const { createReadStream } = require("fs");
const { fatal } = require("./util/log");
const http = require("http");
const { parse: parseUrl } = require("url");
const { safeStat } = require("./util/fs");

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(path, res => resolve(res)).on("error", err => reject(err));
  });
}

module.exports = async function resolveToStream(path) {
  if (path === "-") {
    const stream = process.stdin;
    stream.path = "data.bin";
    return stream;
  }
  const { protocol } = parseUrl(path);
  if (protocol) {
    return await downloadToStream(path);
  }
  const stats = await safeStat(path);
  if (!stats) {
    fatal(`No such file or directory: "${path}".`);
  }
  if (stats.isDirectory(path)) {
    return bundleToStream(path);
  }
  return createReadStream(path);
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
  return createReadStream(temppath);
}
