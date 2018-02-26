"use strict";
const { bold, white } = require("chalk");
const { resolve } = require("path");
const { unsplat } = require("../util/array");
const { common } = require("../util/cli");
const { exists, safeStat } = require("../util/fs");
const { fatal } = require("../util/log");
const { inline: il } = require("../util/text");
const bundle = require("../bundle").createBundle;

const command = (exports.command = "bundle [source]");
const description = (exports.description =
  "Create a service bundle for a service");
const aliases = (exports.aliases = ["zip"]);

const describe = description;

const args = [
  [
    "source",
    "File system path of the service directory to bundle",
    '[default: "."]'
  ]
];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args }).options({
    stdout: {
      describe: `Write to stdout no matter what stdout is`,
      alias: "O",
      type: "boolean",
      default: false
    },
    outfile: {
      describe:
        "Write the zip bundle to this file. If omitted, bundle is written to stdout",
      alias: "o",
      type: "string"
    },
    force: {
      describe: `If ${bold(
        "--outfile"
      )} was specified, any existing file will be overwritten.`,
      alias: "f",
      type: "boolean",
      default: false
    },
    sloppy: {
      describe:
        "Continue even if no manifest file is present in the source directory",
      type: "boolean",
      default: false
    }
  });

exports.handler = async function handler(argv) {
  const source = unsplat(argv.source) || process.cwd();
  let out = unsplat(argv.outfile);
  if (!out) {
    if (!argv.stdout && process.stdout.isTTY) {
      fatal(il`
        Refusing to write binary data to stdout.
        Use ${bold("--stdout")} if you really want to do this.
      `);
    }
    out = process.stdout;
  } else if (argv.stdout) {
    fatal(il`
      Can't use both ${bold("--outfile")}
      and ${bold("--stdout")} at the same time.
    `);
  } else if (!argv.force) {
    const stats = await safeStat(out);
    if (stats) {
      fatal(`Outfile "${white(source)}" already exists.`);
    }
  }
  const stats = await safeStat(source);
  if (!stats) {
    fatal(`Source directory "${white(source)}" does not exist.`);
  } else if (!stats.isDirectory()) {
    fatal(`Source directory "${white(source)}" is not a directory.`);
  }
  if (!argv.sloppy && !await exists(resolve(source, "manifest.json"))) {
    fatal(il`
      Source directory "${white(source)}" does not contain a manifest file.
      Use ${bold("--sloppy")} if you want to skip this check.
    `);
  }
  try {
    await bundle(source, out);
  } catch (e) {
    fatal(e);
  }
};
