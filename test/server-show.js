/* global describe, it, before, after */
"use strict";

const path = require("path");
const foxx = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");

const foxxRcFile = path.resolve(os.tmpdir(), ".foxxrc");

describe("Foxx server show", () => {
  before(async () => {
    process.env.FOXXRC_PATH = foxxRcFile;
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
    const server1 = foxx("server show test1");
    expect(server1).to.equal(
      "URL: http://localhost:8529\nDatabase: _system\nUsername: root\nPassword: (hidden)\n"
    );
    const server2 = foxx("server show test2");
    expect(server2).to.equal(
      "URL: http://localhost:8530\nDatabase: _system\nUsername: root\nPassword: (hidden)\n"
    );
  });

  it("via alias should show added server", async () => {
    const server = foxx("remote info test1");
    expect(server).to.equal(
      "URL: http://localhost:8529\nDatabase: _system\nUsername: root\nPassword: (hidden)\n"
    );
  });

  it("verbose should show added server with password", async () => {
    const server = foxx("server show test1 --verbose");
    expect(server).to.equal(
      "URL: http://localhost:8529\nDatabase: _system\nUsername: root\nPassword: (empty)\n"
    );
  });

  it("verbose via alias should show added server with password", async () => {
    const server = foxx("server show test1 -v");
    expect(server).to.equal(
      "URL: http://localhost:8529\nDatabase: _system\nUsername: root\nPassword: (empty)\n"
    );
  });
});
