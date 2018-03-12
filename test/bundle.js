/* global describe, it, beforeEach */
"use strict";

const path = require("path");
const foxx = require("./util");
const expect = require("chai").expect;
const os = require("os");
const fs = require("fs");

const basePath = path.resolve(".", "test", "fixtures");
const tmpFile = path.resolve(os.tmpdir(), "minimal-working-service.zip");

describe("Foxx service bundle", () => {
  beforeEach(async () => {
    if (fs.existsSync(tmpFile)) {
      try {
        fs.unlinkSync(tmpFile);
      } catch (e) {
        // noop
      }
    }
  });

  it("should output bundle per default", async () => {
    const output = await foxx(
      `bundle ${path.resolve(basePath, "minimal-working-service")}`
    );
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("via alias should output bundle per default", async () => {
    const output = await foxx(
      `zip ${path.resolve(basePath, "minimal-working-service")}`
    );
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("should output bundle with option stdout", async () => {
    const output = await foxx(
      `bundle --stdout ${path.resolve(basePath, "minimal-working-service")}`
    );
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("should output bundle with alias of option stdout", async () => {
    const output = await foxx(
      `bundle -O ${path.resolve(basePath, "minimal-working-service")}`
    );
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("should write bundle to outfile", async () => {
    const output = await foxx(
      `bundle --outfile ${tmpFile} ${path.resolve(
        basePath,
        "minimal-working-service"
      )}`
    );
    expect(output).to.equal("");
    expect(fs.existsSync(tmpFile)).to.equal(true);
    expect(fs.readFileSync(tmpFile, "utf-8")).to.match(/^PK\u0003\u0004/);
  });

  it("via alias should write bundle to outfile", async () => {
    const output = await foxx(
      `bundle -o ${tmpFile} ${path.resolve(
        basePath,
        "minimal-working-service"
      )}`
    );
    expect(output).to.equal("");
    expect(fs.existsSync(tmpFile)).to.equal(true);
    expect(fs.readFileSync(tmpFile, "utf-8")).to.match(/^PK\u0003\u0004/);
  });

  it("should not overwrite outfile per default", async () => {
    fs.writeFileSync(tmpFile, "no");
    try {
      await foxx(
        `bundle --outfile ${tmpFile} ${path.resolve(
          basePath,
          "minimal-working-service"
        )}`
      );
    } catch (e) {
      expect(fs.existsSync(tmpFile)).to.equal(true);
      expect(fs.readFileSync(tmpFile, "utf-8")).to.equal("no");
      return;
    }
    expect.fail();
  });

  it("should overwrite outfile when forced", async () => {
    fs.writeFileSync(tmpFile, "");
    const output = await foxx(
      `bundle --outfile ${tmpFile} --force ${path.resolve(
        basePath,
        "minimal-working-service"
      )}`
    );
    expect(output).to.equal("");
    expect(fs.existsSync(tmpFile)).to.equal(true);
    expect(fs.readFileSync(tmpFile, "utf-8")).to.match(/^PK\u0003\u0004/);
  });

  it("should overwrite outfile when forced via alias", async () => {
    fs.writeFileSync(tmpFile, "");
    const output = await foxx(
      `bundle -o ${tmpFile} -f ${path.resolve(
        basePath,
        "minimal-working-service"
      )}`
    );
    expect(output).to.equal("");
    expect(fs.existsSync(tmpFile)).to.equal(true);
    expect(fs.readFileSync(tmpFile, "utf-8")).to.match(/^PK\u0003\u0004/);
  });

  it("should refuse when missing manifest", async () => {
    try {
      await foxx(`bundle ${path.resolve(basePath, "sloppy-service")}`);
    } catch (e) {
      return;
    }
    expect.fail();
  });

  it("should refuse when missing manifest even if forced", async () => {
    try {
      await foxx(`bundle -f ${path.resolve(basePath, "sloppy-service")}`);
    } catch (e) {
      return;
    }
    expect.fail();
  });

  it("should bundle even if missing manifest when sloppy", async () => {
    const output = await foxx(
      `bundle --sloppy ${path.resolve(basePath, "sloppy-service")}`
    );
    expect(output).to.match(/^PK\u0003\u0004/);
  });

  it("should not bundle if source does not exist", async () => {
    try {
      await foxx(`bundle ${path.resolve(basePath, "no-such-service")}`);
    } catch (e) {
      return;
    }
    expect.fail();
  });

  it("should output bundle of cwd", async () => {
    const output = await foxx("bundle", false, {
      cwd: path.resolve(basePath, "minimal-working-service")
    });
    expect(output).to.match(/^PK\u0003\u0004/);
  });
});
