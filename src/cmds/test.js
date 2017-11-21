"use strict";
const { white, bold } = require("chalk");
const { common } = require("../util/cli");
const errors = require("../errors");
const reporters = require("../reporters");
const client = require("../util/client");
const resolveServer = require("../resolveServer");
const { info, json, error, fatal } = require("../util/log");
const { group, inline: il } = require("../util/text");

const command = (exports.command = "test <path>");
exports.description = "Run the tests of a mounted service";
const aliases = (exports.aliases = ["tests", "run-tests"]);

const describe =
  il`
    Run the tests of a mounted service.

    Output is controlled with the ${bold("--reporter")} option:
  ` +
  "\n\n" +
  group(
    ["spec", "Hierarchical specification of nested test cases", "[default]"],
    ["list", "Simple list of test cases"],
    ["min", "Just the summary and failures"],
    ["json", "Single large raw JSON object"],
    ["tap", "Output suitable for Test-Anything-Protocol consumers"],
    [
      "stream",
      'Line-delimited JSON stream of "events" beginning with a single "start", followed by "pass" or "fail" for each test and ending with a single "end"'
    ],
    ["xunit", "Jenkins-compatible xUnit-style XML output"]
  );

const args = [["path", "Database-relative path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args }).options({
    reporter: {
      describe: "Reporter to use for result data",
      alias: "R",
      choices: ["spec", "list", "min", "json", "tap", "stream", "xunit"],
      default: "spec"
    }
  });

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv.path);
    const db = client(server);
    return await runTests(db, server.mount, argv.reporter);
  } catch (e) {
    fatal(e);
  }
};

async function runTests(db, mount, cliReporter) {
  let apiReporter;
  if (cliReporter === "spec") apiReporter = "suite";
  else if (cliReporter === "json") apiReporter = "default";
  else if (cliReporter === "list") apiReporter = "default";
  else if (cliReporter === "min") apiReporter = "default";
  else apiReporter = cliReporter;

  let result;
  try {
    result = await db.runServiceTests(mount, { reporter: apiReporter });
  } catch (e) {
    if (e.isArangoError) {
      switch (e.errorNum) {
        case errors.ERROR_SERVICE_NOT_FOUND:
          error(`No service found at "${white(mount)}".`);
          process.exit(1);
          break;
        case errors.ERROR_SERVICE_NEEDS_CONFIGURATION:
          error(
            `Service at "${white(
              mount
            )}" is missing configuration or dependencies.`
          );
          process.exit(1);
          break;
        case errors.ERROR_MODULE_NOT_FOUND:
          error("An error occured while trying to execute the tests:");
          error(e);
          error(
            "This typically means the tests tried to require a path that does not exist."
          );
          error(
            "Make sure the service bundle includes all the files you expect."
          );
          process.exit(1);
          break;
        case errors.ERROR_MODULE_FAILURE:
          error("An error occured while trying to execute the tests:");
          error(e);
          error(il`
            Make sure all tests are specified via the manifest,
            not loaded directly from another test file.
          `);
          process.exit(1);
          break;
      }
    }
    throw e;
  }

  if (cliReporter === "xunit") {
    info(result);
    const lines = result.split("\n");
    const match = lines[1].match(/ failures="(\d+)"/);
    process.exit((match && Number(match[1])) || 0);
  }

  if (cliReporter === "tap") {
    info(result);
    const lines = result.split("\n");
    while (lines.length > 1 && !lines[lines.length - 1]) lines.pop();
    const match = lines[lines.length - 1].match(/# fail (\d+)/);
    process.exit((match && Number(match[1])) || 0);
  }

  if (cliReporter === "stream") {
    info(result);
    const lines = result.split("\n");
    process.exit(lines.filter(line => line.startsWith('["fail",')).length);
  }

  if (cliReporter === "list" || cliReporter === "min") {
    const failures = reporters.list(result, cliReporter === "min");
    process.exit(failures || 0);
  }

  if (cliReporter === "spec") {
    const failures = reporters.suite(result);
    process.exit(failures || 0);
  }

  if (typeof result === "string") {
    info(result);
  } else {
    json(result);
  }
  process.exit(
    result && result.stats && typeof result.stats.failures === "number"
      ? result.stats.failures
      : 0
  );
}
