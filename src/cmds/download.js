"use strict";
const { bold, white } = require("chalk");
const { common, serverArgs } = require("../util/cli");
const { createWriteStream, existsSync } = require("fs");
const { fatal, info } = require("../util/log");
const { exists, readdir, safeStat } = require("../util/fs");

const client = require("../util/client");
const { extractBuffer } = require("../util/zip");
const { inline: il } = require("../util/text");
const { resolve } = require("path");
const resolveServer = require("../resolveServer");
const { unsplat } = require("../util/array");

const command = (exports.command = "download <mount>");
exports.description = "Download a mounted service";
const aliases = (exports.aliases = ["dl"]);

const describe = il`Downloads a zip bundle of the service directory.

When development mode is enabled, this always creates a new bundle. Otherwise the bundle will represent the version of a service that is installed on that ArangoDB instance.`;

const args = [["mount", "Mount path of the service"]];

exports.builder = yargs =>
  common(yargs, { command, aliases, describe, args })
    .options({
      ...serverArgs,
      stdout: {
        describe: `Write to stdout no matter what stdout is`,
        alias: "O",
        type: "boolean",
        default: false
      },
      outfile: {
        describe:
          "Write or extract the bundle to this path. If omitted, bundle will be written to stdout or extracted to the current working directory",
        alias: "o",
        type: "string"
      },
      extract: {
        describe: "Extract zip bundle instead of just downloading it",
        alias: "x",
        type: "boolean",
        default: false
      },
      force: {
        describe: `If ${bold("--outfile")} and/or ${bold(
          "--extract"
        )} were specified, any existing files will be overwritten.`,
        alias: "f",
        type: "boolean",
        default: false
      }
    })
    .example(
      "$0 download /hello",
      'Downloads the Foxx service mounted at the URL "/hello" and writes the bundle to stdout'
    )
    .example(
      "$0 download -x /hello",
      "Extracts the bundle to the current directory"
    )
    .example(
      "$0 download /hello -o hello.zip ",
      'Writes the bundle to the file "hello.zip"'
    )
    .example(
      "$0 download -f /hello -o hello.zip ",
      'Writes the bundle to "hello.zip" even if that file already exists'
    )
    .example(
      "$0 download -x /hello -o /tmp/hello",
      'Extracts the bundle to the directory "/tmp/hello"'
    )
    .example(
      "$0 download -xf /hello -o /tmp/hello",
      "Extracts the bundle and overwrites any existing files"
    );

exports.handler = async function handler(argv) {
  argv.outfile = unsplat(argv.outfile);
  let out, outdir;
  if (!argv.outfile) {
    if (!argv.extract) {
      if (!argv.stdout && process.stdout.isTTY) {
        fatal(il`
          Refusing to write binary data to stdout.
          Use ${bold("--stdout")} if you really want to do this.
        `);
      }
      out = process.stdout;
    } else if (argv.stdout) {
      fatal(il`
        Can't use both ${bold("--extract")}
        and ${bold("--stdout")} at the same time.
      `);
    } else {
      outdir = process.cwd();
    }
  } else if (argv.stdout) {
    fatal(il`
      Can't use both ${bold("--outfile")}
      and ${bold("--stdout")} at the same time.
    `);
  } else if (argv.extract) {
    outdir = resolve(argv.outfile);
    const stats = await safeStat(outdir);
    if (stats) {
      if (!stats.isDirectory()) {
        fatal(`Can't extract to "${white(argv.outfile)}": not a directory.`);
      }
      if (!argv.force && (await readdir(outdir)).length) {
        fatal(il`
          Refusing to extract to non-empty directory "${white(argv.outfile)}".
          Use ${bold("--force")} to overwrite existing files.
        `);
      }
    }
  } else {
    if (!argv.force && (await exists(argv.outfile))) {
      fatal(il`
        Refusing to overwrite existing file "${white(argv.outfile)}".
        Use ${bold("--force")} to overwrite existing file.
      `);
    }
    out = createWriteStream(argv.outfile);
  }
  try {
    const server = await resolveServer(argv);
    const db = client(server);
    const bundle = await db.downloadService(argv.mount);
    if (!argv.extract) {
      out.write(bundle);
      if (out !== process.stdout) {
        out.end();
        if (argv.verbose) {
          info(`Created "${argv.outfile}".`);
        }
      }
    } else {
      await extractBuffer(bundle, {
        dir: outdir,
        onEntry(entry) {
          if (existsSync(resolve(outdir, entry.fileName))) {
            info(`Overwriting "${entry.fileName}" …`);
          } else if (argv.verbose) {
            info(`Creating "${entry.fileName}" …`);
          }
        }
      });
      if (argv.verbose) {
        info("Done.");
      }
    }
  } catch (e) {
    fatal(e);
  }
};
