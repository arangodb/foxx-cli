/* global describe, it, before, beforeEach, after, afterEach */
"use strict";

const path = require("path");
const { Database } = require("arangojs");
const expect = require("chai").expect;
const foxx = require("./util");
const helper = require("./helper");
const fs = require("fs");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/upgrade-test";
const basePath = path.resolve(__dirname, "..", "..", "fixtures");
const serviceServiceMount = "/foxx-crud-test-download";
const servicePath = path.resolve(basePath, "minimal-working-service.zip");

describe("Foxx service upgraded", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION,
  });

  let arangoPaths;
  before(async () => {
    await db.installService(
      serviceServiceMount,
      fs.readFileSync(path.resolve(basePath, "service-service-service.zip"))
    );
    const res = await db.route(serviceServiceMount).get();
    arangoPaths = res.body;
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
      await db.installService(mount, fs.readFileSync(servicePath));
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
      await foxx(`upgrade ${mount} ${c.source(arangoPaths)}`);
      const res = await db.route(mount).get();
      expect(res.body).to.eql({ hello: "world" });
    });
  }

  it("via stdin should be available", async () => {
    const input = fs.readFileSync(
      path.resolve(basePath, "minimal-working-service.zip")
    );
    await foxx(`upgrade ${mount} @`, false, { input });
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("in development mode should be available", async () => {
    await foxx(`upgrade --development ${mount} ${servicePath}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
    const info = await db.getService(mount);
    expect(info.development).to.equal(true);
  });

  it("in development mode (short option) should be available", async () => {
    await foxx(`upgrade --dev ${mount} ${servicePath}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
    const info = await db.getService(mount);
    expect(info.development).to.equal(true);
  });

  it("with alternative server URL should be available", async () => {
    await foxx(`upgrade --server ${ARANGO_URL} ${mount} ${servicePath}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative server URL (short option) should be available", async () => {
    await foxx(`upgrade -H ${ARANGO_URL} ${mount} ${servicePath}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative database should be available", async () => {
    await foxx(`upgrade --database _system ${mount} ${servicePath}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative database (short option) should be available", async () => {
    await foxx(`upgrade -D _system ${mount} ${servicePath}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative username should be available", async () => {
    await foxx(`upgrade --username ${ARANGO_USERNAME} ${mount} ${servicePath}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });

  it("with alternative username should be available (short option)", async () => {
    await foxx(`upgrade -u ${ARANGO_USERNAME} ${mount} ${servicePath}`);
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
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
    it("should be available", async () => {
      await foxx(
        `upgrade --username ${user} --password-file ${passwordFilePath} ${mount} ${servicePath}`
      );
      const res = await db.route(mount).get();
      expect(res.body).to.eql({ hello: "world" });
    });
  });

  it("should run its setup script by default", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    try {
      await db.collection(col).get();
      expect.fail();
    } catch (e) {
      expect(e.errorNum).to.equal(1203);
    }
    await foxx(
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
    await foxx(
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
    await foxx(
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
      await foxx(
        `upgrade ${mount} ${path.resolve(
          basePath,
          "minimal-working-setup-teardown.zip"
        )}`
      );
      await foxx(
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
    await foxx(
      `upgrade ${mount} ${path.resolve(
        basePath,
        "minimal-working-setup-teardown.zip"
      )}`
    );
    await foxx(
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
      await foxx(
        `upgrade ${mount} ${path.resolve(
          basePath,
          "minimal-working-setup-teardown.zip"
        )}`
      );
      await foxx(
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
    await foxx(
      `upgrade ${mount} ${path.resolve(basePath, "with-configuration.zip")}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.not.have.property("test1");
    expect(configuration).to.not.have.property("test2");
  });

  it("with configuration should have one config set", async () => {
    await foxx(
      `upgrade --cfg test1="test1" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.not.have.property("test2");
  });

  it("with configuration should have two configs set", async () => {
    await foxx(
      `upgrade --cfg test1="test1" --cfg test2="test2" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.have.property("test2", "test2");
  });

  it("with configuration should have one config set (short option)", async () => {
    await foxx(
      `upgrade -c test1="test1" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.not.have.property("test2");
  });

  it("with configuration should have two configs set (short option)", async () => {
    await foxx(
      `upgrade -c test1="test1" -c test2="test2" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.have.property("test2", "test2");
  });

  it("with configuration should have two configs set (mixed options)", async () => {
    await foxx(
      `upgrade --cfg test1="test1" -c test2="test2" ${mount} ${path.resolve(
        basePath,
        "with-configuration.zip"
      )}`
    );
    const configuration = await db.getServiceConfiguration(mount, true);
    expect(configuration).to.have.property("test1", "test1");
    expect(configuration).to.have.property("test2", "test2");
  });

  it("with dependencies should have not be set by default", async () => {
    await foxx(
      `upgrade ${mount} ${path.resolve(basePath, "with-dependencies.zip")}`
    );
    const dependencies = await db.getServiceDependencies(mount, true);
    expect(dependencies).to.not.have.property("test1");
    expect(dependencies).to.not.have.property("test2");
  });

  it("with dependencies should have one dependency set", async () => {
    await foxx(
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
    await foxx(
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
    await foxx(
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
    await foxx(
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
    await foxx(
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
    try {
      await foxx(
        `upgrade /dev/null ${path.resolve(
          basePath,
          "minimal-working-service.zip"
        )}`
      );
    } catch (e) {
      try {
        await db.route(`/dev/null`).get();
      } catch (e) {
        expect(e).to.have.property("statusCode", 404);
        return;
      }
    }
    expect.fail();
  });
});
