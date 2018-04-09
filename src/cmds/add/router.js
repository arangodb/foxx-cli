"use strict";
const { white } = require("chalk");
const { common } = require("../../util/cli");
const { fatal } = require("../../util/log");
const generator = require("../../generator");
const fs = require("../../util/fs");
const path = require("path");

const command = (exports.command = "router <name>");
exports.description = "Add a router";
const describe =
  'Creates a router file under "api/<name>.js" and adds it to the main JavaScript file of the service.';

const args = [["name", "Name of the router to add."]];

exports.builder = yargs =>
  common(yargs, { command, describe, args }).example(
    "$0 add router kittens",
    'Adds a router "kittens" to the local service'
  );

exports.handler = async function handler(argv) {
  const manifestPath = path.resolve(process.cwd(), "manifest.json");
  if (!await fs.exists(manifestPath)) {
    fatal("Current directory does not contain a manifest file.");
  }
  const routers = path.resolve(process.cwd(), "api");
  const router = path.resolve(routers, `${argv.name}.js`);
  if (await fs.exists(router)) {
    fatal(`Router "${white(router)}" already exists.`);
  }
  const manifest = JSON.parse(await fs.readFile(manifestPath));
  const mainPath = path.resolve(process.cwd(), manifest.main || "index.js");
  if (!await fs.exists(mainPath)) {
    await fs.writeFile(mainPath, await generator.generateIndex());
  }
  if (!await fs.exists(routers)) {
    await fs.mkdir(routers);
  }
  await fs.writeFile(router, await generator.generateRouter());
  const main = await fs.readFile(mainPath, "utf-8");
  const newMain = `${main.replace(/\n$/, "")}\nmodule.context.use('/${
    argv.name
  }', require('./api/${argv.name}'), '${argv.name}');\n`;
  await fs.writeFile(mainPath, newMain);
};
