"use strict";
const { createBundle } = require("./bundle");
const { createReadStream } = require("fs");
const { fatal } = require("./util/log");
const got = require("got");
const { parse: parseUrl } = require("url");
const { safeStat } = require("./util/fs");

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
    const res = await got(path, { responseType: "buffer" });
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
