"use strict";

const execFile = require("child_process").execFile;
const os = require("os");
const path = require("path");

const foxxRcFile = path.resolve(os.tmpdir(), ".foxxrc");
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const SERVER_COMMANDS = [
  "config",
  "cfg",
  "configuration",
  "deps",
  "dep",
  "dependencies",
  "download",
  "dl",
  "install",
  "i",
  "list",
  "replace",
  "run",
  "script",
  "scripts",
  "set-dev",
  "set-development",
  "set-prod",
  "set-production",
  "show",
  "info",
  "test",
  "uninstall",
  "remove",
  "purge",
  "upgrade",
];

module.exports = (command, raw = false, { input, ...options } = {}) =>
  new Promise((resolve, reject) => {
    const foxx = path.resolve(__dirname, "..", "..", "..", "bin", "foxx");
    try {
      const parts = command.split(" ");
      if (
        SERVER_COMMANDS.includes(parts[0]) &&
        !parts.includes("--server") &&
        !parts.includes("-H")
      ) {
        parts.splice(1, 0, "--server", ARANGO_URL);
      }
      const proc = execFile(
        "node",
        raw ? [foxx, ...parts, "--raw"] : [foxx, ...parts],
        {
          ...options,
          env: { ...options.env, FORCE_COLOR: "0", FOXXRC_PATH: foxxRcFile },
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
