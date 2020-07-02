/* global describe, it, before, after */
"use strict";

const path = require("path");
const { Database } = require("arangojs");
const foxx = require("./util");
const expect = require("chai").expect;
const fs = require("fs");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/list-test";
const basePath = path.resolve(__dirname, "..", "..", "fixtures");

describe("Foxx service list", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION,
  });

  before(async () => {
    await db.installService(
      mount,
      fs.readFileSync(path.resolve(basePath, "minimal-working-service.zip"))
    );
  });

  after(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  it("should exclude system services", async () => {
    const services = await foxx("list", true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(1);
  });

  it("should include installed service", async () => {
    const services = await foxx("list", true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(1);
    const service = services.find((service) => service.mount === mount);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("provides");
    expect(service.provides).to.eql({});
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative server URL should show information about the service", async () => {
    const services = await foxx(`list --server ${ARANGO_URL}`, true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(1);
    const service = services.find((service) => service.mount === mount);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("provides");
    expect(service.provides).to.eql({});
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative server URL (short option) should show information about the service", async () => {
    const services = await foxx(`list -H ${ARANGO_URL}`, true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(1);
    const service = services.find((service) => service.mount === mount);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("provides");
    expect(service.provides).to.eql({});
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative database should show information about the service", async () => {
    const services = await foxx(`list --database _system`, true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(1);
    const service = services.find((service) => service.mount === mount);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("provides");
    expect(service.provides).to.eql({});
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative database (short option) should show information about the service", async () => {
    const services = await foxx(`list -D _system`, true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(1);
    const service = services.find((service) => service.mount === mount);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("provides");
    expect(service.provides).to.eql({});
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative username should show information about the service", async () => {
    const services = await foxx(`list --username ${ARANGO_USERNAME}`, true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(1);
    const service = services.find((service) => service.mount === mount);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("provides");
    expect(service.provides).to.eql({});
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  it("with alternative username should show information about the service (short option)", async () => {
    const services = await foxx(`list -u ${ARANGO_USERNAME}`, true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(1);
    const service = services.find((service) => service.mount === mount);
    expect(service).to.have.property("name", "minimal-working-manifest");
    expect(service).to.have.property("version", "0.0.0");
    expect(service).to.have.property("provides");
    expect(service.provides).to.eql({});
    expect(service).to.have.property("development", false);
    expect(service).to.have.property("legacy", false);
  });

  describe("with a password file", () => {
    const user = "testuser";
    const passwordFilePath = path.resolve(basePath, "passwordFile");
    const passwd = fs.readFileSync(passwordFilePath, "utf-8");
    before(async () => {
      db.route("/_api/user").post({
        user,
        passwd,
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
    it("should show information about the service", async () => {
      const services = await foxx(
        `list --username ${user} --password-file ${passwordFilePath}`,
        true
      );
      expect(services).to.be.instanceOf(Array);
      expect(services.length).to.equal(1);
      const service = services.find((service) => service.mount === mount);
      expect(service).to.have.property("name", "minimal-working-manifest");
      expect(service).to.have.property("version", "0.0.0");
      expect(service).to.have.property("provides");
      expect(service.provides).to.eql({});
      expect(service).to.have.property("development", false);
      expect(service).to.have.property("legacy", false);
    });
  });
});
