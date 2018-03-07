/* global describe, it, beforeEach */
"use strict";

const path = require("path");
const foxxUtil = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");
const rmDir = require("./fs").rmDir;

const tmpDir = path.resolve(os.tmpdir(), "foxx-ignore-test");
const ignoreFile = path.resolve(tmpDir, ".foxxignore");

const foxx = command => foxxUtil(command, false, { cwd: tmpDir });
const defaults = `.git/
.svn/
.hg/
*.swp
.DS_Store
`;

describe("Foxx ignore", () => {
  beforeEach(async () => {
    if (fs.existsSync(tmpDir)) {
      rmDir(tmpDir);
    }
    fs.mkdirSync(tmpDir);
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

  it("should be considered when creating a bundle", async () => {
    fs.writeFileSync(path.resolve(tmpDir, "test1"), "");
    fs.writeFileSync(path.resolve(tmpDir, "test2"), "");
    fs.writeFileSync(path.resolve(tmpDir, "manifest.json"), "{}");
    foxx("ignore test1");
    const tmpFile = path.resolve(tmpDir, "bundle.zip");
    foxx(`bundle --outfile ${tmpFile}`);
    await require("../src/util/fs").extract(tmpFile, {
      dir: path.resolve(tmpDir, "bundle")
    });
    expect(fs.existsSync(path.resolve(tmpDir, "bundle", "test1"))).to.equal(
      false
    );
    expect(fs.existsSync(path.resolve(tmpDir, "bundle", "test2"))).to.equal(
      true
    );
    expect(
      fs.existsSync(path.resolve(tmpDir, "bundle", ".foxxignore"))
    ).to.equal(true);
  });

  it("non-existing should be considered when creating a bundle", async () => {
    fs.mkdirSync(path.resolve(tmpDir, ".git"));
    fs.writeFileSync(path.resolve(tmpDir, ".git", "test"), "");
    fs.writeFileSync(path.resolve(tmpDir, "manifest.json"), "{}");
    const tmpFile = path.resolve(tmpDir, "bundle.zip");
    foxx(`bundle --outfile ${tmpFile}`);
    await require("../src/util/fs").extract(tmpFile, {
      dir: path.resolve(tmpDir, "bundle")
    });
    expect(fs.existsSync(path.resolve(tmpDir, "bundle", ".git"))).to.equal(
      false
    );
  });

  it("defaults should be considered when creating a bundle", async () => {
    fs.mkdirSync(path.resolve(tmpDir, ".git"));
    fs.writeFileSync(path.resolve(tmpDir, ".git", "test"), "");
    fs.writeFileSync(path.resolve(tmpDir, "manifest.json"), "{}");
    foxx("ignore");
    const tmpFile = path.resolve(tmpDir, "bundle.zip");
    foxx(`bundle --outfile ${tmpFile}`);
    await require("../src/util/fs").extract(tmpFile, {
      dir: path.resolve(tmpDir, "bundle")
    });
    expect(fs.existsSync(path.resolve(tmpDir, "bundle", ".git"))).to.equal(
      false
    );
  });

  it("empty should be considered when creating a bundle", async () => {
    fs.mkdirSync(path.resolve(tmpDir, ".git"));
    fs.writeFileSync(path.resolve(tmpDir, ".git", "test"), "");
    fs.writeFileSync(path.resolve(tmpDir, "manifest.json"), "{}");
    foxx("ignore -f");
    const tmpFile = path.resolve(tmpDir, "bundle.zip");
    foxx(`bundle --outfile ${tmpFile}`);
    await require("../src/util/fs").extract(tmpFile, {
      dir: path.resolve(tmpDir, "bundle")
    });
    expect(fs.existsSync(path.resolve(tmpDir, "bundle", ".git"))).to.equal(
      true
    );
  });
});
