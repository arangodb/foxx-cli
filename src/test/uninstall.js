/* global describe, it, before, after, beforeEach, afterEach */
"use strict";

const path = require("path");
const Database = require("arangojs");
const expect = require("chai").expect;
const foxx = require("./util");
const fs = require("fs");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/uninstall-test";
const basePath = path.resolve(__dirname, "..", "..", "fixtures");

describe("Foxx service uninstalled", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION,
  });

  beforeEach(async () => {
    try {
      await db.installService(
        mount,
        fs.readFileSync(path.resolve(basePath, "minimal-working-service.zip"))
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
    await foxx(`remove ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("via alias purge should not be available", async () => {
    await foxx(`purge ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative server URL should not be available", async () => {
    await foxx(`uninstall --server ${ARANGO_URL} ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative server URL (short option) should not be available", async () => {
    await foxx(`uninstall -H ${ARANGO_URL} ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative database should not be available", async () => {
    await foxx(`uninstall --database _system ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative database (short option) should not be available", async () => {
    await foxx(`uninstall -D _system ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative username should be available", async () => {
    await foxx(`uninstall --username ${ARANGO_USERNAME} ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
  });

  it("with alternative username should be available (short option)", async () => {
    await foxx(`uninstall -u ${ARANGO_USERNAME} ${mount}`);
    try {
      await db.route(mount).get();
      expect.fail();
    } catch (e) {
      expect(e).to.have.property("statusCode", 404);
    }
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
    it("should not be available", async () => {
      await foxx(
        `uninstall --username ${user} --password-file ${passwordFilePath} ${mount}`
      );
      try {
        await db.route(mount).get();
        expect.fail();
      } catch (e) {
        expect(e).to.have.property("statusCode", 404);
      }
    });
  });

  it("should run its teardown script by default", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    await foxx(
      `replace ${mount} ${path.resolve(
        basePath,
        "minimal-working-setup-teardown.zip"
      )}`
    );
    const info = await db.collection(col).get();
    expect(info).to.have.property("name", col);
    await foxx(`uninstall ${mount}`);
    try {
      await db.collection(col).get();
      expect.fail();
    } catch (e) {
      expect(e.errorNum).to.equal(1203);
    }
  });

  it("should run its teardown script when enabled", async () => {
    const col = `${mount}_setup_teardown`.replace(/\//, "").replace(/-/g, "_");
    await foxx(
      `replace ${mount} ${path.resolve(
        basePath,
        "minimal-working-setup-teardown.zip"
      )}`
    );
    await foxx(`uninstall --teardown ${mount}`);
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
        `replace ${mount} ${path.resolve(
          basePath,
          "minimal-working-setup-teardown.zip"
        )}`
      );
      await foxx(`uninstall --no-teardown ${mount}`);
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

  it("should not fail when mount is invalid", async () => {
    await foxx("uninstall /dev/null");
  });
});
