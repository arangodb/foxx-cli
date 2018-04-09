"use strict";
const { common } = require("../../util/cli");
const { fatal } = require("../../util/log");
const generator = require("../../generator");
const fs = require("../../util/fs");
const path = require("path");

const command = (exports.command = "crud <collection>");
exports.description = "Add a CRUD router";
const describe =
  'Creates a router file with CRUD operations for the given collection under "api/<collection>.js" and adds it to the index.js.';

const args = [
  ["collection", "Name of the collection for the CRUD operations to be added."]
];

exports.builder = yargs =>
  common(yargs, { command, describe, args })
    .options({
      edge: {
        describe: "",
        alias: "e",
        type: "boolean",
        default: false
      },
      unprefixed: {
        describe: "",
        alias: "u",
        type: "boolean",
        default: false
      }
    })
    .example(
      "$0 add crud kittens",
      'Adds a CRUD router "kittens" to the local service'
    );

exports.handler = async function handler(argv) {
  const manifestPath = path.resolve(process.cwd(), "manifest.json");
  if (!await fs.exists(manifestPath)) {
    fatal("manifest.json does not exist.");
  }
  const cruds = path.resolve(process.cwd(), "api");
  const crud = path.resolve(cruds, `${argv.collection}.js`);
  if (await fs.exists(crud)) {
    fatal(`router '${crud}' already exists.`);
  }
  const manifest = JSON.parse(await fs.readFile(manifestPath));
  const mainPath = path.resolve(process.cwd(), manifest.main || "index.js");
  if (!await fs.exists(mainPath)) {
    await fs.writeFile(mainPath, await generator.generateIndex());
  }
  if (!await fs.exists(cruds)) {
    await fs.mkdir(cruds);
  }
  await fs.writeFile(
    crud,
    await generator.generateCrud(argv.collection, argv.edge, !argv.unprefixed)
  );
  const main = await fs.readFile(mainPath, "utf-8");
  const newMain = `${main.replace(/\n$/, "")}\nmodule.context.use('/${
    argv.collection
  }', require('./api/${argv.collection}'), '${argv.collection}');\n`;
  await fs.writeFile(mainPath, newMain);
};
