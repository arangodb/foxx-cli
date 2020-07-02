"use strict";
const { ERROR_SERVICE_NOT_FOUND } = require("../errors");
const { error, info, fatal, json } = require("../util/log");

const { bold, gray, red, white } = require("chalk");
const client = require("../util/client");
const { common, serverArgs } = require("../util/cli");
const { inline: il } = require("../util/text");
const parseOptions = require("../util/parseOptions");
const resolveServer = require("../resolveServer");
const streamToBuffer = require("../util/streamToBuffer");

const command = (exports.command = "deps <mount> [options..]");
exports.description = "Manage the dependencies of a mounted service";
const aliases = (exports.aliases = ["dependencies", "dep"]);

const describe = il`Updates or fetches the current dependencies for service at the given ${bold(
  "mount"
)} path.

Returns an object mapping the dependency names to their definitions including a human-friendly title and the current mount path (if any).`;

const args = [
  ["mount", "Mount path of the service"],
  [
    "options",
    `Key-value pairs to apply to the dependencies. Use ${bold(
      "@"
    )} to pass a JSON file from stdin`,
  ],
];

exports.builder = (yargs) =>
  common(yargs, { command, aliases, describe, args })
    .options({
      ...serverArgs,
      force: {
        describe: il`
          Clear existing values for any omitted dependencies.
          Note that clearing required dependencies will result in
          the service being disabled until new values are provided.
        `,
        alias: "f",
        type: "boolean",
        default: false,
      },
      raw: {
        describe: "Output service dependencies as raw JSON",
        type: "boolean",
        default: false,
      },
      minimal: {
        describe: "Print minimal output",
        type: "boolean",
        default: false,
      },
    })
    .example(
      "$0 deps /myfoxx",
      'Show the dependencies for the service mounted at "/foxxmail"'
    )
    .example(
      "$0 deps /myfoxx mailer=/foxxmail",
      'Sets the "mailer" dependency to the service mounted at "/foxxmail"'
    )
    .example(
      "$0 deps /myfoxx -f mailer=/foxxmail",
      'Sets the "mailer" dependency and clears any other dependencies'
    )
    .example(
      'echo \'{"mailer": "/foxxmail"}\' | $0 deps /myfoxx @',
      "Sets the dependency using JSON data from stdin"
    )
    .example("$0 deps /myfoxx -f", "Clears all configured dependencies");

exports.handler = async function handler(argv) {
  let options = parseOptions(argv.options);
  if (!options && argv.force) {
    options = {};
  } else if (options === "@") {
    const output = await streamToBuffer(process.stdin);
    let json;
    try {
      json = output.toString("utf-8");
    } catch (e) {
      fatal("Not a valid JSON string");
    }
    try {
      options = JSON.parse(json);
    } catch (e) {
      fatal(e.message);
    }
  }
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    let result;
    if (!options) {
      result = await db.getServiceDependencies(argv.mount);
    } else if (argv.force) {
      result = await db.replaceServiceDependencies(argv.mount, options);
    } else {
      result = await db.updateServiceDependencies(argv.mount, options);
    }
    if (argv.raw) {
      if (argv.minimal) {
        result = Object.keys(result).reduce(
          (obj, key) => {
            obj.values[key] = result[key].current;
            if (result[key].warning) {
              if (!obj.warnings) obj.warnings = {};
              obj.warnings[key] = result[key].warning;
            }
            return obj;
          },
          { values: {} }
        );
        if (!options) json(result.values);
        else json(result);
      } else json(result);
    } else if (argv.minimal) {
      for (const key of Object.keys(result)) {
        const dfn = result[key];
        if (dfn.warning) error(`${key}: ${dfn.warning}`);
        if (dfn.current === undefined) info(`${key}: ${gray("N/A")}`);
        else info(`${key}: ${dfn.current}`);
      }
    } else {
      let i = Object.keys(result).length;
      for (const key of Object.keys(result)) {
        const dfn = result[key];
        info(bold(dfn.title));
        info(`Key: ${key}`);
        const parts = [`Depends: ${dfn.name}@${dfn.version}`];
        if (!dfn.required) parts.push(gray("(optional)"));
        if (dfn.multiple) parts.push(red("(multi)"));
        info(parts.join(" "));
        if (dfn.current === undefined) info(`Mount: ${gray("N/A")}`);
        else info(`Mount: ${dfn.current}`);
        info(dfn.description);
        if (i-- > 1) info("");
      }
    }
  } catch (e) {
    if (e.isArangoError && e.errorNum === ERROR_SERVICE_NOT_FOUND) {
      fatal(`No service found at "${white(argv.mount)}"`);
    }
    fatal(e);
  }
};
