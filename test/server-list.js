/* global describe, it, before, after */
"use strict";

const path = require("path");
const foxx = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");

const foxxRcFile = path.resolve(os.tmpdir(), ".foxxrc");

describe("Foxx server list", () => {
  before(async () => {
    process.env.FOXXRC_PATH = foxxRcFile;
    if (fs.existsSync(foxxRcFile)) {
      fs.unlinkSync(foxxRcFile);
      foxx("server set test1 //localhost:8529");
      foxx("server set test2 //localhost:8530");
    }
  });

  after(async () => {
    process.env.FOXXRC_PATH = undefined;
  });

  it("should include added server", async () => {
    const server = foxx("server list");
    expect(server).to.equal("test1\ntest2\n");
  });

  it("via alias should include added server", async () => {
    const server = foxx("remote ls");
    expect(server).to.equal("test1\ntest2\n");
  });

  it("verbose should include added server with URLs", async () => {
    const server = foxx("server list --verbose");
    expect(server).to.equal(
      "  test1  http://localhost:8529\n  test2  http://localhost:8530\n"
    );
  });

  it("verbose via alias should include added server with URLs", async () => {
    const server = foxx("server list -v");
    expect(server).to.equal(
      "  test1  http://localhost:8529\n  test2  http://localhost:8530\n"
    );
  });
});
