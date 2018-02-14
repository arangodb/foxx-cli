/* global describe, it, before, after, afterEach */
"use strict";

const path = require("path");
const Database = require("arangojs");
const expect = require("chai").expect;
const foxx = require("./util");
const helper = require("./helper");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const username = process.env.ARANGO_USERNAME || "root";

const mount = "/install-test";
const basePath = path.resolve(".", "test", "fixtures");
const serviceServiceMount = "/foxx-crud-test-download";

describe("Foxx service installed (with alias i)", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  let arangoPaths;
  before(async () => {
    await db.installService(
      serviceServiceMount,
      path.resolve(basePath, "service-service-service.zip")
    );
    arangoPaths = (await db.route(serviceServiceMount).get()).body;
  });

  after(async () => {
    try {
      await db.uninstallService(serviceServiceMount, { force: true });
    } catch (e) {
      // noop
    }
  });

  afterEach(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  const cases = helper.crudCases(db, serviceServiceMount);

  for (const c of cases) {
    it(`via ${c.name} should be available`, async () => {
      foxx(`i ${mount} ${c.source(arangoPaths)}`);
      const res = await db.route(mount).get();
      expect(res.body).to.eql({ hello: "world" });
    });
  }

  it("in development mode should be available", async () => {
    foxx(`i --development ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
    const info = await db.getService(mount);
    expect(info.development).to.equal(true);
  });

  it("in development mode (short option) should be available", async () => {
    foxx(`i --dev ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
    const info = await db.getService(mount);
    expect(info.development).to.equal(true);
  });

  it("with alternative server URL should be available", async () => {
    foxx(`i --server ${ARANGO_URL} ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative server URL (short option) should be available", async () => {
    foxx(`i -H ${ARANGO_URL} ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative database should be available", async () => {
    foxx(`i --database _system ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative database (short option) should be available", async () => {
    foxx(`i -D _system ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative username should be avaiable", async () => {
    foxx(`i --username ${username} ${mount} ${arangoPaths.local.zip}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative username should be avaiable (short option)", async () => {
    foxx(`i -u ${username} ${mount} ${arangoPaths.local.zip}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("should run its setup script by default", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    try {
      await db.collection(col).get();
      expect.fail();
    } catch (e) {
      expect(e.errorNum).to.equal(1203);
    }
    foxx(
      `i ${mount} ${path.resolve(
        basePath,
        "minimal-working-setup-teardown.zip"
      )}`
    );
    const info = await db.collection(col).get();
    expect(info).to.have.property("name", col);
  });

  it("should run its setup script when enabled", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    try {
      await db.collection(col).get();
      expect.fail();
    } catch (e) {
      expect(e.errorNum).to.equal(1203);
    }
    foxx(
      `i --setup ${mount} ${path.resolve(
        basePath,
        "minimal-working-setup-teardown.zip"
      )}`
    );
    const info = await db.collection(col).get();
    expect(info).to.have.property("name", col);
  });

  it("should not run its setup script when disabled", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    try {
      await db.collection(col).get();
      expect.fail();
    } catch (e) {
      expect(e.errorNum).to.equal(1203);
    }
    foxx(
      `i --no-setup ${mount} ${path.resolve(
        basePath,
        "minimal-working-setup-teardown.zip"
      )}`
    );
    try {
      await db.collection(col).get();
      expect.fail();
    } catch (e) {
      expect(e.errorNum).to.equal(1203);
    }
  });

  it("with configuration should not be set by default", async () => {
    foxx(`i ${mount} ${path.resolve(basePath, "with-configuration.zip")}`);
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.not.have.property("test1");
    expect(configuration).to.not.have.property("test2");
  });

  it("with configuration should have one config set", async () => {
    foxx(
      `i --cfg test1=\\"test1\\" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.not.have.property("test2");
  });

  it("with configuration should have two configs set", async () => {
    foxx(
      `i --cfg test1=\\"test1\\" --cfg test2=\\"test2\\" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.have.property("test2", "test2");
  });

  it("with configuration should have one config set (short option)", async () => {
    foxx(
      `i -c test1=\\"test1\\" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.not.have.property("test2");
  });

  it("with configuration should have two configs set (short option)", async () => {
    foxx(
      `i -c test1=\\"test1\\" -c test2=\\"test2\\" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.have.property("test2", "test2");
  });

  it("with configuration should have two configs set (mixed options)", async () => {
    foxx(
      `i --cfg test1=\\"test1\\" -c test2=\\"test2\\" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.have.property("test2", "test2");
  });

  it("with dependencies should have not be set by default", async () => {
    foxx(`i ${mount} ${path.resolve(basePath, "with-dependencies.zip")}`);
    const dependencies = await db.getServiceDependencies(mount, true);
    expect(dependencies).to.not.have.property("test1");
    expect(dependencies).to.not.have.property("test2");
  });

  it("with dependencies should have one dependency set", async () => {
    foxx(
      `i --dep test1=/test1 ${mount} ${path.resolve(
        basePath,
        "with-dependencies.zip"
      )}`
    );
    const dependencies = await db.getServiceDependencies(mount, true);
    expect(dependencies).to.have.property("test1", "/test1");
    expect(dependencies).to.not.have.property("test2");
  });

  it("with dependencies should have two dependencies set", async () => {
    foxx(
      `i --dep test1=/test1 --dep test2=/test2 ${mount} ${path.resolve(
        basePath,
        "with-dependencies.zip"
      )}`
    );
    const dependencies = await db.getServiceDependencies(mount, true);
    expect(dependencies).to.have.property("test1", "/test1");
    expect(dependencies).to.have.property("test2", "/test2");
  });

  it("with dependencies should have one dependency set (short option)", async () => {
    foxx(
      `i -d test1=/test1 ${mount} ${path.resolve(
        basePath,
        "with-dependencies.zip"
      )}`
    );
    const dependencies = await db.getServiceDependencies(mount, true);
    expect(dependencies).to.have.property("test1", "/test1");
    expect(dependencies).to.not.have.property("test2");
  });

  it("with dependencies should have two dependencies set (short option)", async () => {
    foxx(
      `i -d test1=/test1 -d test2=/test2 ${mount} ${path.resolve(
        basePath,
        "with-dependencies.zip"
      )}`
    );
    const dependencies = await db.getServiceDependencies(mount, true);
    expect(dependencies).to.have.property("test1", "/test1");
    expect(dependencies).to.have.property("test2", "/test2");
  });

  it("with dependencies should have two dependencies set (mixed options)", async () => {
    foxx(
      `i --dep test1=/test1 -d test2=/test2 ${mount} ${path.resolve(
        basePath,
        "with-dependencies.zip"
      )}`
    );
    const dependencies = await db.getServiceDependencies(mount, true);
    expect(dependencies).to.have.property("test1", "/test1");
    expect(dependencies).to.have.property("test2", "/test2");
  });
});
