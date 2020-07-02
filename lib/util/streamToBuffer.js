"use strict";
module.exports = function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("error", (err) => reject(err));
    stream.on("data", (chunk) => {
      chunks.push(chunk);
    });
    stream.on("close", () => resolve(Buffer.concat(chunks)));
  });
};
