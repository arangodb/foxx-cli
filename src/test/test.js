/* global describe, it, before, after */
"use strict";

const path = require("path");
const Database = require("arangojs");
const foxx = require("./util");
const expect = require("chai").expect;

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/test-test";
const basePath = path.resolve(__dirname, "..", "..", "fixtures");

describe("Foxx service test", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  before(async () => {
    await db.installService(mount, path.resolve(basePath, "with-tests.zip"));
  });

  after(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  it("should print test result", async () => {
    try {
      await foxx(`test ${mount}`);
    } catch (e) {
      const result = e.stdout.toString("utf-8");
      expect(result).to.has.string("4 passing");
      expect(result).to.has.string("2 failing");
    }
  });

  it("with alternative server URL should print test result", async () => {
    try {
      await foxx(`test ${mount} --server ${ARANGO_URL}`);
    } catch (e) {
      const result = e.stdout.toString("utf-8");
      expect(result).to.has.string("4 passing");
      expect(result).to.has.string("2 failing");
    }
  });

  it("with alternative server URL (short option) should print test result", async () => {
    try {
      await foxx(`test ${mount} -H ${ARANGO_URL}`);
    } catch (e) {
      const result = e.stdout.toString("utf-8");
      expect(result).to.has.string("4 passing");
      expect(result).to.has.string("2 failing");
    }
  });

  it("with alternative database should print test result", async () => {
    try {
      await foxx(`test ${mount} --database _system`);
    } catch (e) {
      const result = e.stdout.toString("utf-8");
      expect(result).to.has.string("4 passing");
      expect(result).to.has.string("2 failing");
    }
  });

  it("with alternative database (short option) should print test result", async () => {
    try {
      await foxx(`test ${mount} -D _system`);
    } catch (e) {
      const result = e.stdout.toString("utf-8");
      expect(result).to.has.string("4 passing");
      expect(result).to.has.string("2 failing");
    }
  });

  it("with alternative username should print test result", async () => {
    try {
      await foxx(`test ${mount} --username ${ARANGO_USERNAME}`);
    } catch (e) {
      const result = e.stdout.toString("utf-8");
      expect(result).to.has.string("4 passing");
      expect(result).to.has.string("2 failing");
    }
  });

  it("with alternative username should print test result (short option)", async () => {
    try {
      await foxx(`test ${mount} -u ${ARANGO_USERNAME}`);
    } catch (e) {
      const result = e.stdout.toString("utf-8");
      expect(result).to.has.string("4 passing");
      expect(result).to.has.string("2 failing");
    }
  });

  it("should fail when mount is invalid", async () => {
    try {
      await foxx(`test /dev/null echo`);
    } catch (e) {
      return;
    }
    expect.fail();
  });
});
