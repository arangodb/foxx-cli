/* global describe, it, beforeEach, afterEach */
"use strict";

const path = require("path");
const Database = require("arangojs");
const expect = require("chai").expect;
const foxx = require("./util");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";

const mount = "/prod-test";
const basePath = path.resolve(".", "test", "fixtures");

describe.only("Foxx service production mode", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  beforeEach(async () => {
    await db.installService(
      mount,
      path.resolve(basePath, "minimal-working-service.zip")
    );
    await db.enableServiceDevelopmentMode(mount);
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
    expect(infoBefore.development).to.equal(true);
    foxx(`set-prod ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(false);
  });

  it("should be activated via alias", async () => {
    const infoBefore = await db.getService(mount);
    expect(infoBefore.development).to.equal(true);
    foxx(`set-production ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(false);
  });

  it("should fail when mount is omitted", async () => {
    try {
      foxx(`set-prod /not${mount}`);
      expect.fail();
    } catch (e) {
      // noop
    }
  });

  it("should fail when mount is invalid", async () => {
    try {
      foxx("set-prod /dev/null");
      expect.fail();
    } catch (e) {
      // noop
    }
  });
});
