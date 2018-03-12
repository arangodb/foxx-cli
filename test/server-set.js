/* global describe, it, before, beforeEach, after */
"use strict";

const path = require("path");
const foxx = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");

const foxxRcFile = path.resolve(os.tmpdir(), ".foxxrc");

describe("Foxx server set", () => {
  before(async () => {
    process.env.FOXXRC_PATH = foxxRcFile;
  });

  after(async () => {
    process.env.FOXXRC_PATH = undefined;
  });

  beforeEach(async () => {
    if (fs.existsSync(foxxRcFile)) {
      fs.unlinkSync(foxxRcFile);
    }
  });

  it("first executed should create rc file", async () => {
    await foxx("server set test //localhost:8529");
    expect(fs.existsSync(foxxRcFile)).to.equal(true);
  });

  it("should add server to rc file", async () => {
    await foxx("server set test //localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=http://localhost:8529\ndatabase=_system\nusername=root\npassword=\n"
    );
  });

  it("via alias should add server to rc file", async () => {
    await foxx("remote add test //localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=http://localhost:8529\ndatabase=_system\nusername=root\npassword=\n"
    );
  });

  it("should add http server to rc file", async () => {
    await foxx("server set test http://localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=http://localhost:8529\ndatabase=_system\nusername=root\npassword=\n"
    );
  });

  it("should add https server to rc file", async () => {
    await foxx("server set test https://localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=https://localhost:8529\ndatabase=_system\nusername=root\npassword=\n"
    );
  });

  it("should add tcp server to rc file", async () => {
    await foxx("server set test tcp://localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=http://localhost:8529\ndatabase=_system\nusername=root\npassword=\n"
    );
  });

  it("should add ssl server to rc file", async () => {
    await foxx("server set test ssl://localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=https://localhost:8529\ndatabase=_system\nusername=root\npassword=\n"
    );
  });

  it("executed two time should add both server to rc file", async () => {
    await foxx("server set test1 //localhost:8529");
    await foxx("server set test2 //localhost:8530");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test1]\nurl=http://localhost:8529\ndatabase=_system\nusername=root\npassword=\n\n[server.test2]\nurl=http://localhost:8530\ndatabase=_system\nusername=root\npassword=\n"
    );
  });

  it("should add server with alternative database to rc file", async () => {
    await foxx("server set test //localhost:8529 --database test");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=http://localhost:8529\ndatabase=test\nusername=root\npassword=\n"
    );
  });

  it("should add server with alternative database to rc file using alias", async () => {
    await foxx("server set test //localhost:8529 -D test");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=http://localhost:8529\ndatabase=test\nusername=root\npassword=\n"
    );
  });

  it("should add server with alternative username to rc file", async () => {
    await foxx("server set test //localhost:8529 --username test");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=http://localhost:8529\ndatabase=_system\nusername=test\npassword=\n"
    );
  });

  it("should add server with alternative uesrname to rc file using alias", async () => {
    await foxx("server set test //localhost:8529 -u test");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content.replace(/\r\n/g, "\n")).to.equal(
      "[server.test]\nurl=http://localhost:8529\ndatabase=_system\nusername=test\npassword=\n"
    );
  });

  it("should fail when server URL is not valid", async () => {
    try {
      await foxx("server set test not-valid");
    } catch (e) {
      expect(fs.existsSync(foxxRcFile)).to.equal(false);
      return;
    }
    expect.fail();
  });
});
