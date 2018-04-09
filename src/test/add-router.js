/* global describe, it, beforeEach */
"use strict";

const path = require("path");
const foxxUtil = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");
const rmDir = require("./fs").rmDir;
const tmpDir = path.resolve(os.tmpdir(), "test-init-service");
const foxx = command => foxxUtil(command, false, { cwd: tmpDir });

const checkFile = (file, content) => {
  const filePath = path.resolve(tmpDir, file);
  expect(fs.existsSync(filePath)).to.equal(true);
  expect(fs.readFileSync(filePath, "utf-8").replace(/\r/g, "")).to.equal(
    content
  );
};

describe("Foxx service add router", () => {
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
    await foxx(`add router hello`);
    expect(fs.existsSync(path.resolve(tmpDir, "api", "hello.js")));
    checkFile(
      "index.js",
      "'use strict';\n\nmodule.context.use('/hello', require('./api/hello'), 'hello');\n"
    );
  });
});
