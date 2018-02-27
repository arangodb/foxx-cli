/* global describe, it, before, beforeEach, after */
"use strict";

const path = require("path");
const foxx = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");

const foxxRcFile = path.resolve(os.tmpdir(), ".foxxrc");

describe.only("Foxx server set", () => {
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
    foxx("server set test //localhost:8529");
    expect(fs.existsSync(foxxRcFile)).to.equal(true);
  });

  it("should add server to rc file", async () => {
    foxx("server set test //localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=http://localhost:8529\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("via alias should add server to rc file", async () => {
    foxx("remote add test //localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=http://localhost:8529\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("should add http server to rc file", async () => {
    foxx("server set test http://localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=http://localhost:8529\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("should add https server to rc file", async () => {
    foxx("server set test https://localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=https://localhost:8529\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("should add tcp server to rc file", async () => {
    foxx("server set test tcp://localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=http://localhost:8529\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("should add ssl server to rc file", async () => {
    foxx("server set test ssl://localhost:8529");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=https://localhost:8529\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("executed two time should add both server to rc file", async () => {
    foxx("server set test1 //localhost:8529");
    foxx("server set test2 //localhost:8530");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test1]\r\nurl=http://localhost:8529\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n\r\n[server.test2]\r\nurl=http://localhost:8530\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("should add server with alternative database to rc file", async () => {
    foxx("server set test //localhost:8529 --database test");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=http://localhost:8529\r\ndatabase=test\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("should add server with alternative database to rc file using alias", async () => {
    foxx("server set test //localhost:8529 -D test");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=http://localhost:8529\r\ndatabase=test\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("should add server with alternative username to rc file", async () => {
    foxx("server set test //localhost:8529 --username test");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=http://localhost:8529\r\ndatabase=_system\r\nusername=test\r\npassword=\r\n"
    );
  });

  it("should add server with alternative uesrname to rc file using alias", async () => {
    foxx("server set test //localhost:8529 -u test");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test]\r\nurl=http://localhost:8529\r\ndatabase=_system\r\nusername=test\r\npassword=\r\n"
    );
  });
});
