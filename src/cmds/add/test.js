"use strict";
const { white } = require("chalk");
const { common } = require("../../util/cli");
const { fatal } = require("../../util/log");
const { generateTest } = require("../../generator");
const fs = require("../../util/fs");
const path = require("path");

const command = (exports.command = "test <name>");
exports.detestion = "Add a test";
const describe =
  'Creates a test file under "tests/<name>.js" and adds the pattern "test/**/*.js" to the manifest.json if its property "test" is undefinied.';

const args = [["name", "Name of the test to add."]];

exports.builder = yargs =>
  common(yargs, { command, describe, args }).example(
    "$0 add test example",
    'Adds a test "example" to the local service'
  );

exports.handler = async function handler(argv) {
  const manifestPath = path.resolve(process.cwd(), "manifest.json");
  if (!await fs.exists(manifestPath)) {
    fatal("Current directory does not contain a manifest file.");
  }
  const tests = path.resolve(process.cwd(), "test");
  if (!await fs.exists(tests)) {
    await fs.mkdir(tests);
  }
  const test = path.resolve(tests, `${argv.name}.js`);
  if (await fs.exists(test)) {
    fatal(`Test "${white(test)}" already exists.`);
  }
  await fs.writeFile(test, await generateTest());
  const manifest = JSON.parse(await fs.readFile(manifestPath));
  if (!manifest.tests) {
    manifest.tests = "test/**/*.js";
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }
};
