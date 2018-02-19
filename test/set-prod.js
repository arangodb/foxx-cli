/* global describe, it, beforeEach, afterEach */
"use strict";

const path = require("path");
const Database = require("arangojs");
const expect = require("chai").expect;
const foxx = require("./util");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/prod-test";
const basePath = path.resolve(".", "test", "fixtures");

describe("Foxx service production mode", () => {
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

  it("with alternative server URL should be activated", async () => {
    const infoBefore = await db.getService(mount);
    expect(infoBefore.development).to.equal(true);
    foxx(`set-prod --server ${ARANGO_URL} ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(false);
  });

  it("with alternative server URL (short option) should be activated", async () => {
    const infoBefore = await db.getService(mount);
    expect(infoBefore.development).to.equal(true);
    foxx(`set-prod -H ${ARANGO_URL} ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(false);
  });

  it("with alternative database should be activated", async () => {
    const infoBefore = await db.getService(mount);
    expect(infoBefore.development).to.equal(true);
    foxx(`set-prod --database _system ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(false);
  });

  it("with alternative database (short option) should be activated", async () => {
    const infoBefore = await db.getService(mount);
    expect(infoBefore.development).to.equal(true);
    foxx(`set-prod -D _system ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(false);
  });

  it("with alternative username should be activated", async () => {
    const infoBefore = await db.getService(mount);
    expect(infoBefore.development).to.equal(true);
    foxx(`set-prod --username ${ARANGO_USERNAME} ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(false);
  });

  it("with alternative username should be activated (short option)", async () => {
    const infoBefore = await db.getService(mount);
    expect(infoBefore.development).to.equal(true);
    foxx(`set-prod -u ${ARANGO_USERNAME} ${mount}`);
    const infoAfter = await db.getService(mount);
    expect(infoAfter.development).to.equal(false);
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
