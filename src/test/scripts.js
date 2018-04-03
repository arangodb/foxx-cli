/* global describe, it, before, after */
"use strict";

const path = require("path");
const Database = require("arangojs");
const foxx = require("./util");
const expect = require("chai").expect;

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/scripts-test";
const basePath = path.resolve(__dirname, "..", "..", "fixtures");

describe("Foxx service scripts", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  before(async () => {
    await db.installService(
      mount,
      path.resolve(basePath, "minimal-working-setup-teardown.zip")
    );
  });

  after(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  it("should all be listed", async () => {
    const scripts = await foxx(`scripts ${mount}`, true);
    expect(scripts).to.have.property("setup", "Setup");
    expect(scripts).to.have.property("teardown", "Teardown");
  });

  it("with alternative server URL should all be listed", async () => {
    const scripts = await foxx(`scripts ${mount} --server ${ARANGO_URL}`, true);
    expect(scripts).to.have.property("setup", "Setup");
    expect(scripts).to.have.property("teardown", "Teardown");
  });

  it("with alternative server URL (short option) should all be listed", async () => {
    const scripts = await foxx(`scripts ${mount} -H ${ARANGO_URL}`, true);
    expect(scripts).to.have.property("setup", "Setup");
    expect(scripts).to.have.property("teardown", "Teardown");
  });

  it("with alternative database should all be listed", async () => {
    const scripts = await foxx(`scripts ${mount} --database _system`, true);
    expect(scripts).to.have.property("setup", "Setup");
    expect(scripts).to.have.property("teardown", "Teardown");
  });

  it("with alternative database (short option) should all be listed", async () => {
    const scripts = await foxx(`scripts ${mount} -D _system`, true);
    expect(scripts).to.have.property("setup", "Setup");
    expect(scripts).to.have.property("teardown", "Teardown");
  });

  it("with alternative username should all be listed", async () => {
    const scripts = await foxx(
      `scripts ${mount} --username ${ARANGO_USERNAME}`,
      true
    );
    expect(scripts).to.have.property("setup", "Setup");
    expect(scripts).to.have.property("teardown", "Teardown");
  });

  it("with alternative username should all be listed (short option)", async () => {
    const scripts = await foxx(`scripts ${mount} -u ${ARANGO_USERNAME}`, true);
    expect(scripts).to.have.property("setup", "Setup");
    expect(scripts).to.have.property("teardown", "Teardown");
  });
});
