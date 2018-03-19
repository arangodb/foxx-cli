"use strict";
const { bold, white } = require("chalk");
const { common, serverArgs } = require("../util/cli");
const { fatal, info, json } = require("../util/log");
const { group, inline: il } = require("../util/text");

const client = require("../util/client");
const errors = require("../errors");
const reporters = require("../reporters");
const resolveServer = require("../resolveServer");

const command = (exports.command = "test <mount>");
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

const args = [["mount", "Mount path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args })
    .options({
      ...serverArgs,
      reporter: {
        describe: "Reporter to use for result data",
        alias: "R",
        choices: ["spec", "list", "min", "json", "tap", "stream", "xunit"],
        default: "spec"
      }
    })
    .example(
      "$0 test /hello",
      'Runs the tests of a Foxx service at the URL "/hello"'
    )
    .example(
      "$0 test -R json /hello",
      "Use the json reporter instead of the default"
    )
    .example(
      "$0 test --server http://locahost:8530 /hello",
      "Use the server on port 8530 instead of the default"
    )
    .example(
      "$0 test --database mydb /hello",
      'Use the database "mydb" instead of the default'
    )
    .example(
      "$0 test --server dev /hello",
      'Use the "dev" server instead of the default. See the "server" command for details'
    );

exports.handler = async function handler(argv) {
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    return await runTests(db, argv.mount, argv.reporter);
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
          fatal(`No service found at "${white(mount)}".`);
          break;
        case errors.ERROR_SERVICE_NEEDS_CONFIGURATION:
          fatal(
            `Service at "${white(
              mount
            )}" is missing configuration or dependencies.`
          );
          break;
        case errors.ERROR_MODULE_NOT_FOUND:
          fatal(
            `Server encountered errors trying to locate a JavaScript file:\n\n${
              e.message
            }\n\nMake sure the service bundle includes all files referenced in the manifest.`
          );
          break;
        case errors.ERROR_MODULE_FAILURE:
          fatal(
            `Server encountered errors executing a JavaScript file:\n\n${
              e.message
            }\n\nMake sure all tests are specified via the manifest, not loaded directly from another test file. For details check the arangod server logs.`
          );
          break;
        case errors.ERROR_MODULE_SYNTAX_ERROR:
          fatal(
            `Server encountered errors trying to parse a JavaScript file:\n\n${
              e.message
            }`
          );
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
