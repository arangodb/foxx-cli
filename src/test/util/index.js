"use strict";

const execFile = require("child_process").execFile;
const os = require("os");
const path = require("path");

const foxxRcFile = path.resolve(os.tmpdir(), ".foxxrc");

module.exports = (command, raw = false, { input, ...options } = {}) =>
  new Promise((resolve, reject) => {
    const foxx = path.resolve(__dirname, "..", "..", "..", "bin", "foxx");
    try {
      const proc = execFile(
        "node",
        raw
          ? [foxx, ...command.split(" "), "--raw"]
          : [foxx, ...command.split(" ")],
        {
          ...options,
          env: { ...options.env, FORCE_COLOR: "0", FOXXRC_PATH: foxxRcFile }
        },
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
