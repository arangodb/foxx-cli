"use strict";
const { createReadStream, createWriteStream } = require("fs");
const { resolve: resolvePath } = require("path");

const archiver = require("archiver");
const { createWriteStream: createTempStream } = require("temp");
const temp = require("temp");
const { version } = require("../../package.json");

const comment = `Created with foxx-cli v${version} (https://foxx.arangodb.com)`;

function append(zipstream, basepath, name) {
  return new Promise((resolve, reject) => {
    const stream = createReadStream(resolvePath(basepath, name));
    stream.on("error", e => reject(e));
    stream.on("close", () => resolve());
    zipstream.append(stream, { name });
  });
}

exports.zip = function zip(basepath, files, dest) {
  return new Promise(async (resolve, reject) => {
    let filename, filestream;
    if (typeof dest === "string") {
      filename = dest;
      filestream = createWriteStream(dest);
    } else if (dest) {
      filestream = dest;
      filename = dest.path;
    } else {
      filestream = createTempStream({ suffix: ".zip" });
      filename = filestream.path;
    }
    filestream.on("close", () => resolve(filename));
    filestream.on("error", e => reject(e));
    const zipstream = archiver("zip", { comment });
    zipstream.on("error", e => reject(e));
    zipstream.pipe(filestream);
    for (const name of files) {
      await append(zipstream, basepath, name);
    }
    zipstream.finalize();
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
