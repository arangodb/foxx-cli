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

describe("Foxx service add script", () => {
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

  it("should create the script file and add it to the manifest", async () => {
    await foxx(`add script hello`);
    checkFile(
      "scripts/hello.js",
      "'use strict';\nconst db = require('@arangodb').db;\nconst args = module.context.argv;\n\n// module.exports = \"script result\";\n"
    );
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve(tmpDir, "manifest.json"), "utf-8")
    );
    expect(manifest).to.have.property("scripts");
    expect(manifest.scripts).to.have.property("hello", "scripts/hello.js");
  });
});
