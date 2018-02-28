/* global describe, it, before, beforeEach, after, afterEach */
"use strict";

const path = require("path");
const Database = require("arangojs");
const expect = require("chai").expect;
const foxx = require("./util");
const helper = require("./helper");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/upgrade-test";
const basePath = path.resolve(".", "test", "fixtures");
const serviceServiceMount = "/foxx-crud-test-download";

describe("Foxx service upgraded", () => {
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

  beforeEach(async () => {
    try {
      await db.installService(
        mount,
        path.resolve(basePath, "minimal-working-service.zip")
      );
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

  const cases = helper.crudCases();

  for (const c of cases) {
    it(`via ${c.name} should be available`, async () => {
      foxx(`upgrade ${mount} ${c.source(arangoPaths)}`);
      const res = await db.route(mount).get();
      expect(res.body).to.eql({ hello: "world" });
    });
  }

  it("in development mode should be available", async () => {
    foxx(`upgrade --development ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
    const info = await db.getService(mount);
    expect(info.development).to.equal(true);
  });

  it("in development mode (short option) should be available", async () => {
    foxx(`upgrade --dev ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
    const info = await db.getService(mount);
    expect(info.development).to.equal(true);
  });

  it("with alternative server URL should be available", async () => {
    foxx(`upgrade --server ${ARANGO_URL} ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative server URL (short option) should be available", async () => {
    foxx(`upgrade -H ${ARANGO_URL} ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative database should be available", async () => {
    foxx(`upgrade --database _system ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative database (short option) should be available", async () => {
    foxx(`upgrade -D _system ${mount} ${arangoPaths.local.js}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative username should be avaiable", async () => {
    foxx(
      `upgrade --username ${ARANGO_USERNAME} ${mount} ${arangoPaths.local.zip}`
    );
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative username should be avaiable (short option)", async () => {
    foxx(`upgrade -u ${ARANGO_USERNAME} ${mount} ${arangoPaths.local.zip}`);
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
      `upgrade ${mount} ${path.resolve(
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
      `upgrade --setup ${mount} ${path.resolve(
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
      `upgrade --no-setup ${mount} ${path.resolve(
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

  it("should not run its teardown script by default", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    try {
      foxx(
        `upgrade ${mount} ${path.resolve(
          basePath,
          "minimal-working-setup-teardown.zip"
        )}`
      );
      foxx(
        `upgrade ${mount} ${path.resolve(
          basePath,
          "minimal-working-service.zip"
        )}`
      );
      const info = await db.collection(col).get();
      expect(info).to.have.property("name", col);
    } finally {
      try {
        await db.collection(col).drop();
      } catch (e) {
        // noop
      }
    }
  });

  it("should run its teardown script when enabled", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    foxx(
      `upgrade ${mount} ${path.resolve(
        basePath,
        "minimal-working-setup-teardown.zip"
      )}`
    );
    foxx(
      `upgrade --teardown ${mount} ${path.resolve(
        basePath,
        "minimal-working-service.zip"
      )}`
    );
    try {
      await db.collection(col).get();
      expect.fail();
    } catch (e) {
      expect(e.errorNum).to.equal(1203);
    }
  });

  it("should not run its teardown script when disabled", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    try {
      foxx(
        `upgrade ${mount} ${path.resolve(
          basePath,
          "minimal-working-setup-teardown.zip"
        )}`
      );
      foxx(
        `upgrade --no-teardown ${mount} ${path.resolve(
          basePath,
          "minimal-working-service.zip"
        )}`
      );
      const info = await db.collection(col).get();
      expect(info).to.have.property("name", col);
    } finally {
      try {
        await db.collection(col).drop();
      } catch (e) {
        // noop
      }
    }
  });

  it("with configuration should not be set by default", async () => {
    foxx(
      `upgrade ${mount} ${path.resolve(basePath, "with-configuration.zip")}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.not.have.property("test1");
    expect(configuration).to.not.have.property("test2");
  });

  it("with configuration should have one config set", async () => {
    foxx(
      `upgrade --cfg test1=\\"test1\\" ${mount} ${path.resolve(
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
      `upgrade --cfg test1=\\"test1\\" --cfg test2=\\"test2\\" ${mount} ${path.resolve(
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
      `upgrade -c test1=\\"test1\\" ${mount} ${path.resolve(
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
      `upgrade -c test1=\\"test1\\" -c test2=\\"test2\\" ${mount} ${path.resolve(
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
      `upgrade --cfg test1=\\"test1\\" -c test2=\\"test2\\" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.have.property("test2", "test2");
  });

  it("with dependencies should have not be set by default", async () => {
    foxx(`upgrade ${mount} ${path.resolve(basePath, "with-dependencies.zip")}`);
    const dependencies = await db.getServiceDependencies(mount, true);
    expect(dependencies).to.not.have.property("test1");
    expect(dependencies).to.not.have.property("test2");
  });

  it("with dependencies should have one dependency set", async () => {
    foxx(
      `upgrade --dep test1=/test1 ${mount} ${path.resolve(
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
      `upgrade --dep test1=/test1 --dep test2=/test2 ${mount} ${path.resolve(
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
      `upgrade -d test1=/test1 ${mount} ${path.resolve(
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
      `upgrade -d test1=/test1 -d test2=/test2 ${mount} ${path.resolve(
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
      `upgrade --dep test1=/test1 -d test2=/test2 ${mount} ${path.resolve(
        basePath,
        "with-dependencies.zip"
      )}`
    );
    const dependencies = await db.getServiceDependencies(mount, true);
    expect(dependencies).to.have.property("test1", "/test1");
    expect(dependencies).to.have.property("test2", "/test2");
  });

  it("should fail when mount is invalid", async () => {
    expect(() =>
      foxx(
        `upgrade /dev/null ${path.resolve(
          basePath,
          "minimal-working-service.zip"
        )}`
      )
    ).to.throw();
    try {
      await db.route(`/dev/null`).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });
});
