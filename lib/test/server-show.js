/* global describe, it, before */
"use strict";

const path = require("path");
const foxx = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");

const foxxRcFile = path.resolve(os.tmpdir(), ".foxxrc");

describe("Foxx server show", () => {
  before(async () => {
    if (fs.existsSync(foxxRcFile)) {
      fs.unlinkSync(foxxRcFile);
    }
    await foxx("server set test1 //localhost:8529");
    await foxx("server set test2 //localhost:8530");
  });

  it("should show added server", async () => {
    const server1 = await foxx("server show test1");
    expect(server1).to.equal(
      "URL: http://localhost:8529\nDatabase: _system\nUsername: root\nPassword: (hidden)\n"
    );
    const server2 = await foxx("server show test2");
    expect(server2).to.equal(
      "URL: http://localhost:8530\nDatabase: _system\nUsername: root\nPassword: (hidden)\n"
    );
  });

  it("via alias should show added server", async () => {
    const server = await foxx("remote info test1");
    expect(server).to.equal(
      "URL: http://localhost:8529\nDatabase: _system\nUsername: root\nPassword: (hidden)\n"
    );
  });

  it("verbose should show added server with password", async () => {
    const server = await foxx("server show test1 --verbose");
    expect(server).to.equal(
      "URL: http://localhost:8529\nDatabase: _system\nUsername: root\nPassword: (empty)\n"
    );
  });

  it("verbose via alias should show added server with password", async () => {
    const server = await foxx("server show test1 -v");
    expect(server).to.equal(
      "URL: http://localhost:8529\nDatabase: _system\nUsername: root\nPassword: (empty)\n"
    );
  });
});
