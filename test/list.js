/* global describe, it */
"use strict";

const foxx = require("./util");
const expect = require("chai").expect;

describe("Foxx service list", () => {
  it("should exclude system services", () => {
    const services = foxx("list", true);
    expect(services).to.be.instanceOf(Array);
    expect(services.length).to.equal(0);
  });
});
