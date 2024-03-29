/* global describe, it, before, beforeEach, after, afterEach */
"use strict";

const path = require("path");
const { Database } = require("arangojs");
const foxx = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";

const mount = "/server-test";
const basePath = path.resolve(__dirname, "..", "..", "fixtures");

const foxxRcFile = path.resolve(os.tmpdir(), ".foxxrc");

describe("Foxx with server", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION,
  });

  before(async () => {
    process.env.FOXXRC_PATH = foxxRcFile;
  });

  after(async () => {
    process.env.FOXXRC_PATH = undefined;
  });

  beforeEach(async () => {
    if (fs.existsSync(foxxRcFile)) {
      fs.unlinkSync(foxxRcFile);
    }
  });

  afterEach(async () => {
    try {
      await await foxx(`uninstall ${mount}`);
    } catch (e) {
      // noop
    }
  });

  it("with alternative server should be available", async () => {
    await foxx(`server set test ${ARANGO_URL}`);
    await foxx(
      `install --server test ${mount} ${path.resolve(
        basePath,
        "minimal-working-service.zip"
      )}`
    );
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });
});

describe("Foxx with non-default db", () => {
  const dbName = `test_cli_${Date.now()}`;
  let db;
  const system = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION,
  });

  before(async () => {
    db = await system.createDatabase(dbName);
    process.env.FOXXRC_PATH = foxxRcFile;
  });

  after(async () => {
    await system.dropDatabase(db.name);
    process.env.FOXXRC_PATH = undefined;
  });

  beforeEach(async () => {
    if (fs.existsSync(foxxRcFile)) {
      fs.unlinkSync(foxxRcFile);
    }
  });

  afterEach(async () => {
    try {
      await await foxx(`uninstall ${mount}`);
    } catch (e) {
      // noop
    }
  });

  it("with alternative server should be available", async () => {
    await foxx(`server set test ${ARANGO_URL} -D ${dbName}`);
    await foxx(
      `install --server test ${mount} ${path.resolve(
        basePath,
        "minimal-working-service.zip"
      )}`
    );
    const res = await db.route(mount).get();
    expect(res.body).to.eql({ hello: "world" });
  });
});
