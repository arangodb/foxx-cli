/* global describe, it, beforeEach, afterEach */
"use strict";

const path = require("path");
const Database = require("arangojs");
const expect = require("chai").expect;
const foxx = require("./util");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/uninstall-test";
const basePath = path.resolve(".", "test", "fixtures");

describe("Foxx service uninstalled", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
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

  it("via alias remove should not be available", async () => {
    foxx(`remove ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("via alias purge should not be available", async () => {
    foxx(`purge ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative server URL should not be available", async () => {
    foxx(`uninstall --server ${ARANGO_URL} ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative server URL (short option) should not be available", async () => {
    foxx(`uninstall -H ${ARANGO_URL} ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative database should not be available", async () => {
    foxx(`uninstall --database _system ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative database (short option) should not be available", async () => {
    foxx(`uninstall -D _system ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative username should be avaiable", async () => {
    foxx(`uninstall --username ${ARANGO_USERNAME} ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative username should be avaiable (short option)", async () => {
    foxx(`uninstall -u ${ARANGO_USERNAME} ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("should run its teardown script by default", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    foxx(
      `replace ${mount} ${path.resolve(
        basePath,
        "minimal-working-setup-teardown.zip"
      )}`
    );
    const info = await db.collection(col).get();
    expect(info).to.have.property("name", col);
    foxx(`uninstall ${mount}`);
    try {
      await db.collection(col).get();
      expect.fail();
    } catch (e) {
      expect(e.errorNum).to.equal(1203);
    }
  });

  it("should run its teardown script when enabled", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    foxx(
      `replace ${mount} ${path.resolve(
        basePath,
        "minimal-working-setup-teardown.zip"
      )}`
    );
    foxx(`uninstall --teardown ${mount}`);
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
        `replace ${mount} ${path.resolve(
          basePath,
          "minimal-working-setup-teardown.zip"
        )}`
      );
      foxx(`uninstall --no-teardown ${mount}`);
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

  it("should fail when mount is omitted", async () => {
    try {
      foxx(`uninstall /not${mount}`);
      expect.fail();
    } catch (e) {
      // noop
    }
  });

  it("should fail when mount is invalid", async () => {
    try {
      foxx("uninstall /dev/null");
      expect.fail();
    } catch (e) {
      // noop
    }
  });
});
