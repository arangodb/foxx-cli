/* global describe, it, beforeEach, afterEach */
"use strict";

const path = require("path");
const Database = require("arangojs");
const expect = require("chai").expect;
const foxx = require("./util");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/config-test";
const basePath = path.resolve(".", "test", "fixtures");

describe("Foxx service configuration", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  beforeEach(async () => {
    await db.installService(
      mount,
      path.resolve(basePath, "with-configuration.zip")
    );
  });

  afterEach(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  it("empty should be available", async () => {
    const config = foxx(`config ${mount}`, true);
    expect(config).to.have.property("test1");
    expect(config.test1).to.not.have.property("current");
    expect(config).to.have.property("test2");
    expect(config.test2).to.not.have.property("current");
  });

  it("via alias cfg should be available", async () => {
    const config = foxx(`cfg ${mount}`, true);
    expect(config).to.have.property("test1");
    expect(config.test1).to.not.have.property("current");
    expect(config).to.have.property("test2");
    expect(config.test2).to.not.have.property("current");
  });

  it("via alias configuration should be available", async () => {
    const config = foxx(`configuration ${mount}`, true);
    expect(config).to.have.property("test1");
    expect(config.test1).to.not.have.property("current");
    expect(config).to.have.property("test2");
    expect(config.test2).to.not.have.property("current");
  });

  it("with alternative server URL should be available", async () => {
    const config = foxx(`config --server ${ARANGO_URL} ${mount}`, true);
    expect(config).to.have.property("test1");
    expect(config).to.have.property("test2");
  });

  it("with alternative server URL (short option) should be available", async () => {
    const config = foxx(`config -H ${ARANGO_URL} ${mount}`, true);
    expect(config).to.have.property("test1");
    expect(config).to.have.property("test2");
  });

  it("with alternative database should be available", async () => {
    const config = foxx(`config --database _system ${mount}`, true);
    expect(config).to.have.property("test1");
    expect(config).to.have.property("test2");
  });

  it("with alternative database (short option) should be available", async () => {
    const config = foxx(`config -D _system ${mount}`, true);
    expect(config).to.have.property("test1");
    expect(config).to.have.property("test2");
  });

  it("with alternative username should be avaiable", async () => {
    const config = foxx(`config --username ${ARANGO_USERNAME} ${mount}`, true);
    expect(config).to.have.property("test1");
    expect(config).to.have.property("test2");
  });

  it("with alternative username should be avaiable (short option)", async () => {
    const config = foxx(`config -u ${ARANGO_USERNAME} ${mount}`, true);
    expect(config).to.have.property("test1");
    expect(config).to.have.property("test2");
  });

  it("empty minimal should be available", async () => {
    const config = foxx(`config ${mount} --minimal`, true);
    expect(config).to.eql({});
  });

  it("should be available after update", async () => {
    const updateResp = foxx(`config ${mount} test1=test`, true);
    expect(updateResp).to.have.property("test1");
    expect(updateResp.test1).to.have.property("current", "test");
    expect(updateResp.test1).to.not.have.property("warning");
    expect(updateResp).to.have.property("test2");
    expect(updateResp.test2).to.not.have.property("current");
    expect(updateResp.test2).to.not.have.property("warning");
    const resp = foxx(`config ${mount}`, true);
    expect(resp).to.have.property("test1");
    expect(resp.test1).to.have.property("current", "test");
    expect(resp).to.have.property("test2");
    expect(resp.test2).to.not.have.property("current");
  });

  it("minimal should be available after update", async () => {
    const updateResp = foxx(`config ${mount} test1=test --minimal`, true);
    expect(updateResp).to.have.property("values");
    expect(updateResp.values).to.have.property("test1", "test");
    expect(updateResp.values).to.not.have.property("test2");
    expect(updateResp).to.not.have.property("warnings");
    const resp = foxx(`config ${mount} --minimal`, true);
    expect(resp).to.have.property("test1", "test");
    expect(resp).to.not.have.property("test2");
  });

  it("should be available after replace", async () => {
    const replaceResp = foxx(`config ${mount} test1=test --force`, true);
    expect(replaceResp).to.have.property("test1");
    expect(replaceResp.test1).to.have.property("current", "test");
    expect(replaceResp.test1).to.not.have.property("warning");
    expect(replaceResp).to.have.property("test2");
    expect(replaceResp.test2).to.not.have.property("current");
    expect(replaceResp.test2).to.have.property("warning", "is required");
    const resp = foxx(`config ${mount}`, true);
    expect(resp).to.have.property("test1");
    expect(resp.test1).to.have.property("current", "test");
    expect(resp).to.have.property("test2");
    expect(resp.test2).to.not.have.property("current");
  });

  it("should be available after replace via alias", async () => {
    const replaceResp = foxx(`config ${mount} test1=test --f`, true);
    expect(replaceResp).to.have.property("test1");
    expect(replaceResp.test1).to.have.property("current", "test");
    expect(replaceResp.test1).to.not.have.property("warning");
    expect(replaceResp).to.have.property("test2");
    expect(replaceResp.test2).to.not.have.property("current");
    expect(replaceResp.test2).to.have.property("warning", "is required");
    const resp = foxx(`config ${mount}`, true);
    expect(resp).to.have.property("test1");
    expect(resp.test1).to.have.property("current", "test");
    expect(resp).to.have.property("test2");
    expect(resp.test2).to.not.have.property("current");
  });

  it("minimal should be available after replace", async () => {
    const replaceResp = foxx(
      `config ${mount} test1=test --force --minimal`,
      true
    );
    expect(replaceResp).to.have.property("values");
    expect(replaceResp.values).to.have.property("test1", "test");
    expect(replaceResp.values).to.not.have.property("test2");
    expect(replaceResp).to.have.property("warnings");
    expect(replaceResp.warnings).to.have.property("test2", "is required");
    const resp = foxx(`config ${mount} --minimal`, true);
    expect(resp).to.have.property("test1", "test");
    expect(resp).to.not.have.property("test2");
  });

  it("should be merged after update", async () => {
    foxx(`config ${mount} test2=test2 --force`);
    foxx(`config ${mount} test1=test1`);
    const resp = foxx(`config ${mount}`, true);
    expect(resp).to.have.property("test1");
    expect(resp.test1).to.have.property("current", "test1");
    expect(resp).to.have.property("test2");
    expect(resp.test2).to.have.property("current", "test2");
  });

  it("minimal should be merged after update", async () => {
    foxx(`config ${mount} test2=test2 --force`);
    foxx(`config ${mount} test1=test1`);
    const resp = foxx(`config ${mount} --minimal`, true);
    expect(resp).to.have.property("test1", "test1");
    expect(resp).to.have.property("test2", "test2");
  });

  it("should be overwritten after replace", async () => {
    foxx(`config ${mount} test2=test2`);
    foxx(`config ${mount} test1=test --force`);
    const resp = foxx(`config ${mount}`, true);
    expect(resp).to.have.property("test1");
    expect(resp.test1).to.have.property("current", "test");
    expect(resp).to.have.property("test2");
    expect(resp.test2).to.not.have.property("current");
  });

  it("minimal should be overwritten after replace", async () => {
    foxx(`config ${mount} test2=test2`);
    foxx(`config ${mount} test1=test --force`);
    const resp = foxx(`config ${mount} --minimal`, true);
    expect(resp).to.have.property("test1", "test");
    expect(resp).to.not.have.property("test2");
  });

  it("update should allow multiple changes", async () => {
    const updateResp = foxx(`config ${mount} test1=test1 test2=test2`, true);
    expect(updateResp).to.have.property("test1");
    expect(updateResp.test1).to.have.property("current", "test1");
    expect(updateResp).to.have.property("test2");
    expect(updateResp.test2).to.have.property("current", "test2");
    const resp = foxx(`config ${mount}`, true);
    expect(resp).to.have.property("test1");
    expect(resp.test1).to.have.property("current", "test1");
    expect(resp).to.have.property("test2");
    expect(resp.test2).to.have.property("current", "test2");
  });

  it("minimal update should allow multiple changes", async () => {
    const updateResp = foxx(
      `config ${mount} test1=test1 test2=test2 --minimal`,
      true
    );
    expect(updateResp).to.have.property("values");
    expect(updateResp.values).to.have.property("test1", "test1");
    expect(updateResp.values).to.have.property("test2", "test2");
    const resp = foxx(`config ${mount} --minimal`, true);
    expect(resp).to.have.property("test1", "test1");
    expect(resp).to.have.property("test2", "test2");
  });

  it("replace should allow multiple changes", async () => {
    const updateResp = foxx(
      `config ${mount} test1=test1 test2=test2 --force`,
      true
    );
    expect(updateResp).to.have.property("test1");
    expect(updateResp.test1).to.have.property("current", "test1");
    expect(updateResp).to.have.property("test2");
    expect(updateResp.test2).to.have.property("current", "test2");
    const resp = foxx(`config ${mount}`, true);
    expect(resp).to.have.property("test1");
    expect(resp.test1).to.have.property("current", "test1");
    expect(resp).to.have.property("test2");
    expect(resp.test2).to.have.property("current", "test2");
  });

  it("minimal replace should allow multiple changes", async () => {
    const updateResp = foxx(
      `config ${mount} test1=test1 test2=test2 --minimal --force`,
      true
    );
    expect(updateResp).to.have.property("values");
    expect(updateResp.values).to.have.property("test1", "test1");
    expect(updateResp.values).to.have.property("test2", "test2");
    const resp = foxx(`config ${mount} --minimal`, true);
    expect(resp).to.have.property("test1", "test1");
    expect(resp).to.have.property("test2", "test2");
  });

  it("should fail when mount is invalid", async () => {
    expect(() => foxx("config /dev/null")).to.throw();
  });

  it("via stdin should be available", async () => {
    const input = '{"test1": "test"}';
    const updateResp = foxx(`config ${mount} @`, true, { input });
    expect(updateResp).to.have.property("test1");
    expect(updateResp.test1).to.have.property("current", "test");
    expect(updateResp.test1).to.not.have.property("warning");
    expect(updateResp).to.have.property("test2");
    expect(updateResp.test2).to.not.have.property("current");
    expect(updateResp.test2).to.not.have.property("warning");
    const resp = foxx(`config ${mount}`, true);
    expect(resp).to.have.property("test1");
    expect(resp.test1).to.have.property("current", "test");
    expect(resp).to.have.property("test2");
    expect(resp.test2).to.not.have.property("current");
  });

  it("via stdin should allow multiple chages", async () => {
    const input = '{"test1": "test1", "test2": "test2"}';
    const updateResp = foxx(`config ${mount} @`, true, { input });
    expect(updateResp).to.have.property("test1");
    expect(updateResp.test1).to.have.property("current", "test1");
    expect(updateResp).to.have.property("test2");
    expect(updateResp.test2).to.have.property("current", "test2");
    const resp = foxx(`config ${mount}`, true);
    expect(resp).to.have.property("test1");
    expect(resp.test1).to.have.property("current", "test1");
    expect(resp).to.have.property("test2");
    expect(resp.test2).to.have.property("current", "test2");
  });
});
