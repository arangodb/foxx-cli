/* global describe, it */
"use strict";

const path = require("path");
const foxx = require("./util");
const expect = require("chai").expect;

const basePath = path.resolve(".", "test", "fixtures");

describe("Foxx service list", () => {
  it("should exclude system services", () => {
    const services = foxx("list", true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(0);
  });

  it("should include installed service", async () => {
    const mount = "/list-test";
    try {
      foxx(
        `install ${mount} ${path.resolve(
          basePath,
          "minimal-working-service.zip"
        )}`
      );
      const services = foxx("list", true);
      expect(services).to.be.instanceOf(Array);
      expect(services.length).to.equal(1);
      const service = services.find(service => service.mount === mount);
      expect(service).to.have.property("name", "minimal-working-manifest");
      expect(service).to.have.property("version", "0.0.0");
      expect(service).to.have.property("provides");
      expect(service.provides).to.eql({});
      expect(service).to.have.property("development", false);
      expect(service).to.have.property("legacy", false);
    } finally {
      try {
        foxx(`uninstall ${mount}`);
      } catch (e) {
        // noop
      }
    }
  });
});
