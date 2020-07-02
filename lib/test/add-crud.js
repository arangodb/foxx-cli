/* global describe, it, beforeEach */
"use strict";

const path = require("path");
const foxxUtil = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");
const rmDir = require("./fs").rmDir;
const tmpDir = path.resolve(os.tmpdir(), "test-init-service");
const foxx = (command) => foxxUtil(command, false, { cwd: tmpDir });

const checkFileEqual = (file, content) => {
  const filePath = path.resolve(tmpDir, file);
  expect(fs.existsSync(filePath)).to.equal(true);
  expect(fs.readFileSync(filePath, "utf-8").replace(/\r/g, "")).to.equal(
    content
  );
};

const checkFileContains = (file, content) => {
  const filePath = path.resolve(tmpDir, file);
  expect(fs.existsSync(filePath)).to.equal(true);
  expect(fs.readFileSync(filePath, "utf-8").replace(/\r/g, "")).contains(
    content
  );
};

describe("Foxx service add crud", () => {
  beforeEach(async () => {
    if (fs.existsSync(tmpDir)) {
      try {
        rmDir(tmpDir);
      } catch (e) {
        // noop
      }
    }
    await foxxUtil(`init ${tmpDir}`);
  });

  it("should create the route file and add it to the index.js", async () => {
    await foxx(`add crud hello`);
    expect(fs.existsSync(path.resolve(tmpDir, "api", "hello.js")));
    checkFileEqual(
      "index.js",
      "'use strict';\n\nmodule.context.use('/hello', require('./api/hello'), 'hello');\n"
    );
  });

  it("should use module.context.collection in router", async () => {
    await foxx(`add crud hello`);
    checkFileContains("api/hello.js", "module.context.collection");
  });

  it("with option unprefixed should use db._collection in router", async () => {
    await foxx(`add crud hello --unprefixed`);
    checkFileContains("api/hello.js", "const db = require('@arangodb').db;");
    checkFileContains("api/hello.js", "db._collection");
  });

  it("with option unprefixed (alias) should use db._collection in router", async () => {
    await foxx(`add crud hello -u`);
    checkFileContains("api/hello.js", "const db = require('@arangodb').db;");
    checkFileContains("api/hello.js", "db._collection");
  });

  it("with option edge should use edge schema in router", async () => {
    await foxx(`add crud hello --edge`);
    checkFileContains("api/hello.js", "_from: joi.string()");
    checkFileContains("api/hello.js", "_to: joi.string()");
  });

  it("with option edge (alias) should use edge schema in router", async () => {
    await foxx(`add crud hello -e`);
    checkFileContains("api/hello.js", "_from: joi.string()");
    checkFileContains("api/hello.js", "_to: joi.string()");
  });
});
