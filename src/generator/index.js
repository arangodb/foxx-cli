"use strict";
const { render } = require("ejs");
const { join } = require("path");
const { readFileSync } = require("fs");
const inflect = require("i")();

const TEMPLATE_PATH = join(__dirname, "..", "..", "templates");

function generateManifest(options) {
  const manifest = {
    main: options.mainFile,
    engines: {
      arangodb: options.engineVersion
    }
  };

  if (options.name) manifest.name = options.name;
  if (options.version) manifest.version = options.version;
  if (options.license) manifest.license = options.license;
  if (options.authorEmail) {
    manifest.author = `${options.authorName} <${options.authorEmail}>`;
  } else if (options.authorName) manifest.author = options.authorName;

  if (options.description) manifest.description = options.description;
  if (options.configuration) manifest.configuration = options.configuration;
  if (options.dependencies) manifest.dependencies = options.dependencies;
  if (options.provides) manifest.provides = options.provides;

  if (
    (options.documentCollections && options.documentCollections.length) ||
    (options.edgeCollections && options.edgeCollections.length)
  ) {
    manifest.scripts = {};
    manifest.scripts.setup = "scripts/setup.js";
    manifest.scripts.teardown = "scripts/teardown.js";
  }

  return JSON.stringify(manifest, null, 2);
}

async function generateFile(name, data) {
  const template = readFileSync(join(TEMPLATE_PATH, `${name}.ejs`), "utf-8");
  return render(template, data);
}

async function generateLicense(options) {
  if (!options.license) return generateFile("LICENSE", options);
  const path = require.resolve(
    `spdx-license-list/licenses/${options.license}.json`
  );
  return JSON.parse(readFileSync(path, "utf-8")).standardLicenseTemplate;
}

exports.generateFiles = async options => {
  const files = [];
  files.push({
    name: "manifest.json",
    content: generateManifest(options)
  });
  files.push({
    name: "index.js",
    content: await generateFile(
      options.example ? "example/index.js" : "index.js",
      options
    )
  });
  files.push({
    name: "README.md",
    content: await generateFile("README.md", options)
  });
  if (options.license) {
    files.push({
      name: "LICENSE",
      content: await generateLicense(options)
    });
  }
  const collections = [];
  if (options.documentCollections) {
    for (const collection of options.documentCollections) {
      collections.push([collection, false]);
    }
  }
  if (options.edgeCollections) {
    for (const collection of options.edgeCollections) {
      collections.push([collection, true]);
    }
  }
  if (options.generateCrudRoutes) {
    for (const [collection, isEdgeCollection] of collections) {
      files.push({
        name: `api/${collection}.js`,
        content: await exports.generateCrud(collection, isEdgeCollection)
      });
    }
  }
  if (collections.length) {
    files.push({
      name: "scripts/setup.js",
      content: await generateFile("setup.js", options)
    });
    files.push({
      name: "scripts/teardown.js",
      content: await generateFile("teardown.js", options)
    });
  }

  return files;
};

exports.generateCrud = async (
  collection,
  isEdgeCollection,
  prefixed = true
) => {
  let singular = inflect.singularize(collection);
  if (singular === collection) singular += "Item";
  let plural = inflect.pluralize(singular);
  if (plural === singular) plural = collection;
  return await generateFile("crud.js", {
    collection,
    isEdgeCollection,
    singular,
    plural,
    prefixed
  });
};

exports.generateScript = async () => await generateFile("script.js", {});

exports.generateRouter = async () => await generateFile("router.js", {});

exports.generateIndex = async () => await generateFile("index.js", {});
