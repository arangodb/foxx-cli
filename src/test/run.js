/* global describe, it, before, after */
"use strict";

const path = require("path");
const Database = require("arangojs");
const foxx = require("./util");
const expect = require("chai").expect;
const fs = require("fs");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/run-test";
const basePath = path.resolve(__dirname, "..", "..", "fixtures");

describe("Foxx service run", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  before(async () => {
    await db.installService(
      mount,
      fs.readFileSync(path.resolve(basePath, "echo-script.zip"))
    );
  });

  after(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  it("should pass argv (empty object) to script and return exports", async () => {
    const resp = await foxx(`run ${mount} echo {}`);
    expect(JSON.parse(resp)).to.eql([{}]);
  });

  it("should pass argv to script and return exports", async () => {
    const resp = await foxx(`run ${mount} echo {"hello":"world"}`);
    expect(JSON.parse(resp)).to.eql([{ hello: "world" }]);
  });

  it("should treat array script argv like any other script argv", async () => {
    const resp = await foxx(`run ${mount} echo ["yes","please"]`);
    expect(JSON.parse(resp)).to.eql([["yes", "please"]]);
  });

  it("via alias should pass argv to script and return exports", async () => {
    const resp = await foxx(`script ${mount} echo {}`);
    expect(JSON.parse(resp)).to.eql([{}]);
  });

  it("non-existing script should not be available", async () => {
    try {
      await foxx(`run ${mount} no`);
    } catch (e) {
      return;
    }
    expect.fail();
  });

  it("with alternative server URL should pass argv", async () => {
    const resp = await foxx(`run ${mount} echo {} --server ${ARANGO_URL}`);
    expect(JSON.parse(resp)).to.eql([{}]);
  });

  it("with alternative server URL (short option) should pass argv", async () => {
    const resp = await foxx(`run ${mount} echo {} -H ${ARANGO_URL}`);
    expect(JSON.parse(resp)).to.eql([{}]);
  });

  it("with alternative database should pass argv", async () => {
    const resp = await foxx(`run ${mount} echo {} --database _system`);
    expect(JSON.parse(resp)).to.eql([{}]);
  });

  it("with alternative database (short option) should pass argv", async () => {
    const resp = await foxx(`run ${mount} echo {} -D _system`);
    expect(JSON.parse(resp)).to.eql([{}]);
  });

  it("with alternative username should pass argv", async () => {
    const resp = await foxx(
      `run ${mount} echo {} --username ${ARANGO_USERNAME}`
    );
    expect(JSON.parse(resp)).to.eql([{}]);
  });

  it("with alternative username should pass argv (short option)", async () => {
    const resp = await foxx(`run ${mount} echo {} -u ${ARANGO_USERNAME}`);
    expect(JSON.parse(resp)).to.eql([{}]);
  });

  describe("with a password file", () => {
    const user = "testuser";
    before(async () => {
      db.route("/_api/user").post({
        user,
        passwd: "1234" // from fixtures/passwordFile
      });
      db.route(`/_api/user/${user}/database/_system`).put({ grant: "rw" });
    });
    after(async () => {
      try {
        db.route(`/_api/user/${user}`).delete();
      } catch (e) {
        // noop
      }
    });
    it("should pass argv", async () => {
      const passwordFilePath = path.resolve(basePath, "passwordFile");
      const resp = await foxx(
        `run ${mount} echo {} --username ${user} --passwordFile ${passwordFilePath}`
      );
      expect(JSON.parse(resp)).to.eql([{}]);
    });
  });

  it("should fail when mount is invalid", async () => {
    try {
      await foxx(`run /dev/null echo`);
    } catch (e) {
      return;
    }
    expect.fail();
  });

  it("should pass argv to script via stdin and return exports", async () => {
    const input = '{"hello":"world"}';
    const resp = await foxx(`run ${mount} echo @`, false, { input });
    expect(JSON.parse(resp)).to.eql([{ hello: "world" }]);
  });
});
