"use strict";
const { white } = require("chalk");
const { common } = require("../../util/cli");
const { fatal } = require("../../util/log");
const { generateScript } = require("../../generator");
const fs = require("../../util/fs");
const path = require("path");

const command = (exports.command = "script <name>");
exports.description = "Add a script";
const describe =
  'Creates a script file under "scripts/<name>.js" and adds it to the manifest.json.';

const args = [["name", "Name of the script to add."]];

exports.builder = (yargs) =>
  common(yargs, { command, describe, args }).example(
    "$0 add script send-email",
    'Adds a script "send-email" to the local service'
  );

exports.handler = async function handler(argv) {
  const manifestPath = path.resolve(process.cwd(), "manifest.json");
  if (!(await fs.exists(manifestPath))) {
    fatal("Current directory does not contain a manifest file.");
  }
  const scripts = path.resolve(process.cwd(), "scripts");
  if (!(await fs.exists(scripts))) {
    await fs.mkdir(scripts);
  }
  const script = path.resolve(scripts, `${argv.name}.js`);
  if (await fs.exists(script)) {
    fatal(`Script "${white(script)}" already exists.`);
  }
  await fs.writeFile(script, await generateScript());
  const manifest = JSON.parse(await fs.readFile(manifestPath));
  if (!manifest.scripts) manifest.scripts = {};
  manifest.scripts[argv.name] = `scripts/${argv.name}.js`;
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
};
