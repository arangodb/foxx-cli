/* global describe, it, before, after */
"use strict";

const path = require("path");
const Database = require("arangojs");
const foxx = require("./util");
const expect = require("chai").expect;

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/show-test";
const basePath = path.resolve(__dirname, "..", "..", "fixtures");

describe("Foxx service show", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  before(async () => {
    await db.installService(
      mount,
      path.resolve(basePath, "minimal-working-service.zip")
    );
  });

  after(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  it("should show information about the service", async () => {
    const service = await foxx(`show ${mount}`, true);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("should show information about the service via alias", async () => {
    const service = await foxx(`info ${mount}`, true);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative server URL should show information about the service", async () => {
    const service = await foxx(`show --server ${ARANGO_URL} ${mount}`, true);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative server URL (short option) should show information about the service", async () => {
    const service = await foxx(`show -H ${ARANGO_URL} ${mount}`, true);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative database should show information about the service", async () => {
    const service = await foxx(`show --database _system ${mount}`, true);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative database (short option) should show information about the service", async () => {
    const service = await foxx(`show -D _system ${mount}`, true);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative username should show information about the service", async () => {
    const service = await foxx(
      `show --username ${ARANGO_USERNAME} ${mount}`,
      true
    );
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative username should show information about the service (short option)", async () => {
    const service = await foxx(`show -u ${ARANGO_USERNAME} ${mount}`, true);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("should fail when mount is invalid", async () => {
    try {
      await foxx("show /dev/null");
    } catch (e) {
      return;
    }
    expect.fail();
  });
});
