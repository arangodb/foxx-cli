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

const checkFile = (file, content) => {
  const filePath = path.resolve(tmpDir, file);
  expect(fs.existsSync(filePath)).to.equal(true);
  expect(fs.readFileSync(filePath, "utf-8").replace(/\r/g, "")).to.equal(
    content
  );
};

describe("Foxx service add test", () => {
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

  it("should create the test Javascript file", async () => {
    await foxx(`add test hello`);
    checkFile(
      "test/hello.js",
      "/*global describe, it, before, after, beforeEach, afterEach */\n'use strict';\nconst expect = require('chai').expect;\n\ndescribe('test suite', () => {\n  it('contains a test case', () => {\n    expect(true).not.to.equal(false);\n  });\n});\n"
    );
  });

  describe("with missing property tests in manifest.json", () => {
    const manifestPath = path.resolve(tmpDir, "manifest.json");

    beforeEach(async () => {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      manifest.tests = undefined;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    });

    it("should add tests pattern to manifest.json", async () => {
      let manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifest).to.not.have.property("tests");
      await foxx(`add test hello`);
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifest).to.have.property("tests", "test/**/*.js");
    });
  });
});
