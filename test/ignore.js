/* global describe, it, beforeEach */
"use strict";

const path = require("path");
const foxxUtil = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");

const tmpDir = path.resolve(os.tmpdir(), "foxx-ignore-test");
const ignoreFile = path.resolve(tmpDir, ".foxxignore");

const foxx = command => foxxUtil(command, false, tmpDir);
const defaults = `.git/
.svn/
.hg/
*.swp
.DS_Store
`;

describe("Foxx service ignore", () => {
  beforeEach(async () => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }
    if (fs.existsSync(ignoreFile)) {
      fs.unlinkSync(ignoreFile);
    }
  });

  it("without params should create default ignore file", async () => {
    foxx("ignore");
    expect(fs.existsSync(ignoreFile)).to.equal(true);
    expect(fs.readFileSync(ignoreFile, "utf-8")).to.equal(defaults);
  });

  it("via alias without params should create default ignore file", async () => {
    foxx("exclude");
    expect(fs.existsSync(ignoreFile)).to.equal(true);
    expect(fs.readFileSync(ignoreFile, "utf-8")).to.equal(defaults);
  });

  it("with param first time called should create ignore file", async () => {
    foxx("ignore test");
    expect(fs.existsSync(ignoreFile)).to.equal(true);
    const content = fs.readFileSync(ignoreFile, "utf-8");
    expect(content).to.have.string(defaults);
    expect(content).to.have.string("test");
  });

  it("via alias with param first time called should create ignore file", async () => {
    foxx("exclude test");
    expect(fs.existsSync(ignoreFile)).to.equal(true);
    const content = fs.readFileSync(ignoreFile, "utf-8");
    expect(content).to.have.string(defaults);
    expect(content).to.have.string("test");
  });

  it("called with multiple params should include every param", async () => {
    foxx("ignore test1 test2");
    const content = fs.readFileSync(ignoreFile, "utf-8");
    expect(content).to.have.string(defaults);
    expect(content).to.have.string("test1");
    expect(content).to.have.string("test2");
  });

  it("called a second time should not overwrite previous pattern", async () => {
    foxx("ignore test1");
    foxx("ignore test2");
    const content = fs.readFileSync(ignoreFile, "utf-8");
    expect(content).to.have.string(defaults);
    expect(content).to.have.string("test1");
    expect(content).to.have.string("test2");
  });

  it("with option force should overwrite defaults", async () => {
    foxx("ignore test1 test2 --force");
    const content = fs.readFileSync(ignoreFile, "utf-8");
    expect(content).to.not.have.string(defaults);
    expect(content).to.have.string("test1");
    expect(content).to.have.string("test2");
  });

  it("with option force should overwrite previous pattern", async () => {
    foxx("ignore test1");
    foxx("ignore test2 --force");
    const content = fs.readFileSync(ignoreFile, "utf-8");
    expect(content).to.not.have.string(defaults);
    expect(content).to.not.have.string("test1");
    expect(content).to.have.string("test2");
  });
});
