"use strict";

const exec = require("child_process").exec;
const path = require("path");

module.exports = (command, raw = false, { input, ...options } = {}) =>
  new Promise((resolve, reject) => {
    const foxx = path.resolve(__dirname, "..", "..", "bin", "foxx");
    try {
      const proc = exec(
        raw ? `node ${foxx} ${command} --raw` : `node ${foxx} ${command}`,
        options,
        (err, stdout, stderr) => {
          if (err) {
            err.stdout = stdout;
            err.stderr = stderr;
            reject(err);
          } else if (raw) {
            resolve(JSON.parse(stdout));
          } else {
            resolve(stdout.toString("utf-8"));
          }
        }
      );
      if (input) {
        proc.stdin.write(input);
        proc.stdin.end();
      }
    } catch (e) {
      reject(e);
    }
  });
