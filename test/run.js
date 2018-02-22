/* global describe, it, before, after */
"use strict";

const path = require("path");
const Database = require("arangojs");
const foxx = require("./util");
const expect = require("chai").expect;

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/run-test";
const basePath = path.resolve(".", "test", "fixtures");

describe.only("Foxx service run", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  before(async () => {
    await db.installService(mount, path.resolve(basePath, "echo-script.zip"));
  });

  after(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  it("should pass argv (empty object) to script and return exports", async () => {
    const resp = foxx(`run ${mount} echo {}`, true);
    expect(resp).to.eql([{}]);
  });

  it("should pass argv to script and return exports", async () => {
    const resp = foxx(`run ${mount} echo {\\"hello\\":\\"world\\"}`, true);
    expect(resp).to.eql([{ hello: "world" }]);
  });

  it("should treat array script argv like any other script argv", async () => {
    const resp = foxx(`run ${mount} echo [\\"yes\\",\\"please\\"]`, true);
    expect(resp).to.eql([["yes", "please"]]);
  });

  it("via alias should pass argv to script and return exports", async () => {
    const resp = foxx(`script ${mount} echo {}`, true);
    expect(resp).to.eql([{}]);
  });

  it("non-existing script should not be available", async () => {
    try {
      foxx(`run ${mount} no`);
      expect.fail();
    } catch (e) {
      // noop
    }
  });

  it("with alternative server URL should pass argv", async () => {
    const resp = foxx(`run ${mount} echo {} --server ${ARANGO_URL}`, true);
    expect(resp).to.eql([{}]);
  });

  it("with alternative server URL (short option) should pass argv", async () => {
    const resp = foxx(`run ${mount} echo {} -H ${ARANGO_URL}`, true);
    expect(resp).to.eql([{}]);
  });

  it("with alternative database should pass argv", async () => {
    const resp = foxx(`run ${mount} echo {} --database _system`, true);
    expect(resp).to.eql([{}]);
  });

  it("with alternative database (short option) should pass argv", async () => {
    const resp = foxx(`run ${mount} echo {} -D _system`, true);
    expect(resp).to.eql([{}]);
  });

  it("with alternative username should pass argv", async () => {
    const resp = foxx(
      `run ${mount} echo {} --username ${ARANGO_USERNAME}`,
      true
    );
    expect(resp).to.eql([{}]);
  });

  it("with alternative username should pass argv (short option)", async () => {
    const resp = foxx(`run ${mount} echo {} -u ${ARANGO_USERNAME}`, true);
    expect(resp).to.eql([{}]);
  });

  it("should fail when mount is invalid", async () => {
    try {
      foxx(`run /dev/null echo`);
      expect.fail();
    } catch (e) {
      // noop
    }
  });
});
