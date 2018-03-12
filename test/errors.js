/* global describe, it, before, after */
"use strict";
const http = require("http");
const path = require("path");
const expect = require("chai").expect;
const foxx = require("./util");
const errors = require("../src/errors");

const basePath = path.resolve(".", "test", "fixtures");
const bundle = path.resolve(basePath, "minimal-working-service.zip");

let HOST;
let ERROR;
const server = http.createServer((req, res) => {
  res.writeHead(500, {
    server: "Fake ArangoDB",
    "content-type": "application/json"
  });
  res.end(
    JSON.stringify({
      error: true,
      code: 500,
      errorNum: ERROR,
      errorMessage: "Something went wrong"
    })
  );
});

describe.only("Error handling", () => {
  before(done => {
    server.listen(e => {
      if (!e) HOST = `tcp://localhost:${server.address().port}`;
      done(e);
    });
  });
  after(done => {
    server.close(e => {
      done(e);
    });
  });
  describe("Foxx config", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`config -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx deps", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`deps -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx download", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`download -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx replace", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`replace -H ${HOST} /myfoxx ${bundle}`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx run", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`run -H ${HOST} /myfoxx send-mail`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx scripts", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`scripts -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx set-dev", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`set-dev -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx set-prod", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`set-prod -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx show", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`show -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx test", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`test -H ${HOST} /myfoxx`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
  describe("Foxx upgrade", () => {
    it("correctly handles SERVICE_NOT_FOUND", async () => {
      ERROR = errors.ERROR_SERVICE_NOT_FOUND;
      try {
        await foxx(`upgrade -H ${HOST} /myfoxx ${bundle}`);
      } catch (e) {
        const stderr = e.stderr.toString("utf-8");
        expect(stderr).not.to.match(/unexpected/i);
        expect(stderr).to.include("/myfoxx");
        return;
      }
      expect.fail();
    });
  });
});