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
exports.description = "Create a service bundle for a service";
const aliases = (exports.aliases = ["zip"]);

const describe =
  "Creates a zip bundle of a service located on the local filesystem.";

const args = [
  [
    "source",
    "File system path of the service directory to bundle",
    '[default: "."]',
  ],
];

exports.builder = (yargs) =>
  common(yargs, { command, aliases, describe, args })
    .options({
      stdout: {
        describe: `Write to stdout no matter what stdout is`,
        alias: "O",
        type: "boolean",
        default: false,
      },
      outfile: {
        describe:
          "Write the zip bundle to this file. If omitted, bundle is written to stdout",
        alias: "o",
        type: "string",
      },
      force: {
        describe: `If ${bold(
          "--outfile"
        )} was specified, any existing file will be overwritten.`,
        alias: "f",
        type: "boolean",
        default: false,
      },
      sloppy: {
        describe:
          "Continue even if no manifest file is present in the source directory",
        type: "boolean",
        default: false,
      },
    })
    .example(
      "$0 bundle",
      "Creates a bundle of the current directory and writes it to stdout"
    )
    .example(
      "$0 bundle /tmp/service",
      "Creates a bundle of the given service directory"
    )
    .example("$0 bundle -O", "Writes to stdout even if stdout is a TTY")
    .example(
      "$0 bundle -o /tmp/bundle.zip",
      "Writes the bundle to the given file path"
    )
    .example(
      "$0 bundle -f -o /tmp/bundle.zip",
      "Overwrites the bundle if it already exists"
    )
    .example(
      "$0 bundle --sloppy",
      "Creates the bundle even if service manifest is missing"
    );

exports.handler = async function handler(argv) {
  try {
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
        fatal(il`
          Outfile "${white(out)}" already exists.
          Use ${bold("--force")} to overwrite existing file.
        `);
      }
    }
    const stats = await safeStat(source);
    if (!stats) {
      fatal(`Source directory "${white(source)}" does not exist.`);
    } else if (!stats.isDirectory()) {
      fatal(`Source directory "${white(source)}" is not a directory.`);
    }
    if (!argv.sloppy) {
      let path = resolve(source, "manifest.json");
      if (!(await exists(path))) {
        fatal(il`
          Source directory "${white(source)}" does not contain a manifest file.
          Use ${bold("--sloppy")} if you want to skip this check.
        `);
      }
    }
    await bundle(source, out);
  } catch (e) {
    fatal(e);
  }
};
