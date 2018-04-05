import { generate } from "rxjs/observable/generate";

("use strict");
const { render } = require("ejs");
const { join } = require("path");
const { readFileSync } = require("fs");
const I = require("i");

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

  if (options.generateSetup || options.generateTeardown) {
    manifest.scripts = {};
    if (options.generateSetup) manifest.scripts.setup = "setup.js";
    if (options.generateTeardown) manifest.scripts.teardown = "teardown.js";
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
  let license = JSON.parse(
    readFileSync(path, "utf-8")
  ).standardLicenseTemplate.replace("[yyyy]", new Date().getFullYear());
  if (options.authorName) {
    license = license.replace("[name of copyright owner]", options.authorName);
  }
  return license;
}

module.exports = async function generateFiles(options) {
  const inflect = I();
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
  if (options.generateExampleRouters) {
    const collections = [];
    for (const collection of options.documentCollections) {
      collections.push([collection, false]);
    }
    for (const collection of options.edgeCollections) {
      collections.push([collection, true]);
    }
    for (const [collection, isEdgeCollection] of collections) {
      let singular = inflect.singularize(collection);
      if (singular === collection) singular += "Item";
      let plural = inflect.pluralize(singular);
      if (plural === singular) plural = collection;
      files.push({
        name: `api/${collection}.js`,
        content: await generateFile("router.js", {
          collection,
          isEdgeCollection,
          singular,
          plural
        })
      });
    }
    if (options.generateSetup) {
      files.push({
        name: "setup.js",
        content: await generateFile("setup.js", options)
      });
    }
    if (options.generateTeardown) {
      files.push({
        name: "teardown.js",
        content: await generateFile("teardown.js", options)
      });
    }
  }
  return files;
};
