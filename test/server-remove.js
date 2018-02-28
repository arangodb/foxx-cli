/* global describe, it, before, beforeEach, after */
"use strict";

const path = require("path");
const foxx = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");

const foxxRcFile = path.resolve(os.tmpdir(), ".foxxrc");

describe("Foxx server remove", () => {
  before(async () => {
    process.env.FOXXRC_PATH = foxxRcFile;
  });

  beforeEach(async () => {
    if (fs.existsSync(foxxRcFile)) {
      fs.unlinkSync(foxxRcFile);
    }
    foxx("server set test1 //localhost:8529");
    foxx("server set test2 //localhost:8530");
  });

  after(async () => {
    process.env.FOXXRC_PATH = undefined;
  });

  it("should show added server", async () => {
    foxx("server remove test1");
    const content1 = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content1).to.equal(
      "[server.test2]\r\nurl=http://localhost:8530\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
    foxx("server remove test2");
    const content2 = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content2).to.equal("");
  });

  it("via alias should show added server", async () => {
    foxx("remote rm test1");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test2]\r\nurl=http://localhost:8530\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("verbose should show added server with password", async () => {
    foxx("server remove test1 --verbose");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test2]\r\nurl=http://localhost:8530\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });

  it("verbose via alias should show added server with password", async () => {
    foxx("server remove test1 -v");
    const content = fs.readFileSync(foxxRcFile, "utf-8");
    expect(content).to.equal(
      "[server.test2]\r\nurl=http://localhost:8530\r\ndatabase=_system\r\nusername=root\r\npassword=\r\n"
    );
  });
});
