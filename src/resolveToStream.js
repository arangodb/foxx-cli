"use strict";
const http = require("http");
const { parse: parseUrl } = require("url");
const { createReadStream } = require("fs");
const { exists, isDirectory } = require("./util/fs");
const { fatal } = require("./util/log");
const createBundle = require("./bundle");

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
  if (!await exists(path)) {
    fatal(`No such file or directory: "${path}".`);
  }
  if (await isDirectory(path)) {
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
