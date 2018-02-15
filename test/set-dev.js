/* global describe, it, beforeEach, afterEach */
"use strict";

const path = require("path");
const Database = require("arangojs");
const expect = require("chai").expect;
const foxx = require("./util");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";

const mount = "/dev-test";
const basePath = path.resolve(".", "test", "fixtures");

describe("Foxx service development mode", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  beforeEach(async () => {
    await db.installService(
      mount,
      path.resolve(basePath, "minimal-working-service.zip")
    );
  });

  afterEach(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  it("should be activated", async () => {
    const infoBefore = await db.getService(mount);
    expect(infoBefore.development).to.equal(false);
    foxx(`set-dev ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(true);
  });

  it("should be activated via alias", async () => {
    const infoBefore = await db.getService(mount);
    expect(infoBefore.development).to.equal(false);
    foxx(`set-development ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(true);
  });

  it("should fail when mount is omitted", async () => {
    try {
      foxx(`set-dev /not${mount}`);
      expect.fail();
    } catch (e) {
      // noop
    }
  });

  it("should fail when mount is invalid", async () => {
    try {
      foxx("set-dev /dev/null");
      expect.fail();
    } catch (e) {
      // noop
    }
  });
});
