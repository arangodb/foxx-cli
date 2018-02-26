/* global describe, it, before, beforeEach, after */
"use strict";

const path = require("path");
const Database = require("arangojs");
const foxx = require("./util");
const expect = require("chai").expect;
const fs = require("fs");
const os = require("os");

const ARANGO_VERSION = Number(process.env.ARANGO_VERSION || 30000);
const ARANGO_URL = process.env.TEST_ARANGODB_URL || "http://localhost:8529";
const ARANGO_USERNAME = process.env.ARANGO_USERNAME || "root";

const mount = "/download-test";
const basePath = path.resolve(".", "test", "fixtures");
const tmpFile = path.resolve(os.tmpdir(), "minimal-working-service.zip");
const tmpDir = path.resolve(os.tmpdir(), "minimal-working-service");
const tmpServiceDir = path.resolve(tmpDir, "minimal-working-service");
const manifest = path.resolve(tmpServiceDir, "manifest.json");

const rmdir = path => {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);
    for (const file of files) {
      const current = `${path}/${file}`;
      if (fs.lstatSync(current).isDirectory()) {
        rmdir(current);
      } else {
        fs.unlinkSync(current);
      }
    }
    fs.rmdirSync(path);
  }
};

describe("Foxx service download", () => {
  const db = new Database({
    url: ARANGO_URL,
    arangoVersion: ARANGO_VERSION
  });

  before(async () => {
    await db.installService(
      mount,
      path.resolve(basePath, "minimal-working-service.zip")
    );
  });

  after(async () => {
    try {
      await db.uninstallService(mount, { force: true });
    } catch (e) {
      // noop
    }
  });

  beforeEach(async () => {
    if (fs.existsSync(tmpFile)) {
      try {
        fs.unlinkSync(tmpFile);
      } catch (e) {
        // noop
      }
    }
    try {
      rmdir(tmpDir);
    } catch (e) {
      // noop
    }
  });

  it("should output bundle per default", async () => {
    const output = foxx(`download ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("via alias should output bundle per default", async () => {
    const output = foxx(`dl ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("should output bundle with option stdout", async () => {
    const output = foxx(`download --stdout ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("should output bundle with alias of option stdout", async () => {
    const output = foxx(`download -O ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("should output bundle ", async () => {
    const output = foxx(`download ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });
  it("with alternative server URL should output bundle", async () => {
    const output = foxx(`download --server ${ARANGO_URL} ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("with alternative server URL (short option) should output bundle", async () => {
    const output = foxx(`download -H ${ARANGO_URL} ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("with alternative database should output bundle", async () => {
    const output = foxx(`download --database _system ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("with alternative database (short option) should output bundle", async () => {
    const output = foxx(`download -D _system ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("with alternative username should output bundle", async () => {
    const output = foxx(`download --username ${ARANGO_USERNAME} ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("with alternative username should output bundle (short option)", async () => {
    const output = foxx(`download -u ${ARANGO_USERNAME} ${mount}`);
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("should write bundle to outfile", async () => {
    const output = foxx(`download --outfile ${tmpFile} ${mount}`);
    expect(output).to.equal("");
    expect(fs.existsSync(tmpFile)).to.equal(true);
    expect(fs.readFileSync(tmpFile, "utf-8")).to.match(/^PK\u0003\u0004/);
  });

  it("via alias should write bundle to outfile", async () => {
    const output = foxx(`download -o ${tmpFile} ${mount}`);
    expect(output).to.equal("");
    expect(fs.existsSync(tmpFile)).to.equal(true);
    expect(fs.readFileSync(tmpFile, "utf-8")).to.match(/^PK\u0003\u0004/);
  });

  it("should not overwrite outfile per default", async () => {
    fs.writeFileSync(tmpFile, "no");
    expect(() => foxx(`download --outfile ${tmpFile} ${mount}`)).to.throw();
    expect(fs.existsSync(tmpFile)).to.equal(true);
    expect(fs.readFileSync(tmpFile, "utf-8")).to.equal("no");
  });

  it("should overwrite outfile when forced", async () => {
    fs.writeFileSync(tmpFile, "");
    const output = foxx(`download --outfile ${tmpFile} --force ${mount}`);
    expect(output).to.equal("");
    expect(fs.existsSync(tmpFile)).to.equal(true);
    expect(fs.readFileSync(tmpFile, "utf-8")).to.match(/^PK\u0003\u0004/);
  });

  it("should overwrite outfile when forced via alias", async () => {
    fs.writeFileSync(tmpFile, "");
    const output = foxx(`download -o ${tmpFile} -f ${mount}`);
    expect(output).to.equal("");
    expect(fs.existsSync(tmpFile)).to.equal(true);
    expect(fs.readFileSync(tmpFile, "utf-8")).to.match(/^PK\u0003\u0004/);
  });

  it("should extract bundle outfile", async () => {
    const output = foxx(`download --extract --outfile ${tmpDir} ${mount}`);
    expect(output).to.equal("");
    expect(fs.existsSync(manifest)).to.equal(true);
  });

  it("via alias should extract bundle outfile", async () => {
    const output = foxx(`download -x -o ${tmpDir} ${mount}`);
    expect(output).to.equal("");
    expect(fs.existsSync(manifest)).to.equal(true);
  });

  it("should not overwrite outfile per default", async () => {
    fs.mkdirSync(tmpDir);
    fs.mkdirSync(tmpServiceDir);
    expect(() =>
      foxx(`download --extract --outfile ${tmpDir} ${mount}`)
    ).to.throw();
    expect(fs.existsSync(manifest)).to.equal(false);
  });

  it("should overwrite outfile when forced", async () => {
    fs.mkdirSync(tmpDir);
    fs.mkdirSync(tmpServiceDir);
    foxx(`download --extract --outfile ${tmpDir} --force ${mount}`);
    expect(fs.existsSync(manifest)).to.equal(true);
  });

  it("should overwrite outfile when forced via alias", async () => {
    fs.mkdirSync(tmpDir);
    fs.mkdirSync(tmpServiceDir);
    foxx(`download -x -o ${tmpDir} -f ${mount}`);
    expect(fs.existsSync(manifest)).to.equal(true);
  });

  it("should fail when mount is invalid", async () => {
    expect(() => foxx("download /dev/null")).to.throw();
  });
});
