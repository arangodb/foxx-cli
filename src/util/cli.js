"use strict";
const { white, bold } = require("chalk");
const { splat, unsplat } = require("./array");
const { fatal } = require("./log");
const { group, inline: il } = require("./text");

exports.common = function common(yargs, opts) {
  yargs = yargs
    .epilog("Copyright (c) 2016-2017 ArangoDB GmbH (https://foxx.arangodb.com)")
    .strict();

  if (opts) {
    let usage = "Usage: $0";
    if (opts.sub) usage += " " + opts.sub;
    if (opts.command) usage += " " + opts.command;
    if (opts.aliases) usage += "\nAliases: " + opts.aliases.join(", ");
    if (opts.describe) usage += "\n\n" + opts.describe;
    if (opts.args) usage += "\n\n" + group("Arguments", ...opts.args);
    yargs.usage(usage);
  }

  return yargs;
};

exports.serverArgs = {
  server: {
    describe: "ArangoDB server URL or alias",
    alias: "H",
    type: "string",
    default: "default"
  },
  username: {
    describe: "Username to authenticate with",
    alias: "u",
    type: "string"
  },
  password: {
    describe: "Use password to authenticate",
    alias: "P",
    type: "boolean",
    default: false
  },
  passwordFile: {
    describe: "Use a password from a file to authenticate",
    alias: "F",
    type: "string"
  },
  token: {
    describe: "Use bearer token to authenticate",
    alias: "T",
    type: "boolean",
    default: false
  },
  database: {
    describe: "ArangoDB database name",
    alias: "D",
    type: "string"
  }
};

exports.parseServiceOptions = function parseServiceOptions(argv) {
  if (argv.source) argv.source = unsplat(argv.source);
  if (argv.cfg) argv.cfg = splat(argv.cfg);
  if (argv.dep) argv.dep = splat(argv.dep);

  if (argv.remote) {
    if (!argv.source || argv.source === "@") {
      fatal(
        `Please specify a URL or file path when using ${bold("--remote")}.`
      );
    }
  } else if (!argv.source) {
    argv.source = process.cwd();
  }

  const configuration = {};
  if (argv.cfg) {
    for (const cfg of argv.cfg) {
      const i = cfg.indexOf("=");
      if (i === -1 || i === 0) {
        fatal(il`
          Configuration options must be specified as name=value pairs.
          Option "${white(cfg)}" is invalid.
        `);
      }

      const name = cfg.slice(0, i);
      const value = cfg.slice(i + 1);

      try {
        configuration[name] = value ? JSON.parse(value) : null;
      } catch (e) {
        fatal(il`
          Configuration option "${white(
            name
          )}" is invalid. Value must be valid JSON: "${white(value)}".
        `);
      }
    }
  }

  const dependencies = {};
  if (argv.dep) {
    for (const dep of argv.dep) {
      const i = dep.indexOf("=");
      if (i === -1 || i === 0) {
        fatal(il`
          Dependency options must be specified as name=/path pairs.
          Option "${white(dep)}" is invalid.
        `);
      }

      const name = dep.slice(0, i);
      const value = dep.slice(i + 1);

      if (dependencies[name]) {
        if (!Array.isArray(dependencies[name])) {
          dependencies[name] = [dependencies[name]];
        }
        dependencies[name].push(value);
      } else {
        dependencies[name] = value;
      }
    }
  }
  const opts = { configuration, dependencies };
  if (argv.development) opts.development = true;
  if (argv.legacy) opts.legacy = true;
  return opts;
};
